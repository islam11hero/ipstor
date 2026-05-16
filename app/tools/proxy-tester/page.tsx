import type { Metadata } from "next";

import { ProxyTesterClient } from "@/components/tools/proxy-tester-client";
import { ProxyValidatorSeoArticle } from "@/lib/seo-tool-articles";

export const metadata: Metadata = {
  title: "Proxy Format Validator — IP:PORT:USER:PASS | IP Nova",
  description:
    "Validate proxy connection strings (IP:PORT:USER:PASS), extract host and credentials, and verify IPv4 structure before production. Educational guide to HTTP/HTTPS/SOCKS5 identity, anti-detect browsers, and why fake ping tests mislead B2B buyers.",
};

export default function ProxyTesterPage() {
  return (
    <div className="min-h-screen bg-[#050505]">
      <ProxyTesterClient />
      <div className="px-6">
        <ProxyValidatorSeoArticle />
      </div>
    </div>
  );
}
