"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { SearchParamsSuspenseFallback } from "@/components/search-params-suspense-fallback";

export const IPNOVA_REF_STORAGE_KEY = "ipnova_ref";

function ReferralTrackerInner() {
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const trimmed = ref?.trim();
    if (!trimmed) return;
    try {
      localStorage.setItem(IPNOVA_REF_STORAGE_KEY, trimmed);
    } catch {
      /* quota / private mode */
    }
  }, [mounted, ref]);

  return null;
}

/**
 * Persists `?ref=` from the URL into localStorage for later signup attribution.
 * Wrapped in Suspense for static generation / build stability.
 */
export function ReferralTracker() {
  return (
    <Suspense fallback={<SearchParamsSuspenseFallback />}>
      <ReferralTrackerInner />
    </Suspense>
  );
}
