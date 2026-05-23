import { createHmac, timingSafeEqual } from "node:crypto";

import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import {
  collectIdempotencyTxids,
  normalizeNowPaymentsTxid,
} from "@/lib/nowpayments-txid";
import { logNowPaymentsWebhook } from "@/lib/nowpayments-webhook-log";
import { createServiceClient } from "@/utils/supabase/service";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

function resolveCanonicalTxid(data: Record<string, unknown>): string | null {
  const paymentIdRaw =
    data.payment_id ?? data.invoice_id ?? data.id ?? data.paymentId;
  return normalizeNowPaymentsTxid(
    typeof paymentIdRaw === "number" || typeof paymentIdRaw === "string"
      ? paymentIdRaw
      : null
  );
}

function resolveCreditAmount(data: Record<string, unknown>): number {
  const priceRaw = data.price_amount ?? data.actually_paid ?? data.pay_amount;
  return typeof priceRaw === "number"
    ? priceRaw
    : typeof priceRaw === "string"
      ? Number(priceRaw)
      : NaN;
}

function rpcErrorStatus(message: string): number {
  if (message.includes("PROFILE_NOT_FOUND")) return 404;
  if (
    message.includes("INVALID_CREDIT_AMOUNT") ||
    message.includes("INVALID_TXID") ||
    message.includes("INVALID_AMOUNT")
  ) {
    return 400;
  }
  return 500;
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
    logNowPaymentsWebhook("INVALID_SIGNATURE", {
      hasSig: Boolean(sig),
      bodyLength: rawBody.length,
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    logNowPaymentsWebhook("INVALID_JSON", { bodyPreview: rawBody.slice(0, 200) });
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const paymentStatus =
    typeof data.payment_status === "string" ? data.payment_status : "";

  if (paymentStatus !== "finished") {
    return NextResponse.json({ ok: true, ignored: true, payment_status: paymentStatus });
  }

  const orderDescription =
    typeof data.order_description === "string"
      ? data.order_description.trim()
      : "";

  if (!orderDescription || !UUID_RE.test(orderDescription)) {
    logNowPaymentsWebhook("INVALID_ORDER_DESCRIPTION", {
      order_description: orderDescription || null,
      payment_status: paymentStatus,
    });
    return NextResponse.json(
      { error: "Invalid or missing order_description (expected user UUID)." },
      { status: 400 }
    );
  }

  const userId = orderDescription;
  const creditAmount = resolveCreditAmount(data);

  if (!Number.isFinite(creditAmount) || creditAmount <= 0) {
    logNowPaymentsWebhook("INVALID_AMOUNT", {
      userId,
      price_amount: data.price_amount,
      actually_paid: data.actually_paid,
      pay_amount: data.pay_amount,
    });
    return NextResponse.json(
      { error: "Invalid or missing payment amount." },
      { status: 400 }
    );
  }

  const canonicalTxid = resolveCanonicalTxid(data);
  if (!canonicalTxid) {
    logNowPaymentsWebhook("MISSING_PAYMENT_ID", { userId, payloadKeys: Object.keys(data) });
    return NextResponse.json(
      { error: "Missing payment_id or invoice_id in webhook payload." },
      { status: 400 }
    );
  }

  const matchTxids = collectIdempotencyTxids(data);
  if (matchTxids.length === 0) {
    logNowPaymentsWebhook("EMPTY_IDEMPOTENCY_KEYS", { userId, canonicalTxid });
    return NextResponse.json(
      { error: "Could not derive idempotency keys from payload." },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();
  if (!supabase) {
    logNowPaymentsWebhook("SERVER_MISCONFIGURED", { userId });
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 });
  }

  const credit = Math.round(creditAmount * 100) / 100;

  const { data: rpcResult, error: rpcError } = await supabase.rpc(
    "complete_crypto_deposit",
    {
      p_user_id: userId,
      p_canonical_txid: canonicalTxid,
      p_credit_amount: credit,
      p_match_txids: matchTxids,
    }
  );

  if (rpcError) {
    const status = rpcErrorStatus(rpcError.message);
    logNowPaymentsWebhook("RPC_FAILED", {
      userId,
      canonicalTxid,
      matchTxids,
      credit,
      message: rpcError.message,
      status,
    });
    return NextResponse.json(
      { error: rpcError.message },
      { status }
    );
  }

  const status =
    typeof rpcResult === "object" &&
    rpcResult !== null &&
    "status" in rpcResult &&
    typeof (rpcResult as { status: unknown }).status === "string"
      ? (rpcResult as { status: string }).status
      : "unknown";

  if (status === "idempotent" || status === "duplicate") {
    return NextResponse.json({ ok: true, status });
  }

  if (status === "completed") {
    revalidatePath("/dashboard");
    return NextResponse.json({ ok: true, status: "completed" });
  }

  logNowPaymentsWebhook("UNEXPECTED_RPC_RESULT", {
    userId,
    canonicalTxid,
    rpcResult,
  });
  return NextResponse.json({ error: "Unexpected completion result." }, { status: 500 });
}
