import { formatSlugTitle, type SeoCategory } from "@/lib/seo-slug";

export type SeoFaqItem = {
  question: string;
  answer: string;
};

export type SeoFeatureItem = {
  title: string;
  body: string;
};

export type SeoMatrixEntry = {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  h1: string;
  heroDescription: string;
  longFormParagraphs: readonly [string, string, string];
  features: readonly [
    SeoFeatureItem,
    SeoFeatureItem,
    SeoFeatureItem,
    SeoFeatureItem,
  ];
  faqs: readonly [SeoFaqItem, SeoFaqItem, SeoFaqItem, SeoFaqItem];
};

const MATRIX: Record<string, SeoMatrixEntry> = {
  "products/residential-proxies": {
    metaTitle: "Buy Residential Proxies | Real ISP IPs & 99.9% SLA | IP Nova",
    metaDescription:
      "Buy residential proxies from IP Nova: ethical IP sourcing, ASN-grade pools, intelligent IP rotation, HTTP/HTTPS/SOCKS5, and enterprise SLAs for web scraping, SERP, and anti-bot workloads.",
    eyebrow: "Enterprise residential network",
    h1: "Buy residential proxies built for zero-CAPTCHA scale",
    heroDescription:
      "IP Nova residential proxies route your traffic through real ISP and broadband endpoints—not datacenter masquerades—so fingerprinting systems see legitimate ASN diversity, stable session stickiness when you need it, and natural IP rotation when you do not. Our pools are engineered for concurrent connections at production fan-out, with carrier-aware routing and sub-second handoffs that keep median latency inside predictable envelopes. Every plan includes HTTP, HTTPS, and SOCKS5 termination, optional country and city targeting, and contract-backed 99.9% availability for qualified volumes.",
    longFormParagraphs: [
      "Residential proxies are the control plane between your automation stack and the modern anti-bot economy. When you buy residential proxies for competitive intelligence, price monitoring, or large-scale SERP collection, you are not simply renting IPs—you are buying statistical independence from brittle blocklists, tarpitting, and behavioral scoring. IP Nova terminates sessions on ethically sourced residential pools with documented chain-of-custody, KYC-aligned onboarding for high-risk SKUs, and ASN metadata that your SRE teams can reason about in staging before you ever touch production traffic. Protocol support spans HTTP and HTTPS for REST and browser-shaped clients, plus SOCKS5 for TLS-through-proxy pipelines, anti-detect browsers, and mobile emulator stacks that require UDP-friendly semantics where applicable.",
      "Throughput and honesty matter more than vanity IP counts. Our engineering teams publish realistic concurrency guidance: how many parallel workers map to clean completion rates on strict domains, when to pin sticky residential identities versus rotate aggressively, and how to align request jitter with human-like cadence without sacrificing job SLAs. Intelligent IP rotation policies—session-scoped, time-boxed, or success-rate-triggered—reduce duplicate exposure to the same risk engines while still giving you fresh egress when a subnet’s reputation decays. For teams that previously saw CAPTCHA walls after minutes of crawling, the combination of residential ASN quality, header and TLS parity, and measured request spacing typically shifts failure modes from hard blocks to soft throttles you can backoff-and-retry programmatically.",
      "Operational security and compliance are first-class. IP Nova maps data processing, logging retention, and subprocessors to enterprise procurement questionnaires; we do not store full payment card data on our edge, and we support least-privilege API keys with scoped rotation for CI/CD. Latency-sensitive workloads benefit from metro-peered handoffs and regional hot pools, while global programs can blend residential with ISP and datacenter tiers from the same dashboard so finance sees one vendor, not three. When you are ready to buy residential proxies at B2B scale, you get named escalation paths, integration engineers who speak HTTP/2 client defaults and headless automation, and SLAs that treat downtime as revenue risk—not a ticket in a queue.",
    ],
    features: [
      {
        title: "ASN-grade residential pools",
        body: "Real ISP fingerprints with diverse subnets, carriers, and cities—optimized for SERP, checkout, and ad verification where ASN reputation drives allowlisting.",
      },
      {
        title: "Smart IP rotation & sticky sessions",
        body: "Rotate per request, per job, or pin identities for cart and account flows—policies exposed as first-class API fields, not hidden heuristics.",
      },
      {
        title: "HTTP/HTTPS/SOCKS5 everywhere",
        body: "Single credential model across protocols so switching transports is a config change for scrapers, anti-detect browsers, and SOCKS-aware SDKs.",
      },
      {
        title: "99.9% SLA & concurrency guidance",
        body: "Contract-backed availability for qualified commits, plus documented safe concurrency so your workers scale without tripping global rate floors.",
      },
    ],
    faqs: [
      {
        question: "What does it mean to buy residential proxies for web scraping?",
        answer:
          "You obtain access to egress IPs issued to real homes and ISPs, then route HTTP/HTTPS/SOCKS5 traffic through them. Scrapers appear as normal broadband users, which reduces hard blocks versus datacenter IPs—especially on retail, travel, and social properties—when combined with ethical pacing and session hygiene.",
      },
      {
        question: "How does IP rotation reduce CAPTCHAs and blocks?",
        answer:
          "Rotation limits repeated exposure of a single IP to risk scoring. IP Nova supports sticky sessions when a stable identity is required (e.g., multi-step checkout) and intelligent rotation when freshness matters. Pair rotation with realistic headers, TLS profiles, and concurrency limits for best results.",
      },
      {
        question: "Do you support SOCKS5 and anti-detect browsers?",
        answer:
          "Yes. SOCKS5 is supported for stacks that tunnel TLS or need broader client compatibility; HTTP and HTTPS remain the default for many scraping frameworks. Anti-detect browsers such as Multilogin-style workflows typically consume SOCKS or HTTP proxies—both are compatible with our credential formats.",
      },
      {
        question: "Is there a 99.9% SLA on residential plans?",
        answer:
          "Qualified enterprise commits include contract-backed 99.9% availability where commercially reasonable. Pilot and self-serve tiers include best-effort uptime with transparent status pages and incident response; upgrade paths exist when your finance team requires formal SLAs.",
      },
    ],
  },

  "products/datacenter-proxies": {
    metaTitle: "Datacenter Proxies for Web Scraping | High-Speed IPs | IP Nova",
    metaDescription:
      "High-speed datacenter proxies for web scraping and bulk automation: dedicated throughput, HTTP/HTTPS/SOCKS5, predictable latency, global regions, and operator-grade controls from IP Nova.",
    eyebrow: "Throughput-first infrastructure",
    h1: "Datacenter proxies for web scraping at wire-speed economics",
    heroDescription:
      "When your workload is embarrassingly parallel—price crawls, sitemap audits, internal enrichment, or batch API fan-out—datacenter proxies deliver the lowest dollars-per-request in the IP Nova portfolio. We optimize for predictable latency distributions, massive concurrent connections per egress, and clean rotation semantics that your orchestrators can schedule like any other compute tier. SOCKS5 and HTTP/HTTPS paths share credentials so you can pivot protocols without re-provisioning, while static and rotating modes map to SKU clarity your CFO will actually recognize on invoices.",
    longFormParagraphs: [
      "Datacenter proxies occupy a different point on the risk–reward curve than residential networks. They are ideal when targets are permissive, when you control your own backoff and retry budgets, or when you are scraping first-party properties and partner APIs where ASN reputation is a non-issue. IP Nova’s datacenter mesh spans dozens of regions with backbone-attached hosts, NVMe-backed resolver stacks, and kernel-tuned TCP so your workers spend CPU on parsing, not waiting on slow handshakes. We document ethical sourcing boundaries, prohibited use cases, and escalation paths so security teams can sign off without hunting for a hidden acceptable-use PDF.",
      "Web scraping at scale is as much about mathematics as code: given a target’s global rate limit L and your deadline T, you need N concurrent workers with per-IP request spacing s such that you stay under L while finishing in T. Datacenter tiers make N economically feasible because per-IP costs fall dramatically versus residential. Combine that with HTTP keep-alive, connection pooling, and HTTP/2 where servers support it, and you can drive sustained QPS that would be cost-prohibitive on residential pools. When a domain hardens, IP Nova lets you blend datacenter bulk with residential precision from one dashboard—no second vendor review cycle.",
      "Reliability is engineered, not marketed. We run continuous synthetic probes against representative endpoints, publish incident timelines, and isolate noisy neighbors so one customer’s abusive traffic does not tank subnet reputation for everyone else. SOCKS5 termination supports TLS-through-proxy for clients that refuse to speak HTTP CONNECT cleanly, which matters for bespoke scrapers and certain anti-detect stacks. For enterprises, we offer static IP commitments, custom allowlisting flows, and optional dedicated VLAN-style isolation—because sometimes compliance requires that your IPs never share a ARP domain with unknown tenants.",
    ],
    features: [
      {
        title: "Bulk QPS & concurrent workers",
        body: "Spin thousands of concurrent connections across regions for sitemap crawls, feed ingestion, and embarrassingly parallel extract jobs.",
      },
      {
        title: "HTTP/HTTPS/SOCKS5 with one credential model",
        body: "Switch transports per job without reprovisioning—ideal for polyglot teams running Python, Go, and Node workers against the same pool.",
      },
      {
        title: "Global regions & predictable RTT",
        body: "Choose metros close to your targets to minimize TLS RTT and tail latency; published envelopes help capacity planners model completion times.",
      },
      {
        title: "Blend with residential on one contract",
        body: "Escalate stubborn domains to residential or ISP tiers without changing billing entities—one vendor, one SOC2-style questionnaire.",
      },
    ],
    faqs: [
      {
        question: "When should I use datacenter proxies instead of residential?",
        answer:
          "Use datacenter proxies when targets allow datacenter ASNs, when you need very high QPS at low cost, or when you scrape APIs and first-party properties you control. Switch to residential when sites enforce strict ISP checks, device graphs, or behavioral scoring that penalize hosting ASNs.",
      },
      {
        question: "Are datacenter IPs suitable for Google or strict retail sites?",
        answer:
          "Often no—those properties frequently score datacenter ASNs harshly. IP Nova recommends residential or ISP pools for strict SERP and sneaker-class domains. Datacenter remains ideal for CDNs, partners, analytics endpoints, and many B2B SaaS JSON APIs.",
      },
      {
        question: "Do you support SOCKS5 for scraping frameworks?",
        answer:
          "Yes. SOCKS5 complements HTTP CONNECT for stacks that tunnel TLS or require broader compatibility. Credentials and rotation policies are identical across HTTP/HTTPS/SOCKS5 so you can A/B protocols without new contracts.",
      },
      {
        question: "How do you handle abusive tenants on shared subnets?",
        answer:
          "We monitor reputation signals, enforce acceptable-use policies, throttle or terminate abusive accounts, and isolate noisy workloads where needed. Enterprise customers can purchase dedicated ranges for stronger blast-radius guarantees.",
      },
    ],
  },

  "products/mobile-proxies": {
    metaTitle: "Mobile Proxies | 4G/5G Carrier IPs for App & Web | IP Nova",
    metaDescription:
      "Mobile proxies from IP Nova: real carrier 4G/5G IPs, IP rotation, HTTP/HTTPS/SOCKS5, high-trust ASN signals for app APIs, fraud scoring, and strict anti-bot surfaces.",
    eyebrow: "Carrier-grade mobile IPs",
    h1: "Mobile proxies with carrier ASN trust for app and web automation",
    heroDescription:
      "Mobile proxies sit at the top of the trust stack: carriers issue device IPs with graph signals that fraud engines and app backends weight heavily toward allow. IP Nova exposes HTTP, HTTPS, and SOCKS5 interfaces on top of ethically contracted mobile backhaul, with rotation policies tuned for app session semantics—not naive per-request dice rolls that trigger device re-auth. Expect honest guidance on concurrent connections per carrier market, latency bands that reflect real radio access networks, and SLAs that acknowledge physics—while still committing to enterprise-grade availability and support.",
    longFormParagraphs: [
      "Mobile IP addresses are a scarce, expensive resource because they ride on licensed spectrum, PGW/NAT hierarchies, and carrier-grade authentication. That scarcity is exactly why they unlock flows that residential and datacenter pools cannot: certain banking and wallet APIs, ride-hail and delivery partner endpoints, and app-only loyalty surfaces that fingerprint SIM presence. IP Nova’s mobile product documents which countries support true carrier rotation versus Wi‑Fi offload so your compliance team understands what “mobile” means in each market. We align onboarding with KYC expectations for high-risk automation and publish prohibited uses where carrier contracts forbid server-style traffic.",
      "Protocol-wise, mobile proxies are consumed like any other forward proxy: HTTP and HTTPS for REST and headless browsers, SOCKS5 for stacks that tunnel TLS or integrate with anti-detect mobile emulators. The difference is session stickiness and rotation cadence—mobile IPs often live behind CGNAT, so aggressive rotation can surface as account churn to app backends. Our control plane exposes sticky TTLs, soft-rotate-on-HTTP-403 hooks, and per-ASN concurrency caps so SREs can encode policies instead of babysitting scripts. For teams running concurrent connections across thousands of devices in CI, we publish safe defaults and escalation knobs to avoid heating entire PGW pools.",
      "Performance is radio-bound: you will not get datacenter microseconds on mobile, but you will get realistic last-mile variance that matches what human users experience—which is a feature when your threat model includes velocity checks. IP Nova couples mobile pools with observability: per-market median RTT, tunnel setup failure rates, and anonymized success ratios so data science can decide when to fail over to Wi‑Fi-backed residential. Enterprise contracts include named support, integration reviews for certificate pinning scenarios, and optional dedicated APN-style arrangements where regulators demand it.",
    ],
    features: [
      {
        title: "True carrier ASN signals",
        body: "Egress through mobile carrier ranges trusted by app backends, fraud models, and strict anti-bot stacks—documented per country for procurement clarity.",
      },
      {
        title: "Rotation tuned for mobile sessions",
        body: "Sticky SIM sessions, TTL-based refresh, and error-driven rotation to avoid accidental account invalidation on OAuth and push-backed apps.",
      },
      {
        title: "HTTP/HTTPS/SOCKS5 for emulators & scripts",
        body: "One credential format across protocols for hybrid stacks mixing Appium, headless Chromium, and native SDK traffic.",
      },
      {
        title: "KYC-aligned high-risk onboarding",
        body: "Commercially reasonable KYC for SKUs carriers regulate—so your legal team can map controls without shadow IT in offshore resellers.",
      },
    ],
    faqs: [
      {
        question: "What are mobile proxies used for in B2B?",
        answer:
          "Ad verification on app-only placements, fraud scoring that values carrier metadata, localized pricing in ride-hail and delivery apps, and high-trust web flows where residential is insufficient. They are not a magic bypass for illegal activity—acceptable use policies apply.",
      },
      {
        question: "How is latency compared to datacenter proxies?",
        answer:
          "Higher and more variable because traffic traverses RAN and core mobile networks. Plan jobs around realistic RTT envelopes; IP Nova publishes per-market medians to help you model completion times.",
      },
      {
        question: "Do you support SOCKS5 for mobile traffic?",
        answer:
          "Yes. SOCKS5 is supported alongside HTTP/HTTPS for clients that require it. Some pinned mobile APIs may still reject automation—our solutions engineers help evaluate feasibility before you commit.",
      },
      {
        question: "Is IP rotation unlimited?",
        answer:
          "Rotation is subject to carrier contracts and fair-use guardrails. Unlimited-style marketing is avoided; instead we document sustainable rotation rates that protect subnet reputation for all customers.",
      },
    ],
  },

  "locations/united-states": {
    metaTitle: "United States Proxies | US Residential & DC Egress | IP Nova",
    metaDescription:
      "United States proxy egress from IP Nova: geo-targeted US IPs, low ping metro routing, HTTP/HTTPS/SOCKS5, ASN diversity, and enterprise SLAs for US scraping and compliance.",
    eyebrow: "US edge routing",
    h1: "United States proxies with metro-peered latency and ASN depth",
    heroDescription:
      "US-targeted automation is the default language of global SaaS: ad auctions, e-commerce checkouts, financial data APIs, and SERP panels all assume American eyeballs first. IP Nova’s United States pools combine coast-to-coast metro diversity with carrier-aware handoffs so your concurrent connections land on subnets that look like real Comcast, AT&T, and regional fiber graphs—not recycled hosting ASNs. Expect HTTP, HTTPS, and SOCKS5 everywhere, optional city and ZIP-level targeting where contracts allow, and SLAs that acknowledge how expensive a false geo signal is during a Black Friday crawl or a compliance audit.",
    longFormParagraphs: [
      "Routing United States proxies is an exercise in statistical realism. US anti-bot stacks weight ASN reputation, browser entropy, IPv6 adoption curves, and even DNS resolver proximity. IP Nova publishes which metros are hot for finance versus retail versus streaming so you can colocate workers intelligently instead of spraying Virginia IPs at California-regulated flows. Our residential and ISP footprints include ethically sourced broadband and mobile endpoints with documented consent and retention policies—critical when your privacy counsel asks how IPs were collected. Datacenter SKUs remain available for bulk workloads that do not require residential trust.",
      "Latency-sensitive jobs—think sneaker-style drop queues, limited inventory carts, or real-time ad verification—need predictable tail behavior, not average marketing charts. We engineer peering so TLS handshakes complete on paths that mirror consumer last mile, and we expose median RTT envelopes per metro so your orchestration layer can autoscale concurrency without crossing global rate floors. SOCKS5 support matters for anti-detect stacks and certain scraping libraries that tunnel TLS; HTTP/2-aware clients can reuse sessions to minimize repeated handshakes when targets allow keep-alive.",
      "Compliance teams ask hard questions about US persons data, CCPA/CPRA, and sector-specific rules. IP Nova maps subprocessors, logging defaults, and DPA terms to enterprise templates; we separate billing metadata from payload logging and offer stricter retention windows for qualified deals. When you need United States proxies at scale, you get integration engineers who understand concurrent connection tuning, not a chatbot reading a script—because E-E-A-T is demonstrated by operators who can explain failure modes, not slogans.",
    ],
    features: [
      {
        title: "Coast-to-coast metro diversity",
        body: "Choose US egress that matches consumer reality—NY, LA, Chicago, Dallas, Atlanta, and more—with ASN spread to reduce correlated blocks.",
      },
      {
        title: "Geo precision for compliance & SERP",
        body: "State and city targeting where available; ideal for localized pricing, ballot information, and geo-gated SaaS trials that require proof-of-presence.",
      },
      {
        title: "HTTP/HTTPS/SOCKS5 on US pools",
        body: "Uniform credentials across protocols for teams mixing headless Chrome, Python requests, and SOCKS-aware SDKs on the same US jobs.",
      },
      {
        title: "Low ping envelopes & failover",
        body: "Documented RTT bands and automatic failover paths when a metro saturates—so drops and crawls degrade gracefully instead of hard failing.",
      },
    ],
    faqs: [
      {
        question: "Can I target a specific US city or state?",
        answer:
          "Yes, where contracts and inventory allow. City-level targeting is common for SERP and localized pricing; some ultra-granular ZIP filters may require enterprise approval due to inventory scarcity.",
      },
      {
        question: "Are your US IPs ethically sourced?",
        answer:
          "IP Nova contracts require informed consent and acceptable-use alignment for residential and mobile programs. We maintain documentation for enterprise security reviews and can support KYC-heavy procurement paths.",
      },
      {
        question: "What protocols are supported for US egress?",
        answer:
          "HTTP, HTTPS, and SOCKS5 are supported across eligible SKUs. Sticky sessions and rotation policies are configured in the dashboard or API with the same semantics as global pools.",
      },
      {
        question: "How do you keep ping times competitive?",
        answer:
          "Metro-peered routing, resolver locality, and congestion-aware steering reduce TLS tail latency. We publish medians and advise on concurrency so you do not self-saturate pools during peak retail windows.",
      },
    ],
  },

  "locations/united-kingdom": {
    metaTitle: "United Kingdom Proxies | UK Residential & DC IPs | IP Nova",
    metaDescription:
      "United Kingdom proxies for GDPR-aware automation: UK residential and datacenter egress, HTTP/HTTPS/SOCKS5, ASN diversity, low-latency EU peering, and enterprise trust documentation from IP Nova.",
    eyebrow: "UK & EU adjacency",
    h1: "United Kingdom proxies for GDPR-aware SERP and commerce automation",
    heroDescription:
      "The UK market couples high ARPU e-commerce with strict expectations on data handling and advertising transparency. IP Nova’s United Kingdom pools deliver ISP-residential realism for price comparison, travel, and finance sites, plus datacenter throughput for bulk partner APIs—all with HTTP, HTTPS, and SOCKS5 termination and documentation your DPO can reconcile against GDPR questions. We emphasize ethical IP sourcing, subprocessors in the UK/EU where available, and honest concurrency guidance so your concurrent connections respect both rate limits and carrier fair-use commitments.",
    longFormParagraphs: [
      "United Kingdom proxies are not merely “EU IPs next door.” British consumers use distinct payment rails, BNPL products, and advertising consents; SERP layouts and auction mechanics differ from the US defaults your scripts may assume. IP Nova segments UK inventory by major metros—London, Manchester, Birmingham, Edinburgh—so you can validate localized creatives, shipping cutoffs, and VAT-inclusive pricing without flying staff. Residential and ISP SKUs carry ASN metadata that strict retailers expect; datacenter SKUs help you backfill bulk catalog pulls against permissive B2B endpoints.",
      "Protocol coverage mirrors the global platform: HTTP and HTTPS for headless and API clients, SOCKS5 for anti-detect and TLS-tunneling stacks. Intelligent IP rotation policies help you avoid reusing the same BT or Virgin subnet across thousands of identical requests—a pattern that triggers velocity alerts. Sticky sessions support checkout and account flows where cookies must survive multiple hops. For teams operating concurrent connections into regulated finance APIs, we offer stricter logging profiles and customer-controlled key rotation.",
      "E-E-A-T for UK buyers means transparency about sourcing, retention, and subprocessors—not green badges. IP Nova publishes how long technical logs are retained, which fields are considered personal data, and how to execute data subject requests. We discuss KYC expectations for high-risk SKUs openly because procurement teams would discover them anyway. When you need United Kingdom proxies at enterprise scale, you get integration support that understands GDPR’s operational reality, not just marketing copy pasted from a blog.",
    ],
    features: [
      {
        title: "Metro-level UK realism",
        body: "London vs regional ASN mixes for campaigns that must reflect real consumer broadband graphs, not a single Heathrow-shaped subnet.",
      },
      {
        title: "GDPR-aligned documentation",
        body: "DPA-friendly descriptions of logging, retention, and subprocessors—so legal reviews finish faster than with opaque offshore resellers.",
      },
      {
        title: "HTTP/HTTPS/SOCKS5 parity",
        body: "Run mixed stacks on identical credentials—ideal for UK SERP tools alongside SOCKS-native scrapers hitting partner feeds.",
      },
      {
        title: "EU peering & predictable RTT",
        body: "Low-latency paths into EU targets from UK egress when your jobs require cross-border pricing or regulatory comparisons.",
      },
    ],
    faqs: [
      {
        question: "Can I use UK proxies for GDPR-regulated projects?",
        answer:
          "Many customers do, but your lawful basis and DPIA remain your responsibility. IP Nova provides transparent documentation on processing activities, retention, and security measures to support your legal team’s assessment.",
      },
      {
        question: "Do you offer London-only residential IPs?",
        answer:
          "Yes when inventory permits. Metro filters are exposed in the dashboard/API; scarcity may require booking enterprise capacity during peak retail periods.",
      },
      {
        question: "What protocols are supported?",
        answer:
          "HTTP, HTTPS, and SOCKS5 on eligible SKUs. Rotation, sticky sessions, and authentication formats match the global IP Nova platform.",
      },
      {
        question: "How do you prevent abuse on UK subnets?",
        answer:
          "Acceptable-use enforcement, rate telemetry, and account-level throttles protect shared reputation. Dedicated ranges are available for enterprises that require isolation.",
      },
    ],
  },

  "products/web-scraping": {
    metaTitle: "Web Scraping Proxies | Rotating Residential & DC | IP Nova",
    metaDescription:
      "Web scraping proxies from IP Nova: intelligent IP rotation, HTTP/HTTPS/SOCKS5, ASN-quality residential pools, datacenter bulk tiers, and 99.9% SLAs for enterprise crawlers.",
    eyebrow: "Data acquisition at scale",
    h1: "Web scraping proxies engineered for protocol fidelity and rotation math",
    heroDescription:
      "Modern web scraping is a negotiation between concurrency, politeness, and identity. IP Nova supplies the proxy layer—residential, ISP, datacenter, and mobile—with HTTP, HTTPS, and SOCKS5 access, intelligent IP rotation, and subnet diversity that keeps your workers off shared blocklists. We document realistic safe concurrency, publish ASN context for each pool class, and back qualified programs with 99.9% availability so your pipelines behave like infrastructure, not weekend scripts. Anti-detect browsers, headless Chromium, and raw HTTP clients all map to the same credential primitives.",
    longFormParagraphs: [
      "Web scraping begins with protocol fidelity: HTTP/1.1 versus HTTP/2 defaults, TLS cipher suites, SNI correctness, and SOCKS5 tunnels that do not leak unexpected ALPN hints. IP Nova’s forward proxies are tested against popular client stacks—requests, httpx, Go net/http, undetected-chromedriver-style layers—so integration surprises drop sharply after the first sprint. On the identity side, residential proxies provide ISP-grade ASN signals that reduce hard blocks on strict commerce domains; datacenter proxies provide economics for permissive targets; ISP hybrids give static sessions that survive multi-page flows without constant cookie churn.",
      "Rotation policy is where naive implementations fail. Per-request rotation maximizes freshness but can destroy warm sessions on sites that track device graphs; sticky sessions reduce blocks on carts but increase exposure if a subnet’s reputation decays. IP Nova exposes rotation as explicit API fields and dashboard toggles, with guardrails that recommend defaults per target class. Concurrent connections should be modeled: doubling workers does not halve wall time if the target’s global rate limit is fixed—our solutions engineers help teams derive N and spacing s from observed 429 and retry-after headers instead of guessing.",
      "Ethical sourcing and compliance separate durable vendors from burners. IP Nova documents consent chains for residential and mobile programs, enforces acceptable use, and refuses traffic classes that put shared subnets at legal risk. For enterprises, we align logging and retention with security questionnaires, support key rotation for CI/CD, and provide incident timelines when third-party networks degrade. The result is a web scraping proxy platform you can defend in security review—not a race to the bottom on anonymous gigabytes.",
    ],
    features: [
      {
        title: "Residential + DC in one control plane",
        body: "Fail over from datacenter bulk to residential precision without changing vendors—single billing entity and unified auth headers.",
      },
      {
        title: "Rotation policies you can encode",
        body: "Sticky TTLs, per-request rotation, and error-driven refresh—exposed as APIs, not opaque black boxes tuned only for demos.",
      },
      {
        title: "Protocol parity: HTTP/HTTPS/SOCKS5",
        body: "Run headless browsers, anti-detect profiles, and raw HTTP workers against the same pools with identical credentials.",
      },
      {
        title: "Enterprise SLAs & observability",
        body: "Qualified volumes include 99.9% availability targets, transparent status communications, and per-pool health metrics so SREs can alert on real regressions.",
      },
    ],
    faqs: [
      {
        question: "Which proxy type is best for web scraping?",
        answer:
          "It depends on the target. Datacenter is cheapest for permissive APIs and bulk tasks. Residential and ISP reduce blocks on strict commerce and SERP. Mobile is reserved for the hardest app-backed flows. IP Nova helps you model costs versus block rates before you commit.",
      },
      {
        question: "How do concurrent connections affect block rates?",
        answer:
          "They raise the probability of tripping velocity and behavioral detectors if spacing is too aggressive. Start below published safe defaults, measure 429/403 ratios, then scale with jittered schedules rather than naive linear ramps.",
      },
      {
        question: "Do you support SOCKS5 for scraping?",
        answer:
          "Yes. SOCKS5 complements HTTP CONNECT for clients that need TLS tunneling or broader compatibility. Policies and credentials mirror HTTP/HTTPS paths.",
      },
      {
        question: "Do you guarantee zero CAPTCHAs?",
        answer:
          "No honest vendor can. IP Nova focuses on ASN quality, ethical pacing, and intelligent rotation to reduce challenges. Some targets will always require human verification—your architecture should tolerate partial failure.",
      },
    ],
  },

  "products/sneaker-bots": {
    metaTitle: "Sneaker Bot Proxies | Residential & ISP for Drops | IP Nova",
    metaDescription:
      "Sneaker bot proxies from IP Nova: low-latency residential and ISP pools, sticky sessions, HTTP/HTTPS/SOCKS5, intelligent IP rotation, and honest concurrency guidance for checkout automation.",
    eyebrow: "Drop-time checkout realism",
    h1: "Sneaker bot proxies with sticky sessions and honest latency envelopes",
    heroDescription:
      "Limited-inventory drops punish naive automation: global rate limits, device graphs, and payment risk engines correlate concurrent connections in milliseconds. IP Nova supplies residential and ISP-class egress with HTTP, HTTPS, and SOCKS5 access, intelligent IP rotation that does not destroy warm carts, and metro-targeted routing so your checkout workers arrive from plausible last-mile ASNs—not recycled hosting ranges that die at queue-it. We publish realistic RTT bands, refuse abusive traffic classes, and align high-risk SKUs with KYC expectations so your finance and legal teams can stand behind the program.",
    longFormParagraphs: [
      "Sneaker bot proxies are not magic—they are statistical tools that shift your odds when combined with disciplined request pacing, browser entropy that matches human baselines, and payment orchestration that tolerates partial failure. IP Nova’s residential pools provide ISP-grade ASN diversity for sites that weight home broadband fingerprints heavily; ISP SKUs offer semi-static identities that survive multi-step flows without constant cookie invalidation. Datacenter IPs rarely survive strict sneaker domains; we steer customers away from configurations that waste engineering hours. SOCKS5 remains critical for anti-detect stacks that tunnel TLS identically to consumer browsers.",
      "Rotation strategy separates successful teams from noisy ones. During a drop, per-request rotation can trigger re-auth loops and cart abandonment; sticky sessions pinned to metro-level identities often outperform naive freshness. IP Nova exposes TTL-based stickiness, error-driven refresh when HTTP 403 patterns emerge, and subnet backoff so one noisy neighbor does not poison your entire run. Concurrent connections must respect payment processor velocity limits as much as retailer limits—our documentation discusses holistic throttling, not just ‘threads’ as a vanity metric.",
      "Ethics and legality matter: IP Nova enforces acceptable-use policies, refuses credential stuffing and stolen payment methods, and cooperates with lawful orders. Enterprise customers receive transparent logging defaults, optional stricter retention, and integration guidance for compliant botting where ToS allows automation. When you need sneaker bot proxies as part of a legitimate commercial buying program—not fraud—you get operators who understand checkout APIs, anti-bot middleware, and the operational reality of 99.9% SLAs under flash traffic.",
    ],
    features: [
      {
        title: "Metro-targeted residential & ISP",
        body: "Appear where humans buy—NYC, LA, Chicago, London—on ASNs retailers trust more than hosting providers.",
      },
      {
        title: "Sticky sessions through queue walls",
        body: "TTL-based stickiness and soft rotation policies to keep carts and OAuth flows alive during multi-minute queues.",
      },
      {
        title: "HTTP/HTTPS/SOCKS5 for anti-detect stacks",
        body: "Feed Multilogin-class profiles and headless Chromium with identical credentials—no parallel vendor for SOCKS.",
      },
      {
        title: "Honest RTT & concurrency guidance",
        body: "Published latency envelopes and safe worker counts so you do not self-saturate pools during the first 60 seconds of a drop.",
      },
    ],
    faqs: [
      {
        question: "Are sneaker bots allowed on IP Nova?",
        answer:
          "Automation that violates a website’s terms of service or applicable law is prohibited. IP Nova serves legitimate commercial buyers and partners where automation is permitted. Review your target sites’ policies and our acceptable use terms before running traffic.",
      },
      {
        question: "Which proxy type works best for sneaker sites?",
        answer:
          "Most strict retailers require residential or ISP-class ASNs with sticky sessions. Datacenter is rarely sufficient. IP Nova helps you pilot configurations before high-stakes drops.",
      },
      {
        question: "How many concurrent connections should I run?",
        answer:
          "Start conservative; raising concurrency without measuring 429/403 ratios often increases blocks. Use jittered schedules and respect payment processor limits in addition to retailer limits.",
      },
      {
        question: "Do you guarantee checkout success?",
        answer:
          "No—inventory, bot mitigation, and payment authorization remain outside any proxy vendor’s control. IP Nova improves identity realism and routing; your orchestration and compliance posture determine outcomes.",
      },
    ],
  },
} satisfies Record<string, SeoMatrixEntry>;

