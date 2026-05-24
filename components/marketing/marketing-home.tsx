"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Check,
  Layers,
  Network,
  Server,
  Shield,
  Smartphone,
  Wifi,
  Zap,
} from "lucide-react";

import { HeroNetworkVisual } from "@/components/marketing/hero-network-visual";
import { IntegrationsApiBlock } from "@/components/marketing/integrations-api-block";
import { MarqueeTrust } from "@/components/marketing/marquee-trust";
import { MarketingNavbar } from "@/components/marketing/marketing-navbar";
import { AnimatedShinyText } from "@/components/motion/animated-shiny-text";
import { AuroraBackground } from "@/components/motion/aurora-background";
import { MagicCard } from "@/components/motion/magic-card";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Spotlight } from "@/components/motion/spotlight";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const surface = "surface-bento";

const glassProduct =
  "group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.02] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl transition-colors hover:border-emerald-500/20 hover:bg-white/[0.035] sm:p-7";

const solutionProducts = [
  {
    title: "Residential",
    stat: "32M+ IPs",
    price: "from $1.76/GB",
    href: "/products/residential-proxies",
    icon: Wifi,
    description:
      "Legitimate residential egress for rank tracking, ad verification, and high-trust scraping.",
  },
  {
    title: "ISP",
    stat: "Dedicated ASN",
    price: "from $2.40/IP",
    href: "/products/isp-proxies",
    icon: Building2,
    description:
      "Static sessions that behave like home users—ideal for accounts, carts, and long-lived flows.",
  },
  {
    title: "Datacenter",
    stat: "50+ regions",
    price: "from $1.50/IP",
    href: "/products/datacenter-proxies",
    icon: Server,
    description:
      "Throughput-first endpoints for bulk crawls, price intelligence, and internal tooling.",
  },
  {
    title: "Mobile",
    stat: "4G / 5G",
    price: "from $3.20/GB",
    href: "/products/mobile-proxies",
    icon: Smartphone,
    description:
      "Carrier-grade mobile IPs when app integrity, device graphs, and geo fidelity matter most.",
  },
] as const;

const reviews = [
  {
    img: "https://i.pravatar.cc/150?img=11",
    name: "Jordan Ellis",
    role: "Lead Data Scientist",
    company: "Meridian Analytics",
    quote:
      "IP Nova's residential network eliminated the scraping blocks we saw with commodity providers. Uptime has been indistinguishable from five-nines for our production pipelines.",
  },
  {
    img: "https://i.pravatar.cc/150?img=32",
    name: "Priya Shah",
    role: "SEO Director",
    company: "Northbeam Digital",
    quote:
      "We run rank tracking and SERP validation at scale across regions. Latency is predictable and the dashboard is actually built for operators, not demos.",
  },
  {
    img: "https://i.pravatar.cc/150?img=47",
    name: "Marcus Webb",
    role: "Head of Security Research",
    company: "Signal Foundry",
    quote:
      "Clean handoffs between datacenter and residential pools, plus consistent auth formats, saved us weeks of integration work. This is the tier we expect from infrastructure vendors.",
  },
];

