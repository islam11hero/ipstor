import type { Metadata } from "next";

import { UserAgentGeneratorClient } from "@/components/tools/user-agent-generator-client";

export const metadata: Metadata = {
  title: "User-Agent Generator",
  description:
    "Generate modern browser user-agent strings for Windows, Mac, and Linux from IP Nova.",
};

export default function UserAgentGeneratorPage() {
  return <UserAgentGeneratorClient />;
}
