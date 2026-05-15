const DEFAULT_SITE = "https://ipstor.vercel.app";

export function getSiteBaseUrl(): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (site) {
    return site.replace(/\/$/, "");
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
