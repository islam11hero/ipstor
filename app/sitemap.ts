import type { MetadataRoute } from "next";

import { SEO_NAV_PATHS } from "@/lib/seo-sitemap-paths";
import { SITE_URL } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPaths = [
    "",
    "/login",
    "/about",
    "/privacy",
    "/terms",
    "/tools",
  ] as const;

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  const programmatic: MetadataRoute.Sitemap = SEO_NAV_PATHS.map(
    ({ category, slug }) => ({
      url: `${SITE_URL}/${category}/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })
  );

  return [...staticEntries, ...programmatic];
}
