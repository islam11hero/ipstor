import { formatSlugTitle, type SeoCategory } from "@/lib/seo-slug";

export type SeoFeature = {
  title: string;
  body: string;
};

export type SeoPageContent = {
  metaDescription: string;
  eyebrow: string;
  h1Before: string;
  h1Gradient: string;
  lead: string;
  features: [SeoFeature, SeoFeature, SeoFeature];
  bottomTitle: string;
  bottomLead: string;
};

type ContentResolver = (label: string, lower: string) => SeoPageContent;

const COMMERCIAL_RESOLVERS: Record<
  Extract<SeoCategory, "products" | "locations" | "tools">,
  ContentResolver
> = {
  locations: (label, lower) => ({
    metaDescription: `${label} proxy egress: geo-targeted routing, stable median ping, and carrier-diverse paths for SERP, ads, and compliance workloads.`,
    eyebrow: "Global edge",
    h1Before: `${label} proxies built for`,
    h1Gradient: "latency-sensitive traffic",
    lead: `Pin sessions to ${label} POPs without guessing ASN mix. We publish routing intent, median RTT envelopes, and failover behavior so SRE teams can model scrape and verification pipelines before they ship.`,
    features: [
      {
        title: "Metro-peered handoffs",
        body: `Interconnect in ${label} keeps last-mile variance low for price crawls, checkout flows, and localized content audits.`,
      },
      {
        title: "Ping envelopes you can budget",
        body: "SLA-style telemetry—not vanity graphs—so capacity planners can align concurrency with observed RTT bands.",
      },
      {
        title: "Geo fidelity without guesswork",
        body: `ASN and city targeting for ${label} workloads where proof-of-presence matters more than raw throughput.`,
      },
    ],
    bottomTitle: `Operate ${label} like a product surface`,
    bottomLead: `Pair ${lower} routing with residential or ISP pools when you need trust signals—not just a different exit IP.`,
  }),

  products: (label, lower) => ({
    metaDescription: `${label} for HTTP/SOCKS automation: session control, ethical use policies, and formats your scrapers already speak.`,
    eyebrow: "Product surface",
    h1Before: `${label} engineered for`,
    h1Gradient: "production scraping",
    lead: `Whether you rotate aggressively or pin sticky identities, ${label} is described in the same auth primitives your runners already emit—no bespoke SDK lock-in.`,
    features: [
      {
        title: "Protocol parity",
        body: "HTTP and SOCKS5 paths share credential semantics so switching transport is a config flip, not a rewrite.",
      },
      {
        title: "Abuse-aware throttles",
        body: `Residential and ISP classes for ${label} include circuit breakers tuned for long-tail domains—not naive firehoses.`,
      },
      {
        title: "Evidence-friendly logging",
        body: "Operator-visible session lineage for audits when campaigns span datacenter and residential mixes.",
      },
    ],
    bottomTitle: `Why teams shortlist ${label}`,
    bottomLead: `Blend ${lower} with datacenter bulk where throughput wins, without splitting billing or support contracts.`,
  }),

  tools: (label, lower) => ({
    metaDescription: `${label}: IP Nova tooling pages for operators—fast paths to diagnostics, QA helpers, and integration smoke tests.`,
    eyebrow: "Operator tools",
    h1Before: `${label} for`,
    h1Gradient: "daily engineering",
    lead: `Ship checklists around ${label} with utilities that mirror how infra teams validate egress—not marketing gimmicks with fake latencies.`,
    features: [
      {
        title: "Copy-paste safe outputs",
        body: "Structured results you can drop into runbooks, tickets, or CI logs without redacting secrets by hand.",
      },
      {
        title: "Dark-mode first UX",
        body: "High-contrast surfaces for late-night incidents when you are already context-switched.",
      },
      {
        title: "Honest scope boundaries",
        body: `Each ${lower} page documents what is measured client-side vs server-side so stakeholders trust the signal.`,
      },
    ],
    bottomTitle: `Wire ${label} into your platform`,
    bottomLead: "When you need contractual SLAs and pooled inventory, graduate from tools to the IP Nova dashboard.",
  }),
};