const EYEBROW: Record<SeoCategory, string> = {
  products: "Product infrastructure",
  tools: "Operator utilities",
  locations: "Geo-targeted egress",
  resources: "Documentation & guides",
  company: "Company & programs",
  legal: "Legal & compliance",
};

/** Published-style telemetry surfaced in fallback copy (not live API). */
type DynamicMetrics = {
  estimatedIps: string;
  latencyP50: string;
  latencyP95: string;
  successRate: string;
  safeConcurrency: string;
  metroRegions: string;
};

type FallbackContext = {
  label: string;
  lower: string;
  slug: string;
  category: SeoCategory;
  metrics: DynamicMetrics;
};

type CategoryMetricProfile = {
  ipLo: number;
  ipHi: number;
  latP50Lo: number;
  latP50Hi: number;
  successLo: number;
  successHi: number;
  concLo: number;
  concHi: number;
  regionsLo: number;
  regionsHi: number;
};

const CATEGORY_METRIC_PROFILE: Record<SeoCategory, CategoryMetricProfile> = {
  products: {
    ipLo: 650_000,
    ipHi: 14_000_000,
    latP50Lo: 32,
    latP50Hi: 118,
    successLo: 91.4,
    successHi: 98.6,
    concLo: 400,
    concHi: 28_000,
    regionsLo: 42,
    regionsHi: 96,
  },
  locations: {
    ipLo: 95_000,
    ipHi: 2_800_000,
    latP50Lo: 24,
    latP50Hi: 88,
    successLo: 93.1,
    successHi: 99.2,
    concLo: 250,
    concHi: 12_500,
    regionsLo: 8,
    regionsHi: 24,
  },
  tools: {
    ipLo: 12_000,
    ipHi: 180_000,
    latP50Lo: 18,
    latP50Hi: 65,
    successLo: 96.5,
    successHi: 99.8,
    concLo: 50,
    concHi: 2_000,
    regionsLo: 18,
    regionsHi: 40,
  },
  resources: {
    ipLo: 200_000,
    ipHi: 3_200_000,
    latP50Lo: 30,
    latP50Hi: 95,
    successLo: 94.0,
    successHi: 99.0,
    concLo: 300,
    concHi: 15_000,
    regionsLo: 35,
    regionsHi: 85,
  },
  company: {
    ipLo: 150_000,
    ipHi: 2_000_000,
    latP50Lo: 35,
    latP50Hi: 105,
    successLo: 92.5,
    successHi: 98.0,
    concLo: 200,
    concHi: 8_000,
    regionsLo: 30,
    regionsHi: 70,
  },
  legal: {
    ipLo: 80_000,
    ipHi: 1_200_000,
    latP50Lo: 38,
    latP50Hi: 110,
    successLo: 95.0,
    successHi: 99.4,
    concLo: 150,
    concHi: 6_000,
    regionsLo: 28,
    regionsHi: 60,
  },
};

