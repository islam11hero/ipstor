import { formatSlugTitle, type SeoCategory } from "@/lib/seo-slug";

import { pickFromPool } from "./hash-slug";
import type { EntityBundle } from "./types";

const LOCATION_GROUND_TRUTH: Record<string, EntityBundle> = {
  germany: {
    infrastructure: "DE-CIX Frankfurt handoffs and AMS-IX adjacency for EU fan-out",
    operational: "Deutsche Telekom, Vodafone, and O2 ASN mixes on residential paths",
    regulatory: "GDPR/TDDDG-aligned DPA language for German procurement reviews",
  },
  "united-kingdom": {
    infrastructure: "LINX London peering and Manchester IX failover paths",
    operational: "BT, Virgin Media, and Sky broadband ASN fingerprints",
    regulatory: "UK GDPR + ICO accountability framing for DPIA packets",
  },
  "united-states": {
    infrastructure: "Equinix Ashburn and CoreSite LA cross-connect semantics",
    operational: "Comcast, AT&T, and regional fiber ASN diversity",
    regulatory: "CCPA/CPRA subprocessors map for US persons metadata",
  },
  japan: {
    infrastructure: "JPNAP Tokyo exchange adjacency and Osaka secondary paths",
    operational: "NTT and KDDI mobile/residential graph signals",
    regulatory: "APPI cross-border transfer notes for Japanese reviewers",
  },
  "global-network": {
    infrastructure: "Multi-IX anycast steering across six continents",
    operational: "Carrier-aware hot pools with metro-level failover tables",
    regulatory: "Enterprise DPA templates with region-specific annexes",
  },
};

const COMMERCIAL_INFRA_POOL: readonly EntityBundle[] = [
  {
    infrastructure: "Metro-peered TLS termination with SNI-preserving forward proxies",
    operational: "HTTP/2-aware keep-alive pools for long SERP harvest jobs",
  },
  {
    infrastructure: "Anycast egress steering with congestion-aware subnet backoff",
    operational: "SOCKS5 tunnels compatible with anti-detect browser profiles",
  },
  {
    infrastructure: "Backbone-attached datacenter meshes with NVMe resolver stacks",
    operational: "Sticky TTL sessions for checkout-grade identity continuity",
  },
  {
    infrastructure: "ISP partner handoffs with documented ASN metadata exports",
    operational: "Error-driven rotation when HTTP 403 density crosses SLO bands",
  },
];

const COMPLIANCE_ENTITY_POOL: readonly EntityBundle[] = [
  {
    infrastructure: "Billing metadata separated from payload logging on qualified deals",
    operational: "Scoped API keys with quarterly rotation guidance for CI/CD",
    regulatory: "Subprocessor registry with 30-day change notifications",
  },
  {
    infrastructure: "Immutable audit logs for deposit approval and order fulfillment",
    operational: "KYC checkpoints for mobile and high-risk residential SKUs",
    regulatory: "Data minimization defaults on connection metadata fields",
  },
  {
    infrastructure: "Regional data residency options documented per SKU class",
    operational: "Named escalation for MSA redlines and security questionnaires",
    regulatory: "Lawful-order response playbooks without silent data expansion",
  },
];

const EDUCATIONAL_ENTITY_POOL: readonly EntityBundle[] = [
  {
    infrastructure: "Staging sandboxes that mirror production auth header shapes",
    operational: "Copy-ready curl and Python snippets with secret injection patterns",
  },
  {
    infrastructure: "Runbook-friendly export formats for proxy line validation",
    operational: "429/403 histogram templates before production worker ramps",
  },
  {
    infrastructure: "Versioned integration guides tied to dashboard view slugs",
    operational: "Least-privilege service accounts for webhook verification labs",
  },
];

export function resolveSlugEntities(
  category: SeoCategory,
  slug: string,
  seed: string
): EntityBundle {
  if (category === "locations" && LOCATION_GROUND_TRUTH[slug]) {
    return LOCATION_GROUND_TRUTH[slug]!;
  }

  if (category === "legal" || category === "company") {
    return pickFromPool(COMPLIANCE_ENTITY_POOL, seed, 11);
  }

  if (category === "resources") {
    return pickFromPool(EDUCATIONAL_ENTITY_POOL, seed, 12);
  }

  const label = formatSlugTitle(slug);
  const localized = pickFromPool(COMMERCIAL_INFRA_POOL, seed, 13);
  return {
    ...localized,
    operational: `${localized.operational} tuned for ${label} egress classes`,
  };
}

export function categoryEyebrowSuffix(
  category: SeoCategory,
  seed: string
): string {
  const commercial = [
    "edge telemetry",
    "pool orchestration",
    "session graph",
    "routing fabric",
  ] as const;
  const compliance = [
    "governance packet",
    "assurance brief",
    "controls matrix",
    "audit trail",
  ] as const;
  const educational = [
    "builder notes",
    "integration lane",
    "operator runbook",
    "staging guide",
  ] as const;

  if (category === "legal" || category === "company") {
    return pickFromPool(compliance, seed, 20);
  }
  if (category === "resources") {
    return pickFromPool(educational, seed, 21);
  }
  return pickFromPool(commercial, seed, 22);
}