const EDUCATIONAL_RESOLVER: ContentResolver = (label, lower) => ({
  metaDescription: `${label} — documentation, integration notes, and operational guidance from IP Nova.`,
  eyebrow: "Knowledge base",
  h1Before: `${label}:`,
  h1Gradient: "clarity for builders",
  lead: `This ${lower} hub is written for engineers shipping automation: fewer adjectives, more sequence diagrams, failure modes, and copy-ready examples.`,
  features: [
    {
      title: "Integration-first ordering",
      body: "Steps assume CI, secrets managers, and least-privilege keys—not a single happy-path laptop demo.",
    },
    {
      title: "Versioned patterns",
      body: "Examples track modern TLS, HTTP/2 client defaults, and browser automation stacks you actually run.",
    },
    {
      title: "Escalation paths",
      body: "When limits hit, you will see what to measure next instead of generic 'contact support' filler.",
    },
  ],
  bottomTitle: `Turn ${label} into uptime`,
  bottomLead: "Pair these guides with live inventory in the dashboard when you are ready to load production traffic.",
});

const COMPLIANCE_VARIANTS: readonly ContentResolver[] = [
  (label, lower) => ({
    metaDescription: `${label} — legal terms, privacy commitments, and compliance posture for IP Nova customers.`,
    eyebrow: "Legal",
    h1Before: `${label}:`,
    h1Gradient: "plain language, enforceable terms",
    lead: `Read ${lower} with engineering context: what we log, what we do not, and how obligations map to product behavior you can test in staging.`,
    features: [
      {
        title: "Data minimization framing",
        body: "Operational data called out separately from billing artifacts so security reviews move faster.",
      },
      {
        title: "KYC where required",
        body: "High-risk flows are scoped—no surprise blanket identity collection for low-risk SKUs.",
      },
      {
        title: "Change management",
        body: "Expect dated revisions and summaries of material deltas—not silent PDF swaps.",
      },
    ],
    bottomTitle: `Questions on ${label}?`,
    bottomLead: "Legal and solutions teams share a vocabulary—open a thread from your dashboard workspace.",
  }),
  (label, lower) => ({
    metaDescription: `${label} — how IP Nova works with partners, affiliates, and customers at scale.`,
    eyebrow: "Company",
    h1Before: `${label} at`,
    h1Gradient: "IP Nova",
    lead: `Transparency for ${lower}: how we contract, how we escalate incidents, and how we keep commercial teams aligned with engineering reality.`,
    features: [
      {
        title: "Commercial + eng alignment",
        body: "Pricing, limits, and support tiers are described with the same vocabulary your finance org uses.",
      },
      {
        title: "Affiliate guardrails",
        body: "Clear attribution, disclosure, and brand usage so partner programs stay defensible.",
      },
      {
        title: "Human escalation",
        body: "Named paths for security reviews, MSA redlines, and data processing questions—not a black hole form.",
      },
    ],
    bottomTitle: `Next step from ${label}`,
    bottomLead: "When paperwork is done, route traffic through the dashboard with the same controls referenced here.",
  }),
];

const RESOLVER_BY_CATEGORY: Partial<Record<SeoCategory, ContentResolver>> = {
  ...COMMERCIAL_RESOLVERS,
  resources: EDUCATIONAL_RESOLVER,
};

export function getDynamicContent(
  category: SeoCategory,
  slug: string
): SeoPageContent {
  const label = formatSlugTitle(slug);
  const lower = label.toLowerCase();

  if (category === "legal") {
    return COMPLIANCE_VARIANTS[0]!(label, lower);
  }
  if (category === "company") {
    return COMPLIANCE_VARIANTS[1]!(label, lower);
  }

  const resolver = RESOLVER_BY_CATEGORY[category];
  if (!resolver) {
    throw new Error(`Unhandled SEO category: ${category}`);
  }

  return resolver(label, lower);
}