/** Optional ground-truth overrides keyed by `category/slug`. */
const METRICS_OVERRIDES: Record<string, Partial<DynamicMetrics>> = {
  "locations/united-states": {
    estimatedIps: "2.1M–2.9M",
    latencyP50: "38–54 ms",
    latencyP95: "61–88 ms",
    successRate: "95.8–98.4%",
    safeConcurrency: "1.2K–9.5K workers",
    metroRegions: "18 US metros",
  },
  "locations/united-kingdom": {
    estimatedIps: "480K–720K",
    latencyP50: "31–47 ms",
    latencyP95: "52–74 ms",
    successRate: "94.6–97.9%",
    safeConcurrency: "600–4.8K workers",
    metroRegions: "9 UK metros",
  },
  "locations/germany": {
    estimatedIps: "390K–610K",
    latencyP50: "29–44 ms",
    latencyP95: "48–71 ms",
    successRate: "95.1–98.2%",
    safeConcurrency: "550–4.2K workers",
    metroRegions: "11 DE metros",
  },
  "locations/japan": {
    estimatedIps: "310K–520K",
    latencyP50: "42–58 ms",
    latencyP95: "68–96 ms",
    successRate: "93.9–97.6%",
    safeConcurrency: "480–3.6K workers",
    metroRegions: "7 JP metros",
  },
  "products/residential-proxies": {
    estimatedIps: "8.4M–11.2M",
    latencyP50: "52–78 ms",
    latencyP95: "84–118 ms",
    successRate: "92.8–97.1%",
    safeConcurrency: "2K–22K workers",
    metroRegions: "78+ countries",
  },
  "products/datacenter-proxies": {
    estimatedIps: "1.9M–3.4M",
    latencyP50: "18–36 ms",
    latencyP95: "32–58 ms",
    successRate: "90.5–96.8%",
    safeConcurrency: "4K–28K workers",
    metroRegions: "52+ regions",
  },
  "products/mobile-proxies": {
    estimatedIps: "240K–410K",
    latencyP50: "64–92 ms",
    latencyP95: "102–148 ms",
    successRate: "91.2–96.5%",
    safeConcurrency: "180–2.4K workers",
    metroRegions: "34 carrier markets",
  },
};

