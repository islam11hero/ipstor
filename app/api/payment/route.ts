import { NextResponse } from "next/server";

import {
  extractInvoiceId,
  normalizeNowPaymentsTxid,
} from "@/lib/nowpayments-txid";
import {
  getNowPaymentsIpnUrl,
  getNowPaymentsSuccessUrl,
} from "@/lib/nowpayments-urls";
import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";

const INVOICE_URL = "https://api.nowpayments.io/v1/invoice";

export async function POST(request: Request) {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Payment service is not configured." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const amount =
    typeof body === "object" &&
    body !== null &&
    "amount" in body &&
    typeof (body as { amount: unknown }).amount === "number"
      ? (body as { amount: number }).amount
      : typeof body === "object" &&
          body !== null &&
          "amount" in body &&
          typeof (body as { amount: unknown }).amount === "string"
        ? Number((body as { amount: string }).amount)
        : NaN;

  if (!Number.isFinite(amount) || amount < 1 || amount > 100_000) {
    return NextResponse.json(
      { error: "Enter a valid amount between $1 and $100,000." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const price_amount = Math.round(amount * 100) / 100;

  const invoicePayload = {
    price_amount,
    price_currency: "usd",
    ipn_callback_url: getNowPaymentsIpnUrl(),
    success_url: getNowPaymentsSuccessUrl(),
    order_description: user.id,
  };

  const npRes = await fetch(INVOICE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(invoicePayload),
  });

  const npText = await npRes.text();
  let npJson: Record<string, unknown> = {};
  try {
    npJson = npText ? (JSON.parse(npText) as Record<string, unknown>) : {};
  } catch {
    return NextResponse.json(
      { error: "Payment provider returned an invalid response." },
      { status: 502 }
    );
  }

  if (!npRes.ok) {
    const message =
      typeof npJson.message === "string"
        ? npJson.message
        : `NowPayments error (${npRes.status})`;
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const invoice_url = npJson.invoice_url;
  if (typeof invoice_url !== "string" || !invoice_url.startsWith("http")) {
    return NextResponse.json(
      { error: "Payment provider did not return an invoice URL." },
      { status: 502 }
    );
  }

  const invoiceId = extractInvoiceId(npJson);
  const pendingTxid = normalizeNowPaymentsTxid(invoiceId);

  if (!pendingTxid) {
    console.error("[api/payment] Missing invoice id in NowPayments response", {
      userId: user.id,
      responseKeys: Object.keys(npJson),
    });
    return NextResponse.json(
      { error: "Payment provider did not return an invoice identifier." },
      { status: 502 }
    );
  }

  const serviceSupabase = createServiceClient();
  if (!serviceSupabase) {
    console.error("[api/payment] SUPABASE_SERVICE_ROLE_KEY not configured");
    return NextResponse.json(
      { error: "Payment tracking is not configured on the server." },
      { status: 503 }
    );
  }

  const { data: pendingResult, error: pendingError } =
    await serviceSupabase.rpc("create_pending_crypto_deposit", {
      p_user_id: user.id,
      p_amount: price_amount,
      p_txid: pendingTxid,
    });

  if (pendingError) {
    console.error("[api/payment] create_pending_crypto_deposit failed", {
      userId: user.id,
      pendingTxid,
      amount: price_amount,
      message: pendingError.message,
    });
    return NextResponse.json(
      { error: "Could not register pending deposit. Please try again." },
      { status: 500 }
    );
  }

  const pendingStatus =
    typeof pendingResult === "object" &&
    pendingResult !== null &&
    "status" in pendingResult &&
    typeof (pendingResult as { status: unknown }).status === "string"
      ? (pendingResult as { status: string }).status
      : null;

  if (pendingStatus === "already_approved") {
    console.error("[api/payment] Invoice txid already approved", {
      userId: user.id,
      pendingTxid,
    });
    return NextResponse.json(
      { error: "This invoice was already credited." },
      { status: 409 }
    );
  }

  return NextResponse.json({ invoice_url, pending_txid: pendingTxid });
}
