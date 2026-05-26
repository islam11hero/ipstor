import type { ProxyProduct } from "@/lib/pricing";

export type ProductOfferVisual = {
  /** Transparent SVG artwork */
  artwork: string;
  tagline: string;
  highlight: string;
};

export const PRODUCT_OFFER_VISUALS: Record<ProxyProduct, ProductOfferVisual> = {
  datacenter: {
    artwork: "/offers/datacenter-proxy.svg",
    tagline: "High-speed IPs for bulk automation",
    highlight: "Best for APIs & high QPS",
  },
  residential: {
    artwork: "/offers/residential-proxy.svg",
    tagline: "Real ISP egress for strict targets",
    highlight: "Rotation & geo precision",
  },
  static_residential: {
    artwork: "/offers/static-residential-proxy.svg",
    tagline: "Sticky home-user sessions",
    highlight: "Accounts & long flows",
  },
  isp: {
    artwork: "/offers/isp-proxy.svg",
    tagline: "Carrier-grade dedicated ASN",
    highlight: "Ad verify & checkout",
  },
  mobile: {
    artwork: "/offers/mobile-proxy.svg",
    tagline: "4G / 5G mobile fingerprints",
    highlight: "Apps & social stacks",
  },
};

export const DASHBOARD_PROMO_STRIPS = [
  {
    id: "topup",
    title: "Fund your wallet in minutes",
    description: "Crypto checkout via NOWPayments — balance updates when payment clears.",
    cta: "Add funds",
    view: "funds" as const,
    accent: "from-emerald-500/15 to-cyan-500/10",
  },
  {
    id: "catalog",
    title: "Pick the right proxy class",
    description: "Five SKUs with transparent unit pricing. Orders debit instantly; we fulfill manually.",
    cta: "View catalog",
    view: "overview" as const,
    accent: "from-cyan-500/10 to-emerald-500/10",
  },
] as const;
