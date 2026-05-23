export type SeoFaqItem = {
  question: string;
  answer: string;
};

export type SeoFeatureItem = {
  title: string;
  body: string;
};

export type SeoRelatedLink = {
  href: string;
  label: string;
  anchor: string;
};

export type SeoMatrixEntry = {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  h1: string;
  heroDescription: string;
  longFormParagraphs: readonly string[];
  features: readonly SeoFeatureItem[];
  faqs: readonly SeoFaqItem[];
  layoutVariant?: 0 | 1 | 2;
  relatedLinks?: readonly SeoRelatedLink[];
};

export type DynamicMetrics = {
  estimatedIps: string;
  latencyP50: string;
  latencyP95: string;
  successRate: string;
  safeConcurrency: string;
  metroRegions: string;
};

export type SeoIntent = "commercial" | "compliance" | "educational";

export type EntityBundle = {
  infrastructure: string;
  operational: string;
  regulatory?: string;
};

export type FallbackContext = {
  label: string;
  lower: string;
  slug: string;
  category: import("@/lib/seo-slug").SeoCategory;
  metrics: DynamicMetrics;
  entities: EntityBundle;
  intent: SeoIntent;
  seed: string;
};
