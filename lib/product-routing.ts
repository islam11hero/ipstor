import { isProxyProduct, type ProxyProduct } from "@/lib/pricing";

export function viewSlugForProduct(productId: ProxyProduct): string {
  return productId === "static_residential" ? "static-residential" : productId;
}

export function productFromViewSlug(slug: string): ProxyProduct | null {
  const normalized = slug.trim().toLowerCase().replace(/-/g, "_");
  if (isProxyProduct(normalized)) {
    return normalized;
  }
  return null;
}

export function isProductDashboardView(view: string): view is ProxyProduct {
  return isProxyProduct(view);
}
