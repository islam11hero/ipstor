import type { MetadataRoute } from "next";

import {
  SEO_NAV_PATHS,
  STATIC_SITEMAP_PATHS,
  programmaticPath,
} from "@/lib/seo-sitemap-paths";
import { SITE_URL } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_SITEMAP_PATHS.map(
    (path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency: path === "" ? "weekly" : "monthly",
      priority: path === "" ? 1 : path.startsWith("/tools") ? 0.75 : 0.7,
    })
  );

  const programmatic: MetadataRoute.Sitemap = SEO_NAV_PATHS.map((segment) => ({
    url: `${SITE_URL}${programmaticPath(segment)}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  return [...staticEntries, ...programmatic];
}
