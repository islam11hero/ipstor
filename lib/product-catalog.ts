import {
  getProduct,
  isProxyProduct,
  type ProductDefinition,
  type ProxyProduct,
} from "@/lib/pricing";

export type PricingTier = {
  id: string;
  label: string;
  description: string;
  unitMultiplier: number;
  badge?: string;
};

export type ProductAddon = {
  id: string;
  label: string;
  description: string;
  pricing:
    | { kind: "per_unit"; amount: number }
    | { kind: "flat"; amount: number };
  popular?: boolean;
};

export type ProductPageConfig = {
  productId: ProxyProduct;
  tagline: string;
  highlights: string[];
  tiers: PricingTier[];
  addons: ProductAddon[];
  suggestedQuantities: number[];
};

export type OrderLineItem = {
  label: string;
  amount: number;
};

export type OrderQuote = {
  unitPrice: number;
  baseSubtotal: number;
  tierLabel: string;
  tierSurcharge: number;
  addonLines: OrderLineItem[];
  addonTotal: number;
  total: number;
};

const STANDARD_TIER: PricingTier = {
  id: "standard",
  label: "Standard",
  description: "Core pool access with manual operator fulfillment.",
  unitMultiplier: 1,
};

function tier(id: string, label: string, description: string, unitMultiplier: number, badge?: string): PricingTier {
  return { id, label, description, unitMultiplier, badge };
}

