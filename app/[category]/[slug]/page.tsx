import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Activity,
  ArrowRight,
  Globe,
  Headphones,
  Shield,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatSlugTitle, isSeoCategory } from "@/lib/seo-slug";
import { SITE_URL } from "@/lib/site-url";
import { cn } from "@/lib/utils";

const shell =
  "rounded-2xl border border-white/[0.05] bg-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl";

type PageProps = {
  params: Promise<{ category: string; slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, slug } = await params;
  if (!isSeoCategory(category)) {
    notFound();
  }
  const formatted = formatSlugTitle(slug);
  return {
    title: formatted,
    description: `Premium ${formatted} for enterprise teams — global coverage, contractual SLAs, and infrastructure you can trust.`,
    alternates: { canonical: `${SITE_URL}/${category}/${slug}` },
  };
}

export default async function SeoLandingPage({ params }: PageProps) {
  const { category, slug } = await params;

  if (!isSeoCategory(category)) {
    notFound();
  }

  const formattedSlug = formatSlugTitle(slug);

  const bento = [
    {
      icon: Activity,
      title: "99.9% uptime",
      body: "Carrier-grade routing and redundant upstreams keep your pipelines online.",
    },
    {
      icon: Shield,
      title: "Zero IP blocks",
      body: "Fresh pools, rotation controls, and abuse-aware policies reduce captchas and bans.",
    },
    {
      icon: Headphones,
      title: "24/7 support",
      body: "Dedicated solutions engineers for onboarding, scaling, and incident response.",
    },
    {
      icon: Zap,
      title: "Low-latency edge",
      body: "Metro-peered egress so scraping, verification, and ad ops stay fast worldwide.",
    },
  ] as const;

  return (
    <div className="relative min-h-screen bg-[#050505] text-zinc-100">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.08),transparent)]" />
        <div className="absolute top-1/3 right-0 h-72 w-72 rounded-full bg-emerald-500/[0.07] blur-3xl" />
      </div>

      <header className="border-b border-white/[0.06] bg-[#050505]/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Globe className="h-6 w-6 shrink-0 text-emerald-500" aria-hidden />
            <span className="font-heading text-base font-semibold tracking-tight text-white">
              ProxyNova
            </span>
          </Link>
          <Button
            size="sm"
            className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-black"
            render={<Link href="/dashboard" />}
          >
            Launch console
          </Button>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <p className="text-xs font-medium tracking-[0.25em] text-emerald-400/90 uppercase">
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </p>
        <h1 className="mt-4 max-w-3xl font-heading text-4xl font-bold tracking-tight sm:text-5xl">
          Premium {formattedSlug}{" "}
          <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
            for enterprise
          </span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-zinc-400">
          Contract-ready infrastructure, transparent routing, and compliance-minded
          operations—built for security teams, data platforms, and growth orgs that
          cannot afford downtime.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Button
            size="lg"
            className="gap-2 bg-gradient-to-r from-emerald-400 to-cyan-400 text-black shadow-lg shadow-emerald-500/15 hover:from-emerald-300 hover:to-cyan-300"
            render={<Link href="/dashboard" />}
          >
            Get started
            <ArrowRight className="size-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/15 bg-white/[0.02] text-zinc-100"
            render={<Link href="/login" />}
          >
            Talk to sales
          </Button>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {bento.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className={cn(shell, "overflow-hidden")}>
                <CardHeader className="pb-2">
                  <div className="flex size-10 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
                    <Icon className="size-5 text-emerald-400" aria-hidden />
                  </div>
                  <CardTitle className="font-heading pt-3 text-lg">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed text-zinc-500">
                    {item.body}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <Card className={cn(shell, "mt-12 border-cyan-500/15")}>
          <CardHeader>
            <CardTitle className="font-heading text-xl">
              Why teams choose ProxyNova for {formattedSlug}
            </CardTitle>
            <CardDescription className="text-base text-zinc-500">
              Single invoice, predictable egress, and SOC-minded controls—without
              sacrificing throughput on {formattedSlug.toLowerCase()} workloads.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/10"
              render={<Link href="/dashboard" />}
            >
              Open dashboard
              <ArrowRight className="size-4" />
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
