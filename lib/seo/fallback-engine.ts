import { formatSlugTitle, type SeoCategory } from "@/lib/seo-slug";

import { countInRange, hashSlot, pickUniqueIndices } from "./hash-slug";
import { resolveIntent } from "./intent";
import { deriveDynamicMetrics } from "./metrics";
import { categoryEyebrowSuffix, resolveSlugEntities } from "./slug-entities";
import type {
  FallbackContext,
  SeoFaqItem,
  SeoFeatureItem,
  SeoMatrixEntry,
} from "./types";

function makeContext(slug: string, category: SeoCategory): FallbackContext {
  const seed = `${category}:${slug}`;
  const label = formatSlugTitle(slug);
  return {
    label,
    lower: label.toLowerCase(),
    slug,
    category,
    metrics: deriveDynamicMetrics(slug, category),
    entities: resolveSlugEntities(category, slug, seed),
    intent: resolveIntent(category),
    seed,
  };
}

const CATEGORY_EYEBROW: Record<SeoCategory, string> = {
  products: "Product infrastructure",
  tools: "Operator utilities",
  locations: "Geo-targeted egress",
  resources: "Documentation & guides",
  company: "Company & programs",
  legal: "Legal & compliance",
};

type ParagraphComposer = (ctx: FallbackContext) => string;
type FeatureComposer = (ctx: FallbackContext) => SeoFeatureItem;
type FaqComposer = (ctx: FallbackContext) => SeoFaqItem;

const COMMERCIAL_PARAGRAPHS: readonly ParagraphComposer[] = [
  (ctx) => {
    const { label, metrics: m, entities: e } = ctx;
    return `${e.infrastructure} anchors ${label} egress planning. Inventory bands near ${m.estimatedIps} across ${m.metroRegions} give security teams a defensible blast-radius estimate before production cutover. Median TLS RTT ${m.latencyP50} (p95 ${m.latencyP95}) is what SREs should model—not vanity ping charts—when orchestrating ${m.safeConcurrency} concurrent workers against strict targets. ${e.operational}.`;
  },
  (ctx) => {
    const { label, lower, metrics: m } = ctx;
    return `Session choreography for ${label} separates teams that survive rate floors from teams that do not. Pin sticky TTL identities when OAuth or cart cookies must survive queue walls; rotate on HTTP 403 density spikes when catalog or SERP jobs hit risk engines. IP Nova exposes rotation as API fields (per-request, TTL-bound, error-driven subnet backoff) so ${lower} pipelines encode policy instead of babysitting scripts. Pair pacing with measured 429 histograms before doubling worker counts.`;
  },
  (ctx) => {
    const { label, metrics: m } = ctx;
    return `Telemetry discipline on ${label} routes means treating ${m.successRate} success bands as hypotheses, not guarantees. Export 403/429 ratios hourly, correlate with subnet exposure, and fail over pool classes from the same dashboard when a metro saturates. SOCKS5 and HTTP/HTTPS share credentials—switch transports without reprovisioning secrets when a library demands TLS tunnel semantics.`;
  },
  (ctx) => {
    const { label, entities: e, category } = ctx;
    const geo =
      category === "locations"
        ? `Geo-fidelity for ${label} requires ASN graphs that mirror consumer last mile—not a single hosting ASN sprayed across a country.`
        : `Geo targeting for ${label} jobs maps cleanly to dashboard filters when inventory allows city-level steering.`;
    return `${geo} ${e.infrastructure}. Procurement packets include subprocessors, retention defaults, and acceptable-use boundaries so ${label} programs pass security review without shadow resellers.`;
  },
  (ctx) => {
    const { label, metrics: m } = ctx;
    return `Capacity proof for ${label}: ${m.estimatedIps} routable identities, ${m.metroRegions}, tail RTT near ${m.latencyP95}. Flash-traffic teams model worst-case TLS handshakes; batch crawlers model median ${m.latencyP50}. Neither group should exceed ${m.safeConcurrency} workers until target-side global caps are measured empirically.`;
  },
];

