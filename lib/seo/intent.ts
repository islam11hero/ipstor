import type { SeoCategory } from "@/lib/seo-slug";

import type { SeoIntent } from "./types";

export function resolveIntent(category: SeoCategory): SeoIntent {
  if (category === "legal" || category === "company") {
    return "compliance";
  }
  if (category === "resources") {
    return "educational";
  }
  return "commercial";
}
