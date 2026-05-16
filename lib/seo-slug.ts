/** Turn `residential-proxies` into "Residential Proxies" for titles and hero copy. */
export function formatSlugTitle(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export const SEO_CATEGORIES = [
  "products",
  "tools",
  "locations",
  "resources",
  "company",
  "legal",
] as const;

export type SeoCategory = (typeof SEO_CATEGORIES)[number];

export function isSeoCategory(value: string): value is SeoCategory {
  return (SEO_CATEGORIES as readonly string[]).includes(value);
}
