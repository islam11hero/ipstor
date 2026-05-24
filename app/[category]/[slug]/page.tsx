import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Icon } from "@phosphor-icons/react";
import {
  ArrowRight,
  Fingerprint,
  Gauge,
  GlobeHemisphereWest,
  Lightning,
  Pulse,
  ShareNetwork,
  Shield,
  Sparkle,
  Stack,
} from "@phosphor-icons/react/ssr";

import { FaqDetailsSection } from "@/components/seo/faq-details-section";
import { BrandMark } from "@/components/icons";
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

const FEATURE_ICONS: Icon[] = [Pulse, Shield, Lightning, Stack, ShareNetwork];

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

function featureGridClass(count: number): string {
  if (count <= 3) return "mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3";
  if (count === 4) return "mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4";
  return "mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5";
}

function longFormSectionTitle(variant: 0 | 1 | 2): string {
  if (variant === 1) return "Implementation narrative";
  if (variant === 2) return "Operational field notes";
  return "Technical deep dive";
}

function featuresSectionTitle(variant: 0 | 1 | 2): string {
  if (variant === 1) return "Capability matrix";
  if (variant === 2) return "Route-specific controls";
  return "Technical features";
}

function relatedSectionTitle(variant: 0 | 1 | 2): string {
  if (variant === 0) return "Related routing topics";
  if (variant === 1) return "Adjacent programs";
  return "Explore nearby SKUs";
}

export default async function SeoLandingPage({ params }: PageProps) {
  const { category, slug } = await params;

  if (!isSeoCategory(category)) {
    notFound();
  }

  const c = category as SeoCategory;
  const data = getSeoPageData(c, slug);
  const faqJsonLd = buildFaqPageJsonLd(data.faqs);
  const layout = data.layoutVariant ?? 0;
  const related = data.relatedLinks ?? [];

  const bento = data.features.map((f, i) => {
    const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length] ?? Pulse;
    return { ...f, Icon };
  });

  const heroBlock = (
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
          <ArrowRight className="size-5" />
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
  );

  const longFormBlock = (
    <section
      className={cn(
        "border-t border-white/[0.06] bg-black/20 px-6 py-16 sm:py-20",
        layout === 2 && "bg-gradient-to-b from-black/30 to-transparent"
      )}
    >
      <article
        className={cn(
          "prose-seo-invert px-0",
          layout === 2 ? "mx-auto max-w-4xl" : undefined
        )}
      >
        <h2>{longFormSectionTitle(layout)}</h2>
        {data.longFormParagraphs.map((paragraph, i) => (
          <p key={`lf-${i}`}>{paragraph}</p>
        ))}
      </article>
    </section>
  );

  const featuresBlock = (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <h2 className="font-heading text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {featuresSectionTitle(layout)}
      </h2>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-zinc-500">
        {layout === 2
          ? "Controls and telemetry scoped to this route—composition and count vary by category intent."
          : "Operator-grade capabilities mapped to this route—not generic marketing bullets shared across unrelated SKUs."}
      </p>
      <div className={featureGridClass(bento.length)}>
        {bento.map((item) => {
          const Icon = item.Icon;
          return (
            <Card
              key={item.title}
              className={cn(
                shell,
                "overflow-hidden",
                layout === 2 && bento.length >= 5 && "xl:first:col-span-2"
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex size-10 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
                  <Icon className="size-6 text-emerald-400" weight="duotone" aria-hidden />
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
            <ArrowRight className="size-5" />
          </Button>
        </CardContent>
      </Card>
    </section>
  );

  const relatedBlock =
    related.length > 0 ? (
      <section className="border-t border-white/[0.06] bg-[#050505] px-6 py-14">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-heading text-xl font-semibold text-white">
            {relatedSectionTitle(layout)}
          </h2>
          <ul className="mt-6 flex flex-wrap gap-3">
            {related.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 transition hover:border-emerald-500/30 hover:text-emerald-200"
                >
                  {link.anchor}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    ) : null;

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
            <BrandMark size={36} />
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
        {layout === 1 ? (
          <>
            {heroBlock}
            {featuresBlock}
            {longFormBlock}
          </>
        ) : (
          <>
            {heroBlock}
            {longFormBlock}
            {featuresBlock}
          </>
        )}
        {relatedBlock}
        <FaqDetailsSection
          title={
            layout === 2 ? "Reviewer questions" : "Frequently asked questions"
          }
          subtitle={
            layout === 1
              ? "Structured answers for procurement and SRE reviewers—mirrored in JSON-LD where eligible."
              : "Structured answers for procurement, SRE, and compliance reviewers—mirrored in JSON-LD for eligible rich results."
          }
          faqs={data.faqs}
        />
      </main>
    </div>
  );
}