const COMPLIANCE_PARAGRAPHS: readonly ParagraphComposer[] = [
  (ctx) => {
    const { label, entities: e } = ctx;
    return `${label} reviews at IP Nova start with ${e.infrastructure}. Billing metadata is separated from payload logging on qualified deployments; connection metadata fields are minimized by default so DPIA authors can map processing activities without reverse-engineering the product. ${e.regulatory ?? "Regulatory annexes attach to MSAs on request."}`;
  },
  (ctx) => {
    const { label, entities: e } = ctx;
    return `KYC scope for ${label} is SKU-scoped—not a blanket identity harvest. High-risk classes (mobile backhaul, certain residential tiers) document carrier obligations; low-risk datacenter bulk paths describe acceptable-use enforcement instead. ${e.operational}.`;
  },
  (ctx) => {
    const { label } = ctx;
    return `Change management on ${label} artifacts uses dated revisions with material-delta summaries. Subprocessor notifications follow a 30-day window where contracts require it. Customers receive lawful-order response playbooks without silent expansion of logged fields.`;
  },
  (ctx) => {
    const { label, entities: e } = ctx;
    return `Audit readiness for ${label} includes immutable operator logs for treasury actions (deposit approval, manual fulfillment) and scoped API key rotation guidance for CI/CD. ${e.regulatory ?? "Enterprise legal teams receive plain-language mappings from contract clauses to dashboard behavior."}`;
  },
];

const EDUCATIONAL_PARAGRAPHS: readonly ParagraphComposer[] = [
  (ctx) => {
    const { label, entities: e } = ctx;
    return `${label} integration begins in staging: ${e.infrastructure}. Inject secrets from a vault—never commit long-lived keys to repositories. Validate proxy line formats with operator tools before attaching production worker pools.`;
  },
  (ctx) => {
    const { label, metrics: m } = ctx;
    return `Before promoting ${label} jobs, capture a baseline 403/429 histogram at ${m.safeConcurrency} workers. Scale with jittered schedules; linear ramps often trip velocity detectors on strict domains. Document failover paths when ${m.latencyP95} tails exceed SLO bands.`;
  },
  (ctx) => {
    const { label, entities: e } = ctx;
    return `${e.operational}. Wire webhook verification labs with least-privilege service accounts. ${label} runbooks should include copy-ready curl blocks, Python requests examples, and explicit notes on HTTP/2 client defaults your stack actually emits.`;
  },
  (ctx) => {
    const { label } = ctx;
    return `Escalation paths for ${label} are part of the documentation—not a footer link. When limits hit, measure next: subnet exposure, session stickiness TTL, ALPN parity, and pool class mix (datacenter vs residential vs ISP). Each knob is exposed in the dashboard or API without opening a second vendor relationship.`;
  },
];

const COMMERCIAL_FEATURES: readonly FeatureComposer[] = [
  (ctx) => ({
    title: `IX-aware ${ctx.label} steering`,
    body: `${ctx.entities.infrastructure}. Reduces correlated subnet bans when jobs require regional realism.`,
  }),
  (ctx) => ({
    title: `${ctx.metrics.latencyP50} median RTT envelope`,
    body: `Plan SLAs with published p95 ${ctx.metrics.latencyP95} tails—critical for checkout and ad-verification windows.`,
  }),
  (ctx) => ({
    title: "Rotation policies as code",
    body: "Sticky TTL, per-request refresh, and 403-driven subnet backoff—API-visible, not opaque heuristics.",
  }),
  (ctx) => ({
    title: `${ctx.metrics.estimatedIps} inventory band`,
    body: `Documented scale across ${ctx.metrics.metroRegions} for security questionnaires and capacity models.`,
  }),
  (ctx) => ({
    title: "Tri-protocol credentials",
    body: "HTTP, HTTPS, and SOCKS5 share auth primitives—switch transports without secret sprawl.",
  }),
  (ctx) => ({
    title: `${ctx.metrics.safeConcurrency} worker guardrail`,
    body: `Initial concurrency ceiling before global rate limits dominate ${ctx.lower} throughput.`,
  }),
];