export const PRODUCT_PAGE_CONFIGS: Record<ProxyProduct, ProductPageConfig> = {
  datacenter: {
    productId: "datacenter",
    tagline: "Wire-speed IPs for parallel crawls, audits, and batch automation.",
    highlights: [
      "HTTP/HTTPS/SOCKS5 on one credential",
      "Lowest $/request in the catalog",
      "Ideal for high-concurrency scrapers",
    ],
    tiers: [
      STANDARD_TIER,
      tier(
        "business",
        "Business",
        "Priority routing queue and faster operator SLA.",
        1.18,
        "Popular"
      ),
      tier(
        "enterprise",
        "Enterprise",
        "Dedicated subnet planning and named escalation path.",
        1.32
      ),
    ],
    addons: [
      {
        id: "dc_priority_routing",
        label: "Priority routing lane",
        description: "Jump the shared queue during peak hours.",
        pricing: { kind: "per_unit", amount: 0.35 },
        popular: true,
      },
      {
        id: "dc_dedicated_subnet",
        label: "Dedicated /24 subnet",
        description: "Non-shared subnet assignment for blast-radius control.",
        pricing: { kind: "per_unit", amount: 0.55 },
      },
      {
        id: "dc_ipv6_dual",
        label: "IPv6 dual-stack",
        description: "Parallel v6 egress alongside IPv4 credentials.",
        pricing: { kind: "per_unit", amount: 0.28 },
      },
      {
        id: "dc_sla_pack",
        label: "99.9% SLA pack",
        description: "Contract-style uptime envelope for qualified volumes.",
        pricing: { kind: "flat", amount: 4.99 },
      },
    ],
    suggestedQuantities: [10, 25, 50, 100],
  },

  residential: {
    productId: "residential",
    tagline: "Real ISP traffic priced per GB for strict anti-bot targets.",
    highlights: [
      "Ethical residential ASN mix",
      "Rotation or sticky session policies",
      "Best for SERP, retail, and social surfaces",
    ],
    tiers: [
      STANDARD_TIER,
      tier(
        "pro",
        "Pro",
        "City-level steering and richer session controls.",
        1.22,
        "Best value"
      ),
      tier(
        "max",
        "Max",
        "Premium ASN pools with concierge onboarding.",
        1.45
      ),
    ],
    addons: [
      {
        id: "res_sticky_sessions",
        label: "Extended sticky sessions",
        description: "Longer TTL identity pins for multi-step flows.",
        pricing: { kind: "per_unit", amount: 0.85 },
        popular: true,
      },
      {
        id: "res_city_targeting",
        label: "City-level targeting",
        description: "Metro-fidelity routing beyond country-only filters.",
        pricing: { kind: "per_unit", amount: 1.25 },
      },
      {
        id: "res_premium_asn",
        label: "Premium ASN pool",
        description: "Curated carriers with lower block-rate envelopes.",
        pricing: { kind: "per_unit", amount: 1.6 },
      },
      {
        id: "res_unlimited_rotation",
        label: "Aggressive rotation pack",
        description: "Per-request refresh policy tuned for harvest jobs.",
        pricing: { kind: "flat", amount: 6.5 },
      },
    ],
    suggestedQuantities: [5, 10, 25, 50],
  },

  static_residential: {
    productId: "static_residential",
    tagline: "Sticky residential identities for accounts, carts, and KYC flows.",
    highlights: [
      "Same IP for the life of the lease",
      "Residential ASN trust signals",
      "Manual provisioning with QA check",
    ],
    tiers: [
      STANDARD_TIER,
      tier(
        "business",
        "Business",
        "90-day lease window and refresh scheduling.",
        1.2,
        "Popular"
      ),
      tier(
        "enterprise",
        "Enterprise",
        "Dedicated refresh SLA and compliance packet.",
        1.38,
      ),
    ],
    addons: [
      {
        id: "static_extended_lease",
        label: "Extended 90-day lease",
        description: "Lock identity beyond the default billing window.",
        pricing: { kind: "per_unit", amount: 2.75 },
        popular: true,
      },
      {
        id: "static_carrier_letter",
        label: "Carrier verification letter",
        description: "ASN proof document for procurement reviews.",
        pricing: { kind: "flat", amount: 7.5 },
      },
      {
        id: "static_refresh_window",
        label: "Dedicated refresh window",
        description: "Scheduled IP refresh without full reprovision.",
        pricing: { kind: "per_unit", amount: 1.85 },
      },
    ],
    suggestedQuantities: [1, 5, 10, 25],
  },

  isp: {
    productId: "isp",
    tagline: "Carrier-grade ISP IPs for ads, accounts, and verification stacks.",
    highlights: [
      "Static ISP ASN fingerprints",
      "Checkout and ad-tech friendly",
      "Higher trust than datacenter bulk",
    ],
    tiers: [
      STANDARD_TIER,
      tier(
        "business",
        "Business",
        "Social-platform optimized routing profile.",
        1.15,
        "Popular"
      ),
      tier(
        "enterprise",
        "Enterprise",
        "Same-ASN refresh and named TAM support.",
        1.28,
      ),
    ],
    addons: [
      {
        id: "isp_social_optimized",
        label: "Social platform optimized",
        description: "Header/TLS profiles tuned for major social surfaces.",
        pricing: { kind: "per_unit", amount: 3.25 },
        popular: true,
      },
      {
        id: "isp_ad_verification",
        label: "Ad verification suite",
        description: "Geo-fidelity pack for ad-tech and brand safety QA.",
        pricing: { kind: "per_unit", amount: 2.45 },
      },
      {
        id: "isp_same_asn_refresh",
        label: "Same-ASN refresh",
        description: "Refresh within the same carrier graph when needed.",
        pricing: { kind: "per_unit", amount: 4.25 },
      },
    ],
    suggestedQuantities: [1, 5, 10, 20],
  },

  mobile: {
    productId: "mobile",
    tagline: "4G/LTE mobile IPs for app stores, social, and device automation.",
    highlights: [
      "Real mobile carrier backhaul",
      "Highest trust tier in catalog",
      "Ideal for app and emulator stacks",
    ],
    tiers: [
      STANDARD_TIER,
      tier(
        "business",
        "Business",
        "5G-priority handoffs where available.",
        1.12,
        "Popular"
      ),
      tier(
        "enterprise",
        "Enterprise",
        "SIM rotation control and app-store geo lock.",
        1.25,
      ),
    ],
    addons: [
      {
        id: "mobile_5g_priority",
        label: "5G priority lane",
        description: "Prefer 5G backhaul over legacy LTE paths.",
        pricing: { kind: "per_unit", amount: 5.5 },
        popular: true,
      },
      {
        id: "mobile_sim_rotation",
        label: "SIM rotation control",
        description: "Operator-managed SIM swaps on a defined cadence.",
        pricing: { kind: "per_unit", amount: 3.75 },
      },
      {
        id: "mobile_appstore_geo",
        label: "App-store geo lock",
        description: "Pin store region metadata to target market.",
        pricing: { kind: "per_unit", amount: 2.25 },
      },
    ],
    suggestedQuantities: [1, 3, 5, 10],
  },
};