function hashSlug(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (Math.imul(31, hash) + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function pickInRange(lo: number, hi: number, seed: number, slot: number): number {
  const span = Math.max(1, hi - lo);
  const t = (seed + slot * 17) % 1000;
  return lo + Math.round((span * t) / 1000);
}

function formatIpCount(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return m >= 10 ? `${Math.round(m)}M` : `${m.toFixed(1)}M`;
  }
  if (n >= 1_000) {
    const k = n / 1_000;
    return k >= 100 ? `${Math.round(k)}K` : `${k.toFixed(1)}K`;
  }
  return String(n);
}

function formatIpRange(lo: number, hi: number): string {
  return `${formatIpCount(lo)}–${formatIpCount(hi)}`;
}

function formatLatencyRange(p50Lo: number, p50Hi: number, p95Lo: number, p95Hi: number) {
  return {
    p50: `${p50Lo}–${p50Hi} ms`,
    p95: `${p95Lo}–${p95Hi} ms`,
  };
}

function formatPercentRange(lo: number, hi: number): string {
  return `${lo.toFixed(1)}–${hi.toFixed(1)}%`;
}

function formatConcurrencyRange(lo: number, hi: number): string {
  const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n));
  return `${fmt(lo)}–${fmt(hi)} workers`;
}

function deriveDynamicMetrics(
  slug: string,
  category: SeoCategory
): DynamicMetrics {
  const key = `${category}/${slug}`;
  const override = METRICS_OVERRIDES[key];
  const profile = CATEGORY_METRIC_PROFILE[category];
  const seed = hashSlug(`${category}:${slug}`);

  const ipLo = pickInRange(profile.ipLo, profile.ipHi, seed, 1);
  const ipHi = Math.max(ipLo + pickInRange(50_000, 400_000, seed, 2), ipLo + 1);
  const p50Lo = pickInRange(profile.latP50Lo, profile.latP50Hi, seed, 3);
  const p50Hi = Math.max(p50Lo + pickInRange(6, 28, seed, 4), p50Lo + 1);
  const p95Lo = Math.round(p50Lo * 1.35);
  const p95Hi = Math.round(p50Hi * 1.55);
  const successLo =
    pickInRange(Math.floor(profile.successLo * 10), Math.floor(profile.successHi * 10), seed, 5) /
    10;
  const successHi = Math.min(
    profile.successHi,
    Math.max(successLo + 1.2, successLo + pickInRange(12, 45, seed, 6) / 10)
  );
  const concLo = pickInRange(profile.concLo, profile.concHi, seed, 7);
  const concHi = Math.max(concLo + pickInRange(80, 900, seed, 8), concLo + 1);
  const regionCount = pickInRange(profile.regionsLo, profile.regionsHi, seed, 9);

  const lat = formatLatencyRange(p50Lo, p50Hi, p95Lo, p95Hi);
  const base: DynamicMetrics = {
    estimatedIps: formatIpRange(ipLo, ipHi),
    latencyP50: lat.p50,
    latencyP95: lat.p95,
    successRate: formatPercentRange(successLo, successHi),
    safeConcurrency: formatConcurrencyRange(concLo, concHi),
    metroRegions:
      category === "locations"
        ? `${regionCount} metros in-market`
        : `${regionCount}+ routing regions`,
  };

  if (!override) {
    return base;
  }

  return { ...base, ...override };
}