const COMPLIANCE_FEATURES: readonly FeatureComposer[] = [
  (ctx) => ({
    title: "Subprocessor transparency",
    body: `${ctx.entities.infrastructure}. Registry updates ship with material-change summaries for ${ctx.label} buyers.`,
  }),
  (ctx) => ({
    title: "Retention defaults",
    body: "Connection metadata minimization with stricter windows on qualified enterprise commits.",
  }),
  (ctx) => ({
    title: "SKU-scoped KYC",
    body: `${ctx.entities.operational}. No surprise blanket identity collection on low-risk tiers.`,
  }),
  (ctx) => ({
    title: "Audit-friendly operator logs",
    body: "Treasury and fulfillment actions leave immutable trails for SOC-style reviews.",
  }),
  (ctx) => ({
    title: "DPA-ready annexes",
    body:
      ctx.entities.regulatory ??
      "Governance language maps contract clauses to product behavior.",
  }),
];

const EDUCATIONAL_FEATURES: readonly FeatureComposer[] = [
  (ctx) => ({
    title: "Staging-first patterns",
    body: `${ctx.entities.infrastructure}. Mirror production auth before cutover.`,
  }),
  (ctx) => ({
    title: "Runbook exports",
    body: `${ctx.entities.operational}. Drop outputs into tickets without manual redaction.`,
  }),
  (ctx) => ({
    title: "Histogram templates",
    body: `Track 403/429 curves at ${ctx.metrics.safeConcurrency} workers before scaling ${ctx.label} lanes.`,
  }),
  (ctx) => ({
    title: "Secret injection recipes",
    body: "Vault-backed keys for CI/CD—no long-lived credentials in repositories.",
  }),
  (ctx) => ({
    title: "Escalation checklists",
    body: "When limits hit: subnet exposure, ALPN parity, pool-class mix—each knob documented.",
  }),
];

const COMMERCIAL_FAQS: readonly FaqComposer[] = [
  (ctx) => ({
    question: `When should ${ctx.label} jobs fail over from datacenter to residential pools?`,
    answer: `When targets enforce ISP-grade ASN checks or behavioral scoring that penalizes hosting ranges. Datacenter remains economical for permissive APIs; residential improves completion on strict ${ctx.lower} commerce and SERP surfaces—validate with pilot block-rate telemetry.`,
  }),
  (ctx) => ({
    question: `How does peering context change TLS tail latency for ${ctx.label}?`,
    answer: `${ctx.entities.infrastructure}. Expect median ${ctx.metrics.latencyP50} with p95 near ${ctx.metrics.latencyP95} on comparable paths; radio or mobile classes sit higher than datacenter bulk.`,
  }),
  (ctx) => ({
    question: `Which rotation mode fits multi-step ${ctx.label} checkout flows?`,
    answer: "Use sticky TTL sessions until the flow completes; switch to error-driven rotation when HTTP 403 density spikes. Per-request rotation maximizes freshness but can invalidate OAuth cookies.",
  }),
  (ctx) => ({
    question: `How large is routable inventory for ${ctx.label}?`,
    answer: `Approximately ${ctx.metrics.estimatedIps} identities across ${ctx.metrics.metroRegions}, subject to SKU filters and contract tier. Bands are planning assumptions—pilots should confirm target-specific success.`,
  }),
  (ctx) => ({
    question: `What concurrency band is safe to start with for ${ctx.label}?`,
    answer: `Begin below ${ctx.metrics.safeConcurrency} workers, measure 429/403 ratios hourly, then scale with jitter. Doubling threads rarely halves-collect when targets enforce global caps.`,
  }),
  (ctx) => ({
    question: `Does IP Nova support SOCKS5 for ${ctx.label} stacks?`,
    answer: "Yes on eligible SKUs. SOCKS5 shares rotation semantics with HTTP/HTTPS—ideal for TLS-tunneling scrapers and anti-detect profiles.",
  }),
];

