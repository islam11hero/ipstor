import { MarketingHome } from "@/components/marketing/marketing-home";
import { SITE_URL } from "@/lib/site-url";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "ProxyNova",
      url: SITE_URL,
      description:
        "Enterprise proxy infrastructure — residential IPs, datacenter proxies, and global routing for data and security teams.",
    },
    {
      "@type": "Product",
      "@id": `${SITE_URL}/#product`,
      name: "ProxyNova Enterprise Proxies",
      brand: { "@type": "Brand", name: "ProxyNova" },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        bestRating: "5",
        worstRating: "1",
        ratingCount: "2847",
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MarketingHome />
    </>
  );
}
