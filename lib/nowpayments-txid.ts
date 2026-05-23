/** Normalize NowPayments invoice / payment identifiers into `deposits.txid` values. */
export function normalizeNowPaymentsTxid(
  raw: string | number | null | undefined
): string | null {
  if (raw === null || raw === undefined) return null;
  const trimmed = String(raw).trim();
  if (!trimmed) return null;
  return trimmed.startsWith("np-") ? trimmed : `np-${trimmed}`;
}

/** Collect every plausible txid from an IPN payload for idempotency / pending matching. */
export function collectIdempotencyTxids(data: Record<string, unknown>): string[] {
  const out = new Set<string>();
  const keys = [
    "payment_id",
    "invoice_id",
    "id",
    "paymentId",
    "order_id",
  ] as const;

  for (const k of keys) {
    const normalized = normalizeNowPaymentsTxid(
      typeof data[k] === "number" || typeof data[k] === "string"
        ? data[k]
        : null
    );
    if (normalized) out.add(normalized);
  }

  return [...out];
}

export function extractInvoiceId(
  payload: Record<string, unknown>
): string | null {
  const raw = payload.id ?? payload.invoice_id;
  if (typeof raw === "number" && Number.isFinite(raw)) return String(raw);
  if (typeof raw === "string" && raw.trim().length > 0) return raw.trim();
  return null;
}
