const DEFAULT_SITE = "https://ipnova.online";

/**
 * Base URL for NowPayments success / IPN callbacks.
 * - `NEXT_PUBLIC_SITE_URL` wins when set (e.g. local `http://localhost:3000`).
 * - On Vercel **production**, use the live custom domain, not `*.vercel.app`.
 * - Preview deployments keep the deployment URL for isolated testing.
 */
export function getSiteBaseUrl(): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (site) {
    return site.replace(/\/$/, "");
  }

  if (process.env.VERCEL_ENV === "production") {
    return DEFAULT_SITE;
  }

  const vercel = process.env.NEXT_PUBLIC_VERCEL_URL?.trim();
  if (vercel) {
    const withProto = vercel.startsWith("http") ? vercel : `https://${vercel}`;
    return withProto.replace(/\/$/, "");
  }

  return DEFAULT_SITE;
}

export function getNowPaymentsIpnUrl(): string {
  return (
    process.env.NOWPAYMENTS_IPN_CALLBACK_URL ??
    `${getSiteBaseUrl()}/api/webhook/nowpayments`
  );
}

export function getNowPaymentsSuccessUrl(): string {
  return (
    process.env.NOWPAYMENTS_SUCCESS_URL ?? `${getSiteBaseUrl()}/dashboard`
  );
}