const COMPLIANCE_FAQS: readonly FaqComposer[] = [
  (ctx) => ({
    question: `Which subprocessors appear in a ${ctx.label} DPIA packet?`,
    answer: `${ctx.entities.infrastructure}. IP Nova publishes registry updates with material-change summaries; your lawful basis and DPIA remain your responsibility—we supply processing descriptions security teams can test.`,
  }),
  (ctx) => ({
    question: `What retention window applies to ${ctx.label} connection metadata?`,
    answer: "Defaults minimize connection metadata; enterprise commits can tighten windows further. Billing artifacts are stored separately from payload logging on qualified deals.",
  }),
  (ctx) => ({
    question: `Is KYC required for every ${ctx.label} SKU?`,
    answer: `${ctx.entities.operational}. KYC is scoped to high-risk classes—not a blanket requirement for low-risk datacenter bulk.`,
  }),
  (ctx) => ({
    question: `How are contract revisions communicated for ${ctx.label}?`,
    answer: "Dated revisions include material-delta summaries. Subprocessor changes follow notification windows where MSAs require them.",
  }),
  (ctx) => ({
    question: `Can auditors trace treasury actions related to ${ctx.label} accounts?`,
    answer: "Deposit approval and manual fulfillment emit immutable operator logs suitable for SOC-style reviews when enterprise logging profiles are enabled.",
  }),
];

const EDUCATIONAL_FAQS: readonly FaqComposer[] = [
  (ctx) => ({
    question: `How do I validate ${ctx.label} routing before production cutover?`,
    answer: `${ctx.entities.infrastructure}. Run staging workers below ${ctx.metrics.safeConcurrency}, export 403/429 histograms, and only then promote schedules to production orchestrators.`,
  }),
  (ctx) => ({
    question: `Where should ${ctx.label} secrets live in CI/CD?`,
    answer: `${ctx.entities.operational}. Use vault injection—never commit long-lived API keys to repositories or build logs.`,
  }),
  (ctx) => ({
    question: `What should a ${ctx.label} runbook include?`,
    answer: "Copy-ready curl/Python blocks, ALPN and HTTP/2 defaults your client emits, failover steps when p95 RTT exceeds SLO, and pool-class mix guidance.",
  }),
  (ctx) => ({
    question: `How do I escalate when ${ctx.label} jobs hit rate limits?`,
    answer: "Measure subnet exposure and session TTL first; adjust pacing with jitter; fail over pool classes from the dashboard rather than opening parallel vendor reviews mid-quarter.",
  }),
  (ctx) => ({
    question: `Are operator tools sufficient for ${ctx.label} QA?`,
    answer: "Tools validate formats and client-side checks; contractual SLAs and pooled inventory require the dashboard. Graduate when pilots prove block-rate envelopes.",
  }),
];

function poolForIntent<T>(intent: FallbackContext["intent"], commercial: readonly T[], compliance: readonly T[], educational: readonly T[]): readonly T[] {
  if (intent === "compliance") return compliance;
  if (intent === "educational") return educational;
  return commercial;
}

function selectTemplateIndex(ctx: FallbackContext): 0 | 1 | 2 {
  const offsets: Record<SeoCategory, number> = {
    products: 0,
    locations: 1,
    tools: 2,
    resources: 0,
    company: 1,
    legal: 2,
  };
  return (((hashSlot(ctx.seed, 99) % 3) + offsets[ctx.category]) % 3) as 0 | 1 | 2;
}

function buildMeta(ctx: FallbackContext, template: 0 | 1 | 2): Pick<
  SeoMatrixEntry,
  "metaTitle" | "metaDescription" | "eyebrow" | "h1" | "heroDescription"
