import type { Metadata } from "next";

import { IpLookupClient } from "@/components/tools/ip-lookup-client";
import { IpLookupSeoArticle } from "@/lib/seo-tool-articles";

export const metadata: Metadata = {
  title: "IP Lookup — Public IP, ASN & Geo | IP Nova",
  description:
    "Free IP lookup from IP Nova: discover your public IP, ASN, ISP, city, country, and timezone. Learn how HTTP/HTTPS/SOCKS5 proxies relate to egress identity, concurrent connections, and anti-detect browser stacks—server-side lookup avoids ad blockers.",
};

export default function IpLookupPage() {
  return (
    <div className="min-h-screen bg-[#050505]">
      <IpLookupClient />
      <div className="px-6">
        <IpLookupSeoArticle />
      </div>
    </div>
  );
}
