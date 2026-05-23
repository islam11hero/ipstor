import type { Metadata } from "next";

import { SITE_URL } from "@/lib/site-url";

/** Absolute canonical URL (`path` is e.g. `/about`; use `""` for homepage). */
export function canonicalUrl(path: string = ""): string {
  if (!path || path === "/") return SITE_URL;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

/** Metadata for static app routes with an explicit canonical. */
export function staticPageMetadata({
  path,
  title,
  description,
}: {
  path: string;
  title: string;
  description: string;
}): Metadata {
  const url = canonicalUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
    },
  };
}
