import Link from "next/link";
import { BrandLogo } from "@/components/icons";

import { staticPageMetadata } from "@/lib/page-metadata";

export const metadata = staticPageMetadata({
  path: "/about",
  title: "About",
  description:
    "IP Nova builds enterprise proxy infrastructure with ethical IP sourcing, KYC-aligned programs, HTTP/HTTPS/SOCKS5 protocol parity, and global routing for B2B automation teams.",
});

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
        aria-hidden
      />
      <header className="border-b border-white/[0.06] bg-[#050505]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5 text-sm text-zinc-400 hover:text-white">
            <BrandLogo size={36} trigger="hover" />
            <span className="font-heading font-semibold text-white">IP Nova</span>
          </Link>
          <Link href="/login" className="text-sm text-zinc-500 hover:text-white">
            Sign in
          </Link>
        </div>
      </header>
      <article className="prose-legal px-6 py-16 lg:py-24">
        <h1>About IP Nova</h1>
        <p className="text-sm text-zinc-500">
          Last updated for enterprise readers: transparency, sourcing posture, and how
          we support HTTP/HTTPS/SOCKS5 automation at scale.
        </p>
        <p>
          IP Nova is an infrastructure company focused on forward proxy networks for
          B2B teams—data science, growth engineering, security research, fraud
          operations, and platform integrity groups—who cannot afford ambiguous
          marketing or opaque acceptable-use policies. We provide residential, ISP,
          datacenter, and mobile carrier egress with protocol parity across HTTP,
          HTTPS, and SOCKS5 so polyglot organizations can standardize credentials
          across scrapers, anti-detect browsers, CI jobs, and internal tools without
          maintaining parallel vendor relationships for each transport.
        </p>
        <p>
          Our product thesis is simple: proxies are routing and identity infrastructure,
          not a commodity listicle of country flags. That means we invest in ASN
          metadata, realistic concurrency guidance, intelligent IP rotation controls,
          and subnet hygiene programs that protect shared reputation. It also means we
          publish integration guidance that acknowledges HTTP/2 client defaults, TLS
          fingerprint realities, and the nonlinear relationship between concurrent
          connections and global rate limits. When customers evaluate IP Nova against
          alternatives, we want the decision to be made on engineering evidence—latency
          envelopes, incident timelines, and subprocessors—not on inflated IP counts
          that disintegrate under production load.
        </p>
        <h2>Ethical IP sourcing and partner accountability</h2>
        <p>
          Residential and mobile IP pools carry higher trust signals because they map
          to consumer eyeballs—but that trust must be earned through consent, contract,
          and ongoing monitoring, not through undisclosed SDK bundling. IP Nova contracts
          require informed participation from supply partners, prohibit deceptive
          collection, and include technical controls to detect anomalous traffic that
          could harm subnet reputation for all customers. We refuse traffic classes that
          create unacceptable legal or carrier risk, and we maintain documentation that
          maps sourcing chains for enterprise security reviews.
        </p>
        <p>
          Datacenter inventory is sourced from reputable hosting and backbone providers
          with clear ASN ownership. We isolate abusive tenants, throttle noisy workloads,
          and offer dedicated ranges for enterprises that require stronger blast-radius
          guarantees than shared subnets can provide. Across all classes, we align
          customer expectations with physics: mobile radio networks cannot deliver
          datacenter microseconds; residential pools cannot sustain naive infinite QPS
          without reputation decay. Honest guidance is part of ethical operations
          because misconfigured automation harms everyone on a shared pool.
        </p>
        <h2>KYC compliance and high-risk commercial programs</h2>
        <p>
          Certain SKUs—especially carrier-backed mobile programs and high-throughput
          residential commitments—require commercially reasonable Know Your Customer
          (KYC) checks to satisfy partner contracts and regulatory expectations. KYC at
          IP Nova is scoped: we collect what is necessary to validate business identity
          and intended use, retain it according to documented schedules, and restrict
          access on a least-privilege basis. We do not use KYC as a pretext for unrelated
          data harvesting; procurement and legal teams receive clear data maps instead
          of vague “trust us” statements.
        </p>
        <p>
          Enterprise customers may also require custom MSA terms, insurance artifacts,
          or dedicated support channels. IP Nova maintains a commercial desk that speaks
          the same vocabulary as finance (commit sizes, true-ups, SLAs) and engineering
          (rotation semantics, protocol endpoints, logging fields). Our goal is to shorten
          the distance between security questionnaire answers and the behavior of the
          live control plane—because E-E-A-T is demonstrated by operators who can explain
          failure modes before purchase, not after an incident.
        </p>
        <h2>Global infrastructure and observability</h2>
        <p>
          IP Nova operates a globally distributed edge with regional control planes,
          encrypted management channels, and status communications that treat partial
          degradation as a normal part of running networks at scale. We publish guidance
          for integrating retries, backoff, and circuit breaking at the application
          layer—because proxies sit on the critical path between your workers and revenue.
          Observability hooks include per-pool health indicators and incident postmortems
          that name contributing factors rather than hiding behind generic “network
          issues” banners.
        </p>
        <p>
          For teams combining automation with anti-detect browsers, we document SOCKS5
          and HTTP CONNECT caveats, header consistency recommendations, and concurrency
          patterns that reduce accidental correlation across workers. For large scraping
          programs, we help model the interaction of intelligent IP rotation with session
          stickiness so customers do not destroy their own success rates by toggling
          policies without measurement.
        </p>
        <h2>Security, retention, and customer trust</h2>
        <p>
          Security at IP Nova follows defense-in-depth: network segmentation, encrypted
          transit for management operations, strict access controls on production data
          stores, and routine review of subprocessors that touch customer metadata. We
          separate billing artifacts from technical logs where feasible, support scoped
          API keys for automation, and document retention windows so your DPO can align
          internal records policies with ours. Vulnerability reports are triaged by
          engineers with authority to patch—not routed into a black hole inbox.
        </p>
        <p>
          We believe long-form transparency improves outcomes: customers who understand
          how HTTP/HTTPS/SOCKS5 paths are terminated, how concurrent connections interact
          with pool health, and how ethical IP sourcing maps to subnet reputation behave
          like partners rather than adversaries. That alignment is how IP Nova sustains
          B2B programs with 99.9% SLAs where commercially reasonable—because SLAs are
          meaningless without operational maturity on both sides of the contract.
        </p>
        <h2>Contact</h2>
        <p>
          For general inquiries and partnership discussions, contact{" "}
          <a href="mailto:hello@ipnova.online">hello@ipnova.online</a>. For legal
          matters, contact <a href="mailto:legal@ipnova.online">legal@ipnova.online</a>.
        </p>
      </article>
    </div>
  );
}