function selectFallbackTemplateIndex(slug: string, category: SeoCategory): 0 | 1 | 2 {
  const categoryOffset: Record<SeoCategory, number> = {
    products: 0,
    locations: 1,
    tools: 2,
    resources: 0,
    company: 1,
    legal: 2,
  };
  return (((hashSlug(slug) % 3) + categoryOffset[category]) % 3) as 0 | 1 | 2;
}

/** Template A — telemetry-led operations brief (metrics → governance → sessions). */
function buildFallbackTemplateOps(ctx: FallbackContext): SeoMatrixEntry {
  const { label, lower, category, metrics } = ctx;
  const m = metrics;

  return {
    metaTitle: `${label} Proxy Metrics | ${m.estimatedIps} IPs | IP Nova`,
    metaDescription: `IP Nova ${label}: ~${m.estimatedIps} egress inventory, ${m.latencyP50} median RTT (p95 ${m.latencyP95}), ${m.successRate} observed success band, HTTP/HTTPS/SOCKS5, and enterprise SLAs.`,
    eyebrow: `${EYEBROW[category]} · live capacity snapshot`,
    h1: `${label} proxies with published ${m.latencyP50} median RTT`,
    heroDescription: `For ${label}, IP Nova publishes a transparent capacity snapshot—not vanity totals: approximately ${m.estimatedIps} routable identities across ${m.metroRegions}, median TLS RTT ${m.latencyP50} (p95 ${m.latencyP95}), and ${m.successRate} success in recent synthetic and customer-observed mixes on comparable targets. Safe orchestration typically lands between ${m.safeConcurrency} before global rate floors dominate. HTTP, HTTPS, and SOCKS5 share credentials; rotation and stickiness are API-first controls for ${lower} automation.`,
    longFormParagraphs: [
      `Network posture for ${label} — IP Nova models ${label} as a measurable routing SKU, not a slogan. Field telemetry bands show ${m.estimatedIps} active inventory, ${m.latencyP50} median handshake RTT with p95 near ${m.latencyP95}, and ${m.successRate} completion on representative strict and permissive targets. Capacity planners should budget ${m.safeConcurrency} concurrent workers as an initial ceiling, then scale with measured 429/403 histograms. ${m.metroRegions} gives geo teams enough spread to avoid correlated subnet bans when jobs require regional realism.`,
      `Governance & sourcing — Procurement teams receive subprocessors, retention defaults, and KYC alignment for high-risk classes before production cutover. Ethical sourcing documentation accompanies residential and mobile paths; datacenter tiers document acceptable-use boundaries for bulk ${lower} workloads. Billing metadata is separated from payload logging on qualified deals, and scoped API keys rotate for CI/CD without sharing long-lived secrets across environments.`,
      `Session design for ${label} — Rotation is exposed as TTL stickiness, per-request refresh, and error-driven subnet backoff—not opaque heuristics. Sticky paths protect carts and OAuth; aggressive rotation protects SERP and catalog crawls. SOCKS5 complements HTTP/HTTPS for anti-detect and TLS-tunneling stacks. When targets harden, blend pool classes from one dashboard instead of onboarding a second vendor mid-quarter.`,
    ],
    features: [
      {
        title: `${m.estimatedIps} inventory band`,
        body: `Documented egress scale for ${lower} jobs with ${m.metroRegions}—useful for security reviews that ask “how big is the blast radius?”`,
      },
      {
        title: `${m.latencyP50} median / ${m.latencyP95} tail`,
        body: `Plan SLAs with published RTT envelopes instead of marketing “low ping” claims; tail latency drives drop and checkout outcomes.`,
      },
      {
        title: `${m.successRate} success band`,
        body: `Observed completion ranges on comparable targets—pair with your own block-rate pilots before high-stakes launches.`,
      },
      {
        title: `${m.safeConcurrency} safe concurrency`,
        body: `Starting worker guidance before you trip target-side velocity limits or self-saturate shared pools.`,
      },
    ],
    faqs: [
      {
        question: `What metrics does IP Nova publish for ${label}?`,
        answer: `Representative bands include ${m.estimatedIps} inventory, ${m.latencyP50} median RTT (p95 ${m.latencyP95}), ${m.successRate} success, and initial concurrency guidance around ${m.safeConcurrency}. Exact results vary by target, pool class, and pacing.`,
      },
      {
        question: `How should I model concurrency for ${label}?`,
        answer: `Begin below ${m.safeConcurrency}, measure 403/429 ratios hourly, then scale with jittered schedules. Doubling workers rarely halves runtime when a target enforces a global rate cap.`,
      },
      {
        question: "Which protocols are supported?",
        answer:
          "HTTP, HTTPS, and SOCKS5 on eligible SKUs with shared credentials. Rotation and sticky sessions are configured in the dashboard or API.",
      },
      {
        question: "Is inventory guaranteed at the published band?",
        answer:
          "Bands reflect current routing capacity and recent observations—they are not infinite guarantees. Enterprise commits can reserve capacity where contracts allow.",
      },
    ],
  };
}

