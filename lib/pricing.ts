export const DATACENTER_PRICE_PER_IP = 1.5;
export const RESIDENTIAL_PRICE_PER_GB = 4.0;
export const STATIC_RESIDENTIAL_PRICE_PER_IP = 9.99;
export const ISP_PRICE_PER_IP = 12.0;
export const MOBILE_PRICE_PER_IP = 14.99;

export type ProxyProduct =
  | "datacenter"
  | "residential"
  | "static_residential"
  | "isp"
  | "mobile";

export type ProductUnit = "ip" | "gb";

export type ProductDefinition = {
  id: ProxyProduct;
  label: string;
  shortLabel: string;
  description: string;
  unit: ProductUnit;
  pricePerUnit: number;
  /** All catalog SKUs are operator-fulfilled after payment. */
  manualFulfillment: true;
};

export const PROXY_PRODUCTS: ProductDefinition[] = [
  {
    id: "datacenter",
    label: "Datacenter proxies",
    shortLabel: "Datacenter",
    description: "High-speed dedicated IPs for automation, scraping, and bulk tasks.",
    unit: "ip",
    pricePerUnit: DATACENTER_PRICE_PER_IP,
    manualFulfillment: true,
  },
  {
    id: "residential",
    label: "Residential proxies",
    shortLabel: "Residential",
    description: "Rotating ISP traffic priced per gigabyte for strict targets.",
    unit: "gb",
    pricePerUnit: RESIDENTIAL_PRICE_PER_GB,
    manualFulfillment: true,
  },
  {
    id: "static_residential",
    label: "Static residential",
    shortLabel: "Static residential",
    description: "Dedicated residential IPs with sticky sessions—fulfilled manually.",
    unit: "ip",
    pricePerUnit: STATIC_RESIDENTIAL_PRICE_PER_IP,
    manualFulfillment: true,
  },
  {
    id: "isp",
    label: "ISP proxies",
    shortLabel: "ISP",
    description: "Carrier-grade ISP IPs for ad verification and account workflows.",
    unit: "ip",
    pricePerUnit: ISP_PRICE_PER_IP,
    manualFulfillment: true,
  },
  {
    id: "mobile",
    label: "Mobile proxies",
    shortLabel: "Mobile",
    description: "4G/LTE mobile IPs for app and social automation—manual provisioning.",
    unit: "ip",
    pricePerUnit: MOBILE_PRICE_PER_IP,
    manualFulfillment: true,
  },
];

const PRODUCT_BY_ID = Object.fromEntries(
  PROXY_PRODUCTS.map((p) => [p.id, p])
) as Record<ProxyProduct, ProductDefinition>;

export function getProduct(proxyType: string): ProductDefinition | null {
  return PRODUCT_BY_ID[proxyType as ProxyProduct] ?? null;
}

export function isProxyProduct(value: string): value is ProxyProduct {
  return value in PRODUCT_BY_ID;
}

export function calculateOrderTotal(
  proxyType: ProxyProduct,
  quantity: number
): number {
  const product = PRODUCT_BY_ID[proxyType];
  return Math.round(product.pricePerUnit * quantity * 100) / 100;
}

export function formatProductUnitPrice(product: ProductDefinition): string {
  const amount = product.pricePerUnit.toFixed(2);
  return product.unit === "gb" ? `$${amount}/GB` : `$${amount}/IP`;
}

export function formatProductQuantityLabel(
  product: ProductDefinition,
  quantity: number
): string {
  if (product.unit === "gb") {
    return `${quantity} GB`;
  }
  return `${quantity} IP${quantity === 1 ? "" : "s"}`;
}

export function formatProductTypeLabel(proxyType: string): string {
  return getProduct(proxyType)?.shortLabel ?? proxyType.replace(/_/g, " ");
}
