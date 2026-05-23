import type { SeoCategory } from "@/lib/seo-slug";

import { hashSlot } from "./hash-slug";
import type { DynamicMetrics } from "./types";

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
};

function pickInRangeLocal(lo: number, hi: number, seed: string, slot: number): number {
  const span = Math.max(1, hi - lo);
  const t = hashSlot(seed, slot) % 1000;
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

function formatPercentRange(lo: number, hi: number): string {
  return `${lo.toFixed(1)}–${hi.toFixed(1)}%`;
}

function formatConcurrencyRange(lo: number, hi: number): string {
  const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n));
  return `${fmt(lo)}–${fmt(hi)} workers`;
}

export function deriveDynamicMetrics(
  slug: string,
  category: SeoCategory
): DynamicMetrics {
  const key = `${category}/${slug}`;
  const override = METRICS_OVERRIDES[key];
  const profile = CATEGORY_METRIC_PROFILE[category];
  const seed = `${category}:${slug}`;

  const ipLo = pickInRangeLocal(profile.ipLo, profile.ipHi, seed, 1);
  const ipHi = Math.max(ipLo + pickInRangeLocal(50_000, 400_000, seed, 2), ipLo + 1);
  const p50Lo = pickInRangeLocal(profile.latP50Lo, profile.latP50Hi, seed, 3);
  const p50Hi = Math.max(p50Lo + pickInRangeLocal(6, 28, seed, 4), p50Lo + 1);
  const p95Lo = Math.round(p50Lo * 1.35);
  const p95Hi = Math.round(p50Hi * 1.55);
  const successLo =
    pickInRangeLocal(
      Math.floor(profile.successLo * 10),
      Math.floor(profile.successHi * 10),
      seed,
      5
    ) / 10;
  const successHi = Math.min(
    profile.successHi,
    Math.max(successLo + 1.2, successLo + pickInRangeLocal(12, 45, seed, 6) / 10)
  );
  const concLo = pickInRangeLocal(profile.concLo, profile.concHi, seed, 7);
  const concHi = Math.max(concLo + pickInRangeLocal(80, 900, seed, 8), concLo + 1);
  const regionCount = pickInRangeLocal(profile.regionsLo, profile.regionsHi, seed, 9);

  const base: DynamicMetrics = {
    estimatedIps: formatIpRange(ipLo, ipHi),
    latencyP50: `${p50Lo}–${p50Hi} ms`,
    latencyP95: `${p95Lo}–${p95Hi} ms`,
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