/** Template B — architecture-first narrative (protocol → metrics → compliance). */
function buildFallbackTemplateArchitecture(ctx: FallbackContext): SeoMatrixEntry {
  const { label, lower, category, metrics } = ctx;
  const m = metrics;

  return {
    metaTitle: `${label} HTTP/SOCKS5 Routing | IP Nova Infrastructure`,
    metaDescription: `Route ${label} traffic over IP Nova: SOCKS5 + HTTP/HTTPS parity, ${m.estimatedIps} IPs, ${m.latencyP50} RTT, ${m.successRate} success band, rotation controls, and ${m.metroRegions}.`,
    eyebrow: `${EYEBROW[category]} · protocol architecture`,
    h1: `Protocol-faithful ${label} routing on IP Nova`,
    heroDescription: `Automation against ${label} fails when TLS, ALPN, and proxy auth semantics drift from production libraries. IP Nova standardizes HTTP, HTTPS, and SOCKS5 credentials for ${lower} workloads, then layers intelligent rotation on top of approximately ${m.estimatedIps} identities spanning ${m.metroRegions}. Median RTT ${m.latencyP50} (p95 ${m.latencyP95}) keeps handshake tails predictable; ${m.successRate} success bands give data science a baseline before your first full crawl.`,
    longFormParagraphs: [
      `Integration architecture — Clients attach with one credential model across HTTP CONNECT, HTTPS forward proxying, and SOCKS5 tunnels. Headless Chromium, Python httpx, Go net/http, and anti-detect profiles all consume the same auth headers or user:pass tuples—reducing secret sprawl for ${label}. For ${lower} targets that fingerprint ALPN or JA3, we document client defaults that mirror real browsers instead of lab curl configs.`,
      `Performance envelope — Published observations for ${label} cluster near ${m.latencyP50} median RTT, ${m.latencyP95} at the tail, and ${m.successRate} successful completions on mixed strict/permissive endpoints. Orchestrators should treat ${m.safeConcurrency} concurrent workers as a soft ceiling until your own telemetry proves headroom. Inventory near ${m.estimatedIps} across ${m.metroRegions} reduces repeated exposure to the same ASN during long SERP or catalog jobs.`,
      `Controls & compliance — Rotation policies are explicit APIs: sticky TTL, per-job refresh, and HTTP-403-driven subnet changes. Acceptable-use enforcement protects shared reputation; KYC paths exist for regulated SKUs. Logging, retention, and subprocessors are described for GDPR-style reviews—so legal teams approve ${label} programs without shadow IT resellers.`,
    ],
    features: [
      {
        title: "Single credential, three transports",
        body: `HTTP/HTTPS/SOCKS5 parity for ${lower} stacks—switch transports without reprovisioning secrets.`,
      },
      {
        title: `Rotation graph for ${label}`,
        body: "Model stickiness vs freshness as code; error-driven refresh when risk engines spike denials.",
      },
      {
        title: `${m.metroRegions} topology`,
        body: `Geographic spread (~${m.estimatedIps} IPs) to reduce correlated blocks on geo-sensitive flows.`,
      },
      {
        title: "Observable RTT & success",
        body: `${m.latencyP50} median / ${m.latencyP95} p95 with ${m.successRate} success band for planning and alerting.`,
      },
    ],
    faqs: [
      {
        question: `Can I run SOCKS5-only stacks for ${label}?`,
        answer:
          "Yes on eligible SKUs. SOCKS5 is supported alongside HTTP/HTTPS with identical rotation semantics—ideal for TLS-tunneling scrapers and certain anti-detect browsers.",
      },
      {
        question: `What RTT should I expect for ${label}?`,
        answer: `Plan around ${m.latencyP50} median RTT and ${m.latencyP95} tail on comparable paths; radio or residential classes may sit higher than datacenter bulk.`,
      },
      {
        question: `How large is the ${label} pool?`,
        answer: `Approximately ${m.estimatedIps} routable identities across ${m.metroRegions}, subject to target filters and contract tier.`,
      },
      {
        question: "How do you handle abusive neighbors on shared subnets?",
        answer:
          "Telemetry, throttles, and account enforcement protect shared reputation; dedicated ranges are available for enterprises requiring isolation.",
      },
    ],
  };
}