> {
  const { label, metrics: m, category, entities: e } = ctx;
  const suffix = categoryEyebrowSuffix(category, ctx.seed);
  const eyebrowBase = CATEGORY_EYEBROW[category];

  if (ctx.intent === "compliance") {
    const titles = [
      `${label} Governance | IP Nova Assurance`,
      `${label} Compliance Controls | IP Nova`,
      `${label} Legal & Data Handling | IP Nova`,
    ] as const;
    const h1s = [
      `${label}: governance artifacts engineers can test`,
      `${label} controls mapped to product behavior`,
      `Assurance binder for ${label} programs`,
    ] as const;
    return {
      metaTitle: `${titles[template]}`,
      metaDescription: `${label} — ${e.regulatory ?? "DPA-aligned documentation"}, subprocessors, retention defaults, and KYC scope without proxy marketing filler.`,
      eyebrow: `${eyebrowBase} · ${suffix}`,
      h1: h1s[template],
      heroDescription: `${e.infrastructure}. ${e.operational}. Legal and security reviewers receive plain-language mappings from ${label} contract clauses to logging defaults—no shadow IT resellers, no unverifiable slogans.`,
    };
  }

  if (ctx.intent === "educational") {
    const titles = [
      `${label} Integration Guide | IP Nova`,
      `${label} Operator Runbook | IP Nova`,
      `${label} Staging Playbook | IP Nova`,
    ] as const;
    return {
      metaTitle: titles[template],
      metaDescription: `${label} — staging patterns, secret injection, ${m.safeConcurrency} worker baselines, and escalation checklists for production automation.`,
      eyebrow: `${eyebrowBase} · ${suffix}`,
      h1:
        template === 0
          ? `${label}: wire egress without guesswork`
          : template === 1
            ? `Operator runbook for ${label}`
            : `Staging ${label} before production traffic`,
      heroDescription: `${e.infrastructure}. ${e.operational}. Documentation assumes CI, vault-backed keys, and measurable 403/429 histograms—not laptop demos.`,
    };
  }

  const commercialTitles = [
    `${label} Egress Topology | ${m.latencyP50} RTT | IP Nova`,
    `${label} Control Plane | ${m.estimatedIps} IPs | IP Nova`,
    `${label} Enterprise Routing | IP Nova`,
  ] as const;
  const commercialH1 = [
    `${label} egress with ${m.latencyP50} median RTT`,
    `Control-plane routing for ${label}`,
    `Enterprise ${label} programs with measurable proof`,
  ] as const;

  return {
    metaTitle: commercialTitles[template],
    metaDescription: `${label}: ~${m.estimatedIps} IPs, ${m.metroRegions}, ${m.successRate} success band, ${m.safeConcurrency} concurrency guidance, HTTP/HTTPS/SOCKS5. ${e.infrastructure}.`,
    eyebrow: `${eyebrowBase} · ${suffix}`,
    h1: commercialH1[template],
    heroDescription: `${e.infrastructure}. Inventory near ${m.estimatedIps} across ${m.metroRegions}; median TLS RTT ${m.latencyP50} (p95 ${m.latencyP95}); ${m.successRate} observed success on comparable targets. ${e.operational}.`,
  };
}

function composeParagraphs(ctx: FallbackContext): string[] {
  const pool = poolForIntent(
    ctx.intent,
    COMMERCIAL_PARAGRAPHS,
    COMPLIANCE_PARAGRAPHS,
    EDUCATIONAL_PARAGRAPHS
  );
  const count = countInRange(ctx.seed, 40, 2, 4);
  const indices = pickUniqueIndices(pool.length, count, ctx.seed, 41);
  return indices.map((i) => pool[i]!(ctx));
}

function composeFeatures(ctx: FallbackContext): SeoFeatureItem[] {
  const pool = poolForIntent(
    ctx.intent,
    COMMERCIAL_FEATURES,
    COMPLIANCE_FEATURES,
    EDUCATIONAL_FEATURES
  );
  const count = countInRange(ctx.seed, 50, 3, 5);
  const indices = pickUniqueIndices(pool.length, count, ctx.seed, 51);
  return indices.map((i) => pool[i]!(ctx));
}

function composeFaqs(ctx: FallbackContext): SeoFaqItem[] {
  const pool = poolForIntent(
    ctx.intent,
    COMMERCIAL_FAQS,
    COMPLIANCE_FAQS,
    EDUCATIONAL_FAQS
  );
  const count = countInRange(ctx.seed, 60, 3, 5);
  const indices = pickUniqueIndices(pool.length, count, ctx.seed, 61);
  return indices.map((i) => pool[i]!(ctx));
}

export function buildFallbackSeoContent(
  slug: string,
  category: SeoCategory
): SeoMatrixEntry {
  const ctx = makeContext(slug, category);
  const template = selectTemplateIndex(ctx);
  const meta = buildMeta(ctx, template);

  return {
    ...meta,
    longFormParagraphs: composeParagraphs(ctx),
    features: composeFeatures(ctx),
    faqs: composeFaqs(ctx),
    layoutVariant: template,
  };
}
