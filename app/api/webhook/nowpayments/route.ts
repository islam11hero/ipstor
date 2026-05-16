import { createHmac, timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function verifyNowPaymentsSignature(
  rawBody: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;
  const expectedHex = createHmac("sha512", secret)
    .update(rawBody, "utf8")
    .digest("hex");
  const sig = signature.trim().toLowerCase();
  const exp = expectedHex.toLowerCase();
  if (sig.length !== exp.length) return false;
  try {
    return timingSafeEqual(Buffer.from(sig, "utf8"), Buffer.from(exp, "utf8"));
  } catch {
    return false;
  }
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** All plausible Supabase `deposits.txid` values for this IPN payload (idempotency). */
function collectIdempotencyTxids(data: Record<string, unknown>): string[] {
  const out = new Set<string>();
  const keys = [
    "payment_id",
    "invoice_id",
    "id",
    "paymentId",
    "order_id",
  ] as const;
  for (const k of keys) {
    const raw = data[k];
    if (typeof raw === "number" && Number.isFinite(raw)) {
      out.add(`np-${raw}`);
    }
    if (typeof raw === "string" && raw.trim().length > 0) {
      const t = raw.trim();
      out.add(t.startsWith("np-") ? t : `np-${t}`);
    }
  }
  return [...out];
}

export async function POST(request: Request) {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  const sig =
    request.headers.get("x-nowpayments-sig") ??
    request.headers.get("X-Nowpayments-Sig") ??
    request.headers.get("x-Nowpayments-Sig");

  if (!verifyNowPaymentsSignature(rawBody, sig, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const paymentStatus =
    typeof data.payment_status === "string" ? data.payment_status : "";
  if (paymentStatus !== "finished") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const orderDescription =
    typeof data.order_description === "string"
      ? data.order_description.trim()
      : "";
  if (!orderDescription || !UUID_RE.test(orderDescription)) {
    return NextResponse.json({ ok: true, skipped: true });
  }
  const userId = orderDescription;

  const priceRaw = data.price_amount ?? data.actually_paid ?? data.pay_amount;
  const priceAmount =
    typeof priceRaw === "number"
      ? priceRaw
      : typeof priceRaw === "string"
        ? Number(priceRaw)
        : NaN;
  if (!Number.isFinite(priceAmount) || priceAmount <= 0) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const paymentIdRaw =
    data.payment_id ?? data.invoice_id ?? data.id ?? data.paymentId;
  const txid =
    typeof paymentIdRaw === "number"
      ? `np-${paymentIdRaw}`
      : typeof paymentIdRaw === "string" && paymentIdRaw.length > 0
        ? `np-${paymentIdRaw}`
        : null;
  if (!txid) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 });
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const idempotencyKeys = collectIdempotencyTxids(data);
  if (idempotencyKeys.length === 0) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const { data: priorApproved, error: priorErr } = await supabase
    .from("deposits")
    .select("id,txid,status")
    .in("txid", idempotencyKeys)
    .eq("status", "approved")
    .limit(1);

  if (priorErr) {
    return NextResponse.json({ error: priorErr.message }, { status: 500 });
  }

  if (priorApproved && priorApproved.length > 0) {
    return NextResponse.json({ ok: true, idempotent: true });
  }

  const { data: existingRow } = await supabase
    .from("deposits")
    .select("id")
    .eq("txid", txid)
    .maybeSingle();

  if (existingRow) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", userId)
    .maybeSingle();

  if (profileErr || !profile) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const current = Number(profile.balance ?? 0);
  const credit = Math.round(priceAmount * 100) / 100;
  const newBalance = Math.round((current + credit) * 100) / 100;

  const { error: balanceErr } = await supabase
    .from("profiles")
    .update({ balance: newBalance })
    .eq("id", userId);

  if (balanceErr) {
    return NextResponse.json({ error: balanceErr.message }, { status: 500 });
  }

  const { error: depositErr } = await supabase.from("deposits").insert({
    user_id: userId,
    amount: credit,
    txid,
    status: "approved",
  });

  if (depositErr) {
    await supabase.from("profiles").update({ balance: current }).eq("id", userId);
    return NextResponse.json({ error: depositErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
