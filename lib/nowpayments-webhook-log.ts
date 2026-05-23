export function logNowPaymentsWebhook(
  code: string,
  details: Record<string, unknown>
) {
  console.error(
    `[nowpayments-webhook] ${code}`,
    JSON.stringify({ ...details, at: new Date().toISOString() })
  );
}