export function MarketingHome() {
  return (
    <div className="relative min-h-screen bg-[#050505] text-zinc-100">
      <AuroraBackground />
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
        aria-hidden
      />

      <MarketingNavbar />

      <main>
        <section className="relative mx-auto max-w-7xl px-6 pb-16 pt-16 lg:pb-24 lg:pt-24">
          <Spotlight className="-z-10" />
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-14 xl:gap-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="font-heading text-[11px] font-medium tracking-[0.28em] text-emerald-500/90 uppercase">
                Infrastructure
              </p>
              <h1 className="mt-5 font-heading text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
                Proxy fabric built for{" "}
                <AnimatedShinyText>serious workloads</AnimatedShinyText>
              </h1>
              <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-zinc-500">
                IP Nova unifies{" "}
                <strong className="font-medium text-zinc-300">HTTP</strong>,{" "}
                <strong className="font-medium text-zinc-300">HTTPS</strong>, and{" "}
                <strong className="font-medium text-zinc-300">SOCKS5</strong> forward
                proxies with intelligent{" "}
                <strong className="font-medium text-zinc-300">IP rotation</strong>,
                sticky sessions for checkout realism, and honest guidance on{" "}
                <strong className="font-medium text-zinc-300">concurrent connections</strong>{" "}
                so your workers do not trip global rate limits. Route production scraping,
                SERP intelligence, and ad verification through residential and datacenter
                pools—or pair with{" "}
                <strong className="font-medium text-zinc-300">anti-detect browsers</strong>{" "}
                using SOCKS5—while finance sees one vendor, one SLA track, and one security
                review artifact.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Button
                  className="h-10 border border-white/10 bg-white/[0.06] px-5 text-sm text-white hover:bg-white/[0.1]"
                  render={<Link href="/login?tab=register" />}
                >
                  Start onboarding
                  <ArrowRight className="size-4 opacity-70" />
                </Button>
                <Button
                  variant="ghost"
                  className="h-10 text-sm text-zinc-400 hover:bg-transparent hover:text-white"
                  render={<Link href="#use-cases" />}
                >
                  Platform overview
                  <ArrowUpRight className="size-4 opacity-60" />
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <HeroNetworkVisual />
            </motion.div>
          </div>
        </section>

        <MarqueeTrust />

        <section
          id="solutions"
          className="border-t border-white/[0.05] bg-gradient-to-b from-black/40 to-transparent py-20 lg:py-28"
        >
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <div className="max-w-2xl">
              <p className="font-heading text-[11px] font-medium tracking-[0.28em] text-emerald-500/90 uppercase">
                Product matrix
              </p>
              <h2 className="mt-4 font-heading text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
                Solutions for every use case
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-zinc-500">
                Pick the network class that matches your workload—each SKU ships with the
                same control plane, auth formats, and enterprise support posture.
              </p>
            </div>
            </ScrollReveal>

            <ScrollReveal className="mt-14 grid gap-5 sm:grid-cols-2 xl:grid-cols-4" stagger={0.08}>
              {solutionProducts.map((p) => {
                const Icon = p.icon;
                return (
                  <MagicCard key={p.title}>
                    <Link
                      href={p.href}
                      className={cn(
                        glassProduct,
                        "block h-full border-0 bg-transparent shadow-none hover:bg-white/[0.035]"
                      )}
                    >
                      <Badge className="w-fit border-none bg-emerald-500/10 text-emerald-400">
                        {p.price}
                      </Badge>
                      <div className="mt-5 flex items-start justify-between gap-3">
                        <p className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
                          {p.stat}
                        </p>
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] transition-colors group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10">
                          <Icon className="size-5 text-emerald-400/90" aria-hidden />
                        </div>
                      </div>
                      <h3 className="mt-4 font-heading text-xl font-semibold text-white">
                        {p.title}
                      </h3>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-500">
                        {p.description}
                      </p>
                      <span className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400/90 transition-colors group-hover:text-emerald-300">
                        Explore
                        <ArrowUpRight className="size-3.5" />
                      </span>
                    </Link>
                  </MagicCard>
                );
              })}
            </ScrollReveal>
          </div>
        </section>

        <IntegrationsApiBlock />

        <section id="use-cases" className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <ScrollReveal>
            <div className="max-w-2xl">
            <h2 className="font-heading text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              One platform. Asymmetric by design.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-zinc-500">
              Bento layout mirrors how teams actually work: heavy compute here,
              compliance there, and a spine of shared controls in between.
            </p>
          </div>
          </ScrollReveal>

          <ScrollReveal className="mt-14 grid auto-rows-[minmax(140px,auto)] grid-cols-6 gap-4 lg:grid-cols-12 lg:gap-5" stagger={0.06}>
            <div
              className={cn(
                surface,
                "col-span-6 flex flex-col justify-between p-6 lg:col-span-5 lg:row-span-2 lg:min-h-[320px] lg:p-8"
              )}
            >
              <div className="flex size-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03]">
                <Network className="size-5 text-emerald-400/90" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-medium text-white">
                  Network topology you can reason about
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                  Dedicated and shared pools with explicit routing policies. No
                  black-box rotation rules that change under your feet.
                </p>
              </div>
            </div>

            <div className={cn(surface, "col-span-6 p-6 lg:col-span-4 lg:p-7")}>
              <div className="flex size-10 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                <Shield className="size-[18px] text-cyan-400/90" />
              </div>
              <h3 className="mt-5 font-heading text-base font-medium text-white">
                Identity-aware sessions
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                Sticky and rotating modes with consistent credentials. Built for
                compliance-adjacent workflows.
              </p>
            </div>

            <div className={cn(surface, "col-span-6 p-6 lg:col-span-3 lg:p-7")}>
              <div className="flex size-10 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                <Zap className="size-[18px] text-amber-200/80" />
              </div>
              <h3 className="mt-5 font-heading text-base font-medium text-white">
                Instant issuance
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                API-ready strings in standard colon-delimited format.
              </p>
            </div>

            <div className={cn(surface, "col-span-6 p-6 lg:col-span-4 lg:p-7")}>
              <div className="flex size-10 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                <Activity className="size-[18px] text-emerald-400/90" />
              </div>
              <h3 className="mt-5 font-heading text-base font-medium text-white">
                Observable uptime
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                Status surfaces that match how SRE teams expect to read them.
              </p>
            </div>

            <div
              className={cn(
                surface,
                "col-span-6 flex flex-col justify-between p-6 lg:col-span-7 lg:min-h-[200px] lg:flex-row lg:items-center lg:gap-10 lg:p-8"
              )}
            >
              <div className="flex-1">
                <div className="flex size-10 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                  <Layers className="size-[18px] text-zinc-300" />
                </div>
                <h3 className="mt-5 font-heading text-base font-medium text-white lg:mt-6">
                  Single invoice, multiple workloads
                </h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
                  Datacenter for throughput-heavy jobs. Residential where trust
                  signals matter. One ledger and one support contract.
                </p>
              </div>
              <div className="mt-6 shrink-0 font-mono text-[11px] leading-relaxed text-zinc-600 lg:mt-0">
                host:port:user:pass
              </div>
            </div>
          </ScrollReveal>
        </section>

        <section id="pricing" className="border-t border-white/[0.05] bg-black/30 py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <h2 className="font-heading text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Transparent unit economics
                </h2>
                <p className="mt-3 max-w-lg text-[15px] text-zinc-500">
                  No teaser rates that triple after week two. Published pricing,
                  volume tiers on request for qualified teams.
                </p>
              </div>
              <Link
                href="/login?tab=register"
                className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400/90 hover:text-emerald-300"
              >
                Request enterprise quote
                <ArrowUpRight className="size-4" />
              </Link>
            </div>

            <ScrollReveal className="mt-14 grid gap-5 lg:grid-cols-2" stagger={0.12}>
              <MagicCard>
              <div className={cn(surface, "relative h-full overflow-hidden border-0 bg-transparent p-8 shadow-none lg:p-10")}>
                <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
                <div className="relative">
                  <p className="font-heading text-[10px] tracking-[0.22em] text-zinc-500 uppercase">
                    Datacenter
                  </p>
                  <p className="mt-4 font-heading text-4xl font-semibold text-white">
                    $1.50
                    <span className="text-lg font-normal text-zinc-500">/IP</span>
                  </p>
                  <ul className="mt-8 space-y-3 text-sm text-zinc-400">
                    {[
                      "Dedicated and shared pools",
                      "HTTP and SOCKS5",
                      "Unmetered bandwidth on select SKUs",
                      "50+ global locations",
                    ].map((item) => (
                      <li key={item} className="flex gap-3">
                        <Check className="mt-0.5 size-4 shrink-0 text-emerald-500/80" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-10 w-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] sm:w-auto"
                    render={<Link href="/login?tab=register" />}
                  >
                    Configure datacenter
                  </Button>
                </div>
              </div>
              </MagicCard>

              <MagicCard>
              <div className={cn(surface, "relative h-full overflow-hidden border-0 bg-transparent p-8 shadow-none lg:p-10")}>
                <div className="absolute -left-10 bottom-0 h-44 w-44 rounded-full bg-cyan-500/10 blur-3xl" />
                <div className="relative">
                  <p className="font-heading text-[10px] tracking-[0.22em] text-zinc-500 uppercase">
                    Residential
                  </p>
                  <p className="mt-4 font-heading text-4xl font-semibold text-white">
                    $4.00
                    <span className="text-lg font-normal text-zinc-500">/GB</span>
                  </p>
                  <ul className="mt-8 space-y-3 text-sm text-zinc-400">
                    {[
                      "Legitimate residential IPs",
                      "Geo and ASN targeting",
                      "Rotating and sticky sessions",
                      "Pay-as-you-grow metering",
                    ].map((item) => (
                      <li key={item} className="flex gap-3">
                        <Check className="mt-0.5 size-4 shrink-0 text-cyan-400/80" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-10 w-full border border-emerald-500/25 bg-emerald-500/[0.12] text-emerald-50 hover:bg-emerald-500/20 sm:w-auto"
                    render={<Link href="/login?tab=register" />}
                  >
                    Configure residential
                  </Button>
                </div>
              </div>
              </MagicCard>
            </ScrollReveal>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <ScrollReveal>
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Proof from production environments
          </h2>
          <p className="mt-3 max-w-xl text-[15px] text-zinc-500">
            Names and companies are representative of the profiles we serve across
            data, growth, and security organizations.
          </p>
          </ScrollReveal>
          <ScrollReveal className="mt-14 grid gap-5 md:grid-cols-3" stagger={0.1}>
            {reviews.map((r) => (
              <div key={r.name} className={cn(surface, "flex flex-col p-6 lg:p-7")}>
                <div className="flex items-center gap-3">
                  <Image
                    src={r.img}
                    alt=""
                    width={44}
                    height={44}
                    className="rounded-full ring-1 ring-white/10"
                    unoptimized
                  />
                  <div>
                    <p className="text-sm font-medium text-white">{r.name}</p>
                    <p className="text-xs text-zinc-500">
                      {r.role}, {r.company}
                    </p>
                  </div>
                </div>
                <blockquote className="mt-5 flex-1 text-sm leading-relaxed text-zinc-400">
                  &ldquo;{r.quote}&rdquo;
                </blockquote>
              </div>
            ))}
          </ScrollReveal>
        </section>
      </main>
    </div>
  );
}
