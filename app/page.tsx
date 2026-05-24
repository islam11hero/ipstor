import type { Metadata } from "next";

import dynamic from "next/dynamic";

import { HomeFaqSection, HOME_PAGE_FAQS } from "@/components/marketing/home-faq-section";
import { canonicalUrl } from "@/lib/page-metadata";
import { buildFaqPageJsonLd } from "@/lib/seo-data";
import { SITE_URL } from "@/lib/site-url";

export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl() },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "IP Nova",
  url: SITE_URL,
  description:
    "IP Nova delivers enterprise proxy infrastructure for HTTP, HTTPS, and SOCKS5 automation—residential, ISP, datacenter, and mobile pools with intelligent IP rotation, ethical sourcing, KYC-aligned programs for high-risk SKUs, and contract-backed 99.9% SLAs for qualified volumes. Teams use IP Nova for web scraping, SERP intelligence, ad verification, checkout automation, and security research where ASN reputation, concurrent connection guidance, and anti-detect browser compatibility determine outcomes more than vanity IP counts.",
};

const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": `${SITE_URL}/#product`,
  name: "IP Nova Enterprise Proxies",
  brand: { "@type": "Brand", name: "IP Nova" },
  description:
    "Unified forward proxy access for B2B data teams: blend residential precision with datacenter throughput, terminate SOCKS5 for anti-detect stacks, and operate sticky sessions or aggressive rotation policies from one control plane.",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    bestRating: "5",
    worstRating: "1",
    ratingCount: "2847",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: "IP Nova",
  description:
    "Official IP Nova website: buy residential proxies, datacenter proxies, and mobile carrier IPs with transparent documentation, operator tooling, and enterprise trust artifacts.",
  publisher: { "@id": `${SITE_URL}/#organization` },
};

const faqJsonLd = buildFaqPageJsonLd([...HOME_PAGE_FAQS]);

const MarketingHome = dynamic(
  () =>
    import("@/components/marketing/marketing-home").then((mod) => mod.MarketingHome),
  {
    loading: () => (
      <div
        className="min-h-[80vh] animate-pulse bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.06),transparent)]"
        aria-hidden
      />
    ),
  }
);

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [organizationJsonLd, productJsonLd, websiteJsonLd],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <MarketingHome />
      <HomeFaqSection />
    </>
  );
}
