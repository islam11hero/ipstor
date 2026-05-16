import { NextResponse } from "next/server";

import {
  getNowPaymentsIpnUrl,
  getNowPaymentsSuccessUrl,
} from "@/lib/nowpayments-urls";
import { createClient } from "@/utils/supabase/server";

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

  // Revenue-critical: production defaults to https://ipnova.online (see lib/nowpayments-urls).
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

  return NextResponse.json({ invoice_url });
}
