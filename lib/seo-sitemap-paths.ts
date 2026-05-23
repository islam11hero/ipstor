/**
 * Single source of truth for programmatic SEO URLs, sitemap entries, and footer links.
 * Static app routes (/about, /privacy, /terms, /tools/*) live in STATIC_SITEMAP_PATHS.
 */

export const STATIC_SITEMAP_PATHS = [
  "",
  "/about",
  "/privacy",
  "/terms",
  "/tools",
  "/tools/ip-lookup",
  "/tools/proxy-tester",
  "/tools/user-agent-generator",
] as const;

export type NavSegment = { category: string; slug: string };

export function programmaticPath({ category, slug }: NavSegment): string {
  return `/${category}/${slug}`;
}

/** Products column — must match SEO_NAV_PATHS `products/*`. */
export const FOOTER_PRODUCT_LINKS = [
  {
    slug: "residential-proxies",
    label: "Residential Proxies",
    popular: true,
  },
  { slug: "isp-proxies", label: "ISP Proxies" },
  { slug: "datacenter-proxies", label: "Datacenter Proxies" },
  { slug: "mobile-proxies", label: "Mobile Proxies" },
  { slug: "web-scraping", label: "Web Scraping" },
  { slug: "sneaker-bots", label: "Sneaker Bots" },
] as const;

/** Programmatic tool landings (interactive tools use STATIC_SITEMAP_PATHS). */
export const FOOTER_TOOLS_PROGRAMMATIC_LINKS = [
  { slug: "chrome-extension", label: "Chrome Extension" },
  { slug: "firefox-addon", label: "Firefox Add-on" },
] as const;

export const FOOTER_TOOLS_STATIC_LINKS = [
  { path: "/tools", label: "Tools hub" },
  { path: "/tools/proxy-tester", label: "Proxy format validator" },
  { path: "/tools/ip-lookup", label: "IP Lookup" },
  { path: "/tools/user-agent-generator", label: "User-Agent Generator" },
] as const;

export const FOOTER_RESOURCES_LINKS = [
  { slug: "blog", label: "Blog" },
  { slug: "documentation", label: "Documentation" },
  { slug: "integrations", label: "Integrations" },
  { slug: "network-status", label: "Network Status", live: true },
] as const;

export const FOOTER_LOCATIONS_LINKS = [
  { slug: "united-states", label: "United States" },
  { slug: "united-kingdom", label: "United Kingdom" },
  { slug: "germany", label: "Germany" },
  { slug: "japan", label: "Japan" },
  { slug: "global-network", label: "Global Network" },
] as const;

export const FOOTER_COMPANY_STATIC_LINKS = [
  { path: "/about", label: "About Us" },
] as const;

export const FOOTER_COMPANY_PROGRAMMATIC_LINKS = [
  { slug: "affiliate-program", label: "Affiliate Program" },
  { slug: "contact-us", label: "Contact Us" },
] as const;

export const FOOTER_LEGAL_STATIC_LINKS = [
  { path: "/terms", label: "Terms of Service" },
  { path: "/privacy", label: "Privacy Policy" },
] as const;

export const FOOTER_LEGAL_PROGRAMMATIC_LINKS = [
  { slug: "kyc-policy", label: "KYC Policy" },
] as const;

const productsNav: NavSegment[] = FOOTER_PRODUCT_LINKS.map((item) => ({
  category: "products",
  slug: item.slug,
}));

const toolsNav: NavSegment[] = FOOTER_TOOLS_PROGRAMMATIC_LINKS.map((item) => ({
  category: "tools",
  slug: item.slug,
}));

const resourcesNav: NavSegment[] = FOOTER_RESOURCES_LINKS.map((item) => ({
  category: "resources",
  slug: item.slug,
}));

const locationsNav: NavSegment[] = FOOTER_LOCATIONS_LINKS.map((item) => ({
  category: "locations",
  slug: item.slug,
}));

const companyNav: NavSegment[] = FOOTER_COMPANY_PROGRAMMATIC_LINKS.map(
  (item) => ({
    category: "company",
    slug: item.slug,
  })
);

const legalNav: NavSegment[] = FOOTER_LEGAL_PROGRAMMATIC_LINKS.map((item) => ({
  category: "legal",
  slug: item.slug,
}));

/** All `[category]/[slug]` routes in sitemap + `generateStaticParams`. */
export const SEO_NAV_PATHS: readonly NavSegment[] = [
  ...productsNav,
  ...toolsNav,
  ...resourcesNav,
  ...locationsNav,
  ...companyNav,
  ...legalNav,
] as const;
