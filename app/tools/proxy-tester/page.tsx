import type { Metadata } from "next";

import { ProxyTesterClient } from "@/components/tools/proxy-tester-client";

export const metadata: Metadata = {
  title: "Proxy format validator",
  description:
    "Validate IP:PORT:USER:PASS lines and extract host, port, and credentials — free parser from IP Nova (no fake ping tests).",
};

export default function ProxyTesterPage() {
  return <ProxyTesterClient />;
}