export function getProductPageConfig(productId: ProxyProduct): ProductPageConfig {
  return PRODUCT_PAGE_CONFIGS[productId];
}

export {
  isProductDashboardView,
  productFromViewSlug,
  viewSlugForProduct,
} from "@/lib/product-routing";

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function getTier(config: ProductPageConfig, tierId: string): PricingTier {
  return config.tiers.find((tier) => tier.id === tierId) ?? config.tiers[0]!;
}

function getAddon(config: ProductPageConfig, addonId: string): ProductAddon | null {
  return config.addons.find((addon) => addon.id === addonId) ?? null;
}

export function calculateOrderQuote(input: {
  proxyType: ProxyProduct;
  quantity: number;
  tierId: string;
  addonIds: string[];
}): OrderQuote {
  const product = getProduct(input.proxyType)!;
  const config = getProductPageConfig(input.proxyType);
  const tier = getTier(config, input.tierId);
  const quantity = input.quantity;

  const unitPrice = roundMoney(product.pricePerUnit * tier.unitMultiplier);
  const baseSubtotal = roundMoney(unitPrice * quantity);
  const standardSubtotal = roundMoney(product.pricePerUnit * quantity);
  const tierSurcharge = roundMoney(Math.max(0, baseSubtotal - standardSubtotal));

  const addonLines: OrderLineItem[] = [];
  let addonTotal = 0;

  for (const addonId of input.addonIds) {
    const addon = getAddon(config, addonId);
    if (!addon) continue;

    const amount =
      addon.pricing.kind === "flat"
        ? addon.pricing.amount
        : roundMoney(addon.pricing.amount * quantity);

    addonLines.push({ label: addon.label, amount });
    addonTotal = roundMoney(addonTotal + amount);
  }

  return {
    unitPrice,
    baseSubtotal,
    tierLabel: tier.label,
    tierSurcharge,
    addonLines,
    addonTotal,
    total: roundMoney(baseSubtotal + addonTotal),
  };
}

export function validateOrderSelection(input: {
  proxyType: ProxyProduct;
  tierId: string;
  addonIds: string[];
}): { tierId: string; addonIds: string[] } | { error: string } {
  const config = getProductPageConfig(input.proxyType);
  const tier = config.tiers.find((item) => item.id === input.tierId);
  if (!tier) {
    return { error: "Invalid pricing tier." };
  }

  const addonIds: string[] = [];
  for (const addonId of input.addonIds) {
    if (!config.addons.some((addon) => addon.id === addonId)) {
      return { error: "Invalid add-on selection." };
    }
    if (!addonIds.includes(addonId)) {
      addonIds.push(addonId);
    }
  }

  return { tierId: tier.id, addonIds };
}

export function describeOrderExtras(
  proxyType: string,
  tierId?: string | null,
  addonIds?: string[] | null
): string | null {
  if (!isProxyProduct(proxyType)) return null;
  const config = getProductPageConfig(proxyType);
  const parts: string[] = [];

  const tier = config.tiers.find((item) => item.id === tierId);
  if (tier && tier.id !== "standard") {
    parts.push(tier.label);
  }

  for (const addonId of addonIds ?? []) {
    const addon = config.addons.find((item) => item.id === addonId);
    if (addon) parts.push(addon.label);
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

export function formatTierUnitPrice(
  product: ProductDefinition,
  tier: PricingTier
): string {
  const amount = roundMoney(product.pricePerUnit * tier.unitMultiplier).toFixed(2);
  return product.unit === "gb" ? `$${amount}/GB` : `$${amount}/IP`;
}
