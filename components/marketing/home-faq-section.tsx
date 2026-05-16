import { FaqDetailsSection } from "@/components/seo/faq-details-section";

export const HOME_PAGE_FAQS = [
  {
    question: "What protocols does IP Nova support for enterprise automation?",
    answer:
      "IP Nova supports HTTP, HTTPS, and SOCKS5 forward proxy transports with a unified credential model. HTTP/HTTPS paths integrate with common scraping libraries and headless Chromium; SOCKS5 supports TLS tunneling patterns used by anti-detect browsers and certain native SDKs. Protocol choice should follow your client stack—not marketing defaults.",
  },
  {
    question: "When should I buy residential proxies versus datacenter proxies?",
    answer:
      "Use residential proxies when targets enforce ISP-grade ASN checks, behavioral scoring, or strict anti-bot stacks—common in SERP, travel, and large retail. Use datacenter proxies for high-QPS workloads against permissive APIs, partner endpoints, and internal tooling where hosting ASNs are acceptable. IP Nova lets you blend classes from one dashboard as your failure modes evolve.",
  },
  {
    question: "How do concurrent connections interact with blocks and CAPTCHAs?",
    answer:
      "Raising concurrency without measuring 403/429 ratios often increases challenges rather than throughput. Global rate limits cap aggregate QPS regardless of how many IPs you hold. IP Nova documents safe starting points and recommends jittered schedules, intelligent IP rotation, and sticky sessions where session continuity matters more than freshness.",
  },
  {
    question: "Do anti-detect browsers work with IP Nova proxies?",
    answer:
      "Yes. Anti-detect stacks typically consume HTTP or SOCKS5 upstream proxies. Align TLS profiles, timezone, language, and WebGL entropy with your egress geography; proxies solve the IP layer, not every fingerprint dimension. SOCKS5 remains the default recommendation when your browser profile tunnels TLS through the proxy.",
  },
  {
    question: "What does ethical IP sourcing mean in practice?",
    answer:
      "Ethical sourcing means transparent consent chains for residential and mobile pools, acceptable-use enforcement, refusal of illegal traffic classes, and subprocessors documented for enterprise procurement. IP Nova aligns high-risk SKUs with KYC expectations where carriers and partners require them—so security reviews map to reality, not slogans.",
  },
  {
    question: "Is there a 99.9% SLA for production programs?",
    answer:
      "Qualified enterprise commits can include contract-backed 99.9% availability where commercially reasonable. Pilot tiers include best-effort uptime with transparent incident response; upgrades exist when finance requires formal SLAs tied to credits and escalation paths.",
  },
  {
    question: "How does IP Nova support web scraping at B2B scale?",
    answer:
      "We combine ASN-aware pool classes with operator-visible rotation controls, protocol fidelity (HTTP/2 client realities, SNI correctness), and integration engineers who help you model concurrency against observed rate limits. Educational tooling and long-form documentation reduce surprises during bake-offs versus vendors who only ship a dashboard demo.",
  },
  {
    question: "Where do HTTP/HTTPS/SOCKS5 credentials live in my architecture?",
    answer:
      "Credentials should be injected from your secrets manager into workers—not hardcoded in repositories. IP Nova supports scoped API keys and rotation patterns suitable for CI/CD. Treat proxies as production infrastructure: alert on tunnel failures, TLS handshake spikes, and abnormal 403 histograms the same way you monitor application pods.",
  },
] as const;

export function HomeFaqSection() {
  return (
    <FaqDetailsSection
      title="Frequently asked questions"
      subtitle="Technical answers for teams evaluating HTTP/HTTPS/SOCKS5 automation, anti-detect browsers, concurrent connections, and enterprise SLAs on IP Nova."
      faqs={HOME_PAGE_FAQS}
    />
  );
}
