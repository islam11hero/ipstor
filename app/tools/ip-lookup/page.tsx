import type { Metadata } from "next";

import { IpLookupClient } from "@/components/tools/ip-lookup-client";

export const metadata: Metadata = {
  title: "IP Lookup",
  description:
    "Look up your public IP address, ISP, ASN, city, country, and timezone — free tool from IP Nova.",
};

export default function IpLookupPage() {
  return <IpLookupClient />;
}
