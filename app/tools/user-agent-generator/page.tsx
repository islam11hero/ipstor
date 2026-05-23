import type { Metadata } from "next";

import { UserAgentGeneratorClient } from "@/components/tools/user-agent-generator-client";
import { staticPageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = staticPageMetadata({
  path: "/tools/user-agent-generator",
  title: "User-Agent Generator",
  description:
    "Generate modern browser user-agent strings for Windows, Mac, and Linux from IP Nova.",
});

export default function UserAgentGeneratorPage() {
  return <UserAgentGeneratorClient />;
}
