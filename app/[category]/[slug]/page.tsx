import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Activity,
  ArrowRight,
  Layers,
  Network,
  Shield,
  Zap,
} from "lucide-react";

import { FaqDetailsSection } from "@/components/seo/faq-details-section";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buildFaqPageJsonLd, getSeoPageData } from "@/lib/seo-data";
import { SEO_NAV_PATHS } from "@/lib/seo-sitemap-paths";
import { isSeoCategory, type SeoCategory } from "@/lib/seo-slug";
import { SITE_URL } from "@/lib/site-url";
import { cn } from "@/lib/utils";

const shell =
  "rounded-2xl border border-white/[0.05] bg-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl";

type PageProps = {
  params: Promise<{ category: string; slug: string }>;
};

export function generateStaticParams() {
  return SEO_NAV_PATHS.map(({ category, slug }) => ({
    category,
    slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, slug } = await params;
  if (!isSeoCategory(category)) {
    notFound();
  }
  const data = getSeoPageData(category, slug);
  return {
    title: { absolute: data.metaTitle },
    description: data.metaDescription,
    alternates: { canonical: `${SITE_URL}/${category}/${slug}` },
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      url: `${SITE_URL}/${category}/${slug}`,
    },
  };
}

export default async function SeoLandingPage({ params }: PageProps) {
  const { category, slug } = await params;

  if (!isSeoCategory(category)) {
    notFound();
  }

  const c = category as SeoCategory;
  const data = getSeoPageData(c, slug);
  const faqJsonLd = buildFaqPageJsonLd(data.faqs);

  const featureIcons = [Activity, Shield, Zap, Layers] as const;
  const bento = data.features.map((f, i) => {
    const Icon = featureIcons[i] ?? Activity;
    return { ...f, Icon };
  });

  return (
    <div className="relative min-h-screen bg-[#050505] text-zinc-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.08),transparent)]" />
        <div className="absolute top-1/3 right-0 h-72 w-72 rounded-full bg-emerald-500/[0.07] blur-3xl" />
      </div>

      <header className="border-b border-white/[0.06] bg-[#050505]/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Network className="h-6 w-6 shrink-0 text-emerald-400" aria-hidden />
            <span className="font-heading text-base font-semibold tracking-tight text-white">
              IP Nova
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

      <main>
        <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <p className="text-xs font-medium tracking-[0.25em] text-emerald-400/90 uppercase">
            {data.eyebrow}
          </p>
          <h1 className="mt-4 max-w-4xl font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {data.h1}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-zinc-400">
            {data.heroDescription}
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
        </section>

        <section className="border-t border-white/[0.06] bg-black/20 px-6 py-16 sm:py-20">
          <article className="prose-seo-invert px-0">
            <h2>Technical deep dive</h2>
            {data.longFormParagraphs.map((paragraph, i) => (
              <p key={`lf-${i}`}>{paragraph}</p>
            ))}
          </article>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Technical features
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-zinc-500">
            Operator-grade capabilities mapped to this route—not generic marketing
            bullets shared across unrelated SKUs.
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {bento.map((item) => {
              const Icon = item.Icon;
              return (
                <Card key={item.title} className={cn(shell, "overflow-hidden")}>
                  <CardHeader className="pb-2">
                    <div className="flex size-10 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
                      <Icon className="size-5 text-emerald-400" aria-hidden />
                    </div>
                    <CardTitle className="font-heading pt-3 text-base leading-snug">
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

          <Card className={cn(shell, "mt-14 border-cyan-500/15")}>
            <CardHeader>
              <CardTitle className="font-heading text-xl">
                Ready to route production traffic?
              </CardTitle>
              <CardDescription className="text-base text-zinc-500">
                Open the IP Nova dashboard to provision credentials, monitor pools,
                and align finance with a single vendor for HTTP/HTTPS/SOCKS5
                automation.
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
        </section>

        <FaqDetailsSection
          title="Frequently asked questions"
          subtitle="Structured answers for procurement, SRE, and compliance reviewers—mirrored in JSON-LD for eligible rich results."
          faqs={data.faqs}
        />
      </main>
    </div>
  );
}
