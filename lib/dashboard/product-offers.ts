import type { ProxyProduct } from "@/lib/pricing";

export type ProductOfferVisual = {
  image: string;
  tagline: string;
  highlight: string;
};

export const PRODUCT_OFFER_VISUALS: Record<ProxyProduct, ProductOfferVisual> = {
  datacenter: {
    image: "/offers/offer-datacenter.png",
    tagline: "Throughput-first IPs for bulk automation",
    highlight: "Best for APIs & high QPS",
  },
  residential: {
    image: "/offers/offer-residential.png",
    tagline: "Real ISP egress for strict targets",
    highlight: "Rotation & geo precision",
  },
  static_residential: {
    image: "/offers/offer-static-residential.png",
    tagline: "Sticky home-user sessions",
    highlight: "Accounts & long flows",
  },
  isp: {
    image: "/offers/offer-isp.png",
    tagline: "Carrier-grade dedicated ASN",
    highlight: "Ad verify & checkout",
  },
  mobile: {
    image: "/offers/offer-mobile.png",
    tagline: "4G / 5G mobile fingerprints",
    highlight: "Apps & social stacks",
  },
};

export const DASHBOARD_PROMO_BANNERS = [
  {
    id: "topup",
    image: "/offers/promo-topup-scale.png",
    title: "Top up. Deploy. Scale.",
    description: "Fund your wallet with crypto, pick a proxy class, and we fulfill manually with live credentials.",
    cta: "Add funds",
    view: "funds" as const,
  },
  {
    id: "choose",
    image: "/offers/promo-choose-proxy.png",
    title: "Five proxy classes, one console",
    description: "Datacenter speed, residential trust, ISP stability, mobile realism—priced transparently.",
    cta: "Browse products",
    view: "overview" as const,
  },
] as const;
