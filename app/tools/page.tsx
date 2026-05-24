import type { Metadata } from "next";
import type { Icon } from "@phosphor-icons/react";
import Link from "next/link";
import { Fingerprint, Gauge, GlobeHemisphereWest, Sparkle } from "@phosphor-icons/react/ssr";

import { staticPageMetadata } from "@/lib/page-metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = staticPageMetadata({
  path: "/tools",
  title: "Operator tools",
  description:
    "IP lookup, bulk proxy format validator, and user-agent generator from IP Nova — engineering-grade utilities for operators and developers.",
});

const glass =
  "rounded-2xl border border-white/[0.05] bg-white/[0.02] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl transition-colors hover:border-emerald-500/25 hover:bg-white/[0.035] sm:p-8";

type ToolCard = {
  title: string;
  description: string;
  href: string;
  icon: Icon;
  accent: string;
};

const tools: ToolCard[] = [
  {
    title: "IP Lookup",
    description:
      "Resolve your public IP, ASN, ISP, and geo in one glance — ideal for leak checks and onboarding.",
    href: "/tools/ip-lookup",
    icon: GlobeHemisphereWest,
    accent: "text-emerald-400",
  },
  {
    title: "Proxy format validator",
    description:
      "Parse up to 100 lines in IP:PORT:USER:PASS form, validate IPv4 math, and extract fields instantly—no simulated latency.",
    href: "/tools/proxy-tester",
    icon: Gauge,
    accent: "text-cyan-400",
  },
  {
    title: "User-Agent Generator",
    description:
      "Spin up modern browser fingerprints for scripts, scrapers, and QA without hunting docs.",
    href: "/tools/user-agent-generator",
    icon: Fingerprint,
    accent: "text-violet-300",
  },
];

export default function ToolsHubPage() {
  return (
    <main className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,rgba(16,185,129,0.12),transparent)]"
        aria-hidden
      />
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium tracking-[0.2em] text-emerald-500/90 uppercase">
        <Sparkle className="size-4.5" weight="duotone" aria-hidden />
        Engineering as marketing
      </div>
      <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
        Production-grade tools for operators
      </h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-zinc-500">
        No sign-up required to explore. Each utility is built to mirror production
        workflows—fast, transparent, and safe to share with your team.
      </p>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {tools.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cn(glass, "group flex flex-col")}
            >
              <div
                className={cn(
                  "flex size-12 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03]",
                  t.accent
                )}
              >
                <Icon className="size-7" weight="duotone" aria-hidden />
              </div>
              <h2 className="mt-6 font-heading text-xl font-semibold text-white group-hover:text-emerald-100">
                {t.title}
              </h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-500">
                {t.description}
              </p>
              <span className="mt-6 text-sm font-medium text-emerald-400/90 transition-colors group-hover:text-emerald-300">
                Open tool →
              </span>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
