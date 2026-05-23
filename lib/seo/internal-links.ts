import { formatSlugTitle } from "@/lib/seo-slug";
import { SEO_NAV_PATHS, programmaticPath } from "@/lib/seo-sitemap-paths";
import type { SeoCategory } from "@/lib/seo-slug";

import { countInRange, hashSlot, pickFromPool } from "./hash-slug";
import type { SeoRelatedLink } from "./types";

const ANCHOR_FRAMES = [
  (label: string) => `${label} routing brief`,
  (label: string) => `Explore ${label}`,
  (label: string) => `${label} — operator notes`,
  (label: string) => `Adjacent SKU: ${label}`,
  (label: string) => `Compare ${label} pools`,
  (label: string) => `${label} procurement context`,
  (label: string) => `Field guide: ${label}`,
] as const;

const CATEGORY_PRIORITY: Record<SeoCategory, SeoCategory[]> = {
  products: ["products", "locations", "resources", "tools"],
  locations: ["locations", "products", "resources", "tools"],
  tools: ["tools", "resources", "products", "locations"],
  resources: ["resources", "tools", "products", "company"],
  company: ["company", "legal", "resources", "products"],
  legal: ["legal", "company", "resources", "products"],
};

export function buildRelatedLinks(
  category: SeoCategory,
  slug: string
): SeoRelatedLink[] {
  const seed = `${category}:${slug}:links`;
  const count = countInRange(seed, 0, 3, 5);
  const currentPath = programmaticPath({ category, slug });

  const candidates = SEO_NAV_PATHS.filter(
    (p) => programmaticPath(p) !== currentPath
  );

  const priority = CATEGORY_PRIORITY[category];
  const sorted = [...candidates].sort((a, b) => {
    const aScore = priority.indexOf(a.category as SeoCategory);
    const bScore = priority.indexOf(b.category as SeoCategory);
    const aRank = aScore === -1 ? 99 : aScore;
    const bRank = bScore === -1 ? 99 : bScore;
    if (aRank !== bRank) return aRank - bRank;
    return hashSlot(seed, a.slug.length) - hashSlot(seed, b.slug.length);
  });

  const links: SeoRelatedLink[] = [];
  let offset = hashSlot(seed, 1);

  for (let i = 0; links.length < count && i < sorted.length * 2; i++) {
    const item = sorted[(offset + i) % sorted.length]!;
    const href = programmaticPath(item);
    if (links.some((l) => l.href === href)) continue;

    const label = formatSlugTitle(item.slug);
    const frame = pickFromPool(ANCHOR_FRAMES, seed, links.length + 3);
    links.push({
      href,
      label,
      anchor: frame(label),
    });
  }

  return links;
}