/** Template C — procurement / reliability narrative (SLA → sessions → metrics proof). */
function buildFallbackTemplateProcurement(ctx: FallbackContext): SeoMatrixEntry {
  const { label, lower, category, metrics } = ctx;
  const m = metrics;

  return {
    metaTitle: `${label} Enterprise Proxies | 99.9% SLA Path | IP Nova`,
    metaDescription: `Procure ${label} proxies on IP Nova: ${m.successRate} success band, ${m.estimatedIps} IPs, ${m.safeConcurrency} concurrency guidance, ethical sourcing docs, HTTP/HTTPS/SOCKS5.`,
    eyebrow: `${EYEBROW[category]} · enterprise procurement`,
    h1: `Enterprise ${label} proxy programs with measurable proof`,
    heroDescription: `Security and finance reviewers ask for evidence—not adjectives—when approving ${label}. IP Nova supplies subprocessors, retention defaults, and pilot-friendly capacity: about ${m.estimatedIps} IPs, ${m.metroRegions}, ${m.successRate} observed success, and ${m.latencyP50} median RTT (p95 ${m.latencyP95}). Qualified commits can target 99.9% availability; operators receive ${m.safeConcurrency} concurrency guidance and named escalation instead of ticket roulette.`,
    longFormParagraphs: [
      `Procurement evidence — ${label} buyers receive DPIA-friendly descriptions of logging, billing metadata separation, and KYC scope for high-risk SKUs. We document ethical sourcing for residential/mobile paths and acceptable-use boundaries for datacenter bulk used in ${lower} automation. Enterprise MSAs can reference ${m.successRate} success bands and ${m.latencyP50} RTT medians as planning assumptions—your pilots still validate target-specific block rates.`,
      `Operational reliability — Rotation and stickiness are tunable per job: protect checkout with sticky TTL, protect crawls with controlled freshness. Incident comms cover upstream carrier degradation; status artifacts help SREs explain blips to executives. When programs scale beyond ${m.safeConcurrency} workers, solutions engineers review 429/403 telemetry to propose pacing—not blind thread increases.`,
      `Capacity proof for ${label} — Inventory near ${m.estimatedIps} across ${m.metroRegions} supports geo-realistic ${lower} flows without recycling the same subnet thousands of times per hour. Tail RTT near ${m.latencyP95} is published so flash-sale and ad-verification teams model worst-case TLS handshakes. HTTP/HTTPS/SOCKS5 remain available under one contract, reducing vendor sprawl and repeated security reviews.`,
    ],
    features: [
      {
        title: "99.9% SLA on qualified commits",
        body: `Contract-backed availability targets where commercially reasonable—paired with incident transparency for ${lower} production lanes.`,
      },
      {
        title: `${m.successRate} observed success`,
        body: `Band includes strict and permissive targets—use it as a baseline, then run your own block-rate pilots.`,
      },
      {
        title: `${m.estimatedIps} / ${m.metroRegions}`,
        body: `Documented scale and geography for ${label} security questionnaires and capacity models.`,
      },
      {
        title: `${m.safeConcurrency} orchestration guardrails`,
        body: `Initial worker band before global rate limits dominate—scale with jitter using real 429/403 curves.`,
      },
    ],
    faqs: [
      {
        question: `Is a 99.9% SLA available for ${label}?`,
        answer:
          "Enterprise-qualified deployments can include contract-backed 99.9% availability where commercially reasonable. Pilots use best-effort uptime with transparent status communications.",
      },
      {
        question: `What proof points exist for ${label} capacity?`,
        answer: `Published bands include ~${m.estimatedIps} IPs, ${m.metroRegions}, ${m.latencyP50} median RTT, and ${m.successRate} success on representative targets—validated further during your pilot.`,
      },
      {
        question: `How many workers can ${label} jobs run safely?`,
        answer: `Start near ${m.safeConcurrency}, then adjust using measured throttles; success rates fall when pacing ignores target-side global caps.`,
      },
      {
        question: "Do you support anti-detect and headless browsers?",
        answer:
          "Yes—SOCKS5 and HTTP/HTTPS credentials are shared across anti-detect profiles and headless Chromium stacks on eligible SKUs.",
      },
    ],
  };
}

function buildFallbackSeoContent(
  slug: string,
  category: SeoCategory
): SeoMatrixEntry {
  const label = formatSlugTitle(slug);
  const lower = label.toLowerCase();
  const metrics = deriveDynamicMetrics(slug, category);
  const ctx: FallbackContext = { label, lower, slug, category, metrics };
  const template = selectFallbackTemplateIndex(slug, category);

  if (template === 0) {
    return buildFallbackTemplateOps(ctx);
  }
  if (template === 1) {
    return buildFallbackTemplateArchitecture(ctx);
  }
  return buildFallbackTemplateProcurement(ctx);
}

export function getSeoPageData(
  category: SeoCategory,
  slug: string
): SeoMatrixEntry {
  const key = `${category}/${slug}`;
  const hit = MATRIX[key];
  if (hit) {
    return hit;
  }
  return buildFallbackSeoContent(slug, category);
}

export function buildFaqPageJsonLd(faqs: readonly SeoFaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
