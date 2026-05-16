"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

import { SearchParamsSuspenseFallback } from "@/components/search-params-suspense-fallback";

const ERROR_MESSAGES: Record<string, string> = {
  admin_access_denied:
    "Access denied. You do not have permission to view the admin panel.",
};

function FlashToastInner() {
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;

    const error = searchParams.get("error");
    if (!error) return;

    const message =
      ERROR_MESSAGES[error] ?? "Something went wrong. Please try again.";
    toast.error(message);

    const url = new URL(window.location.href);
    url.searchParams.delete("error");
    router.replace(url.pathname + url.search, { scroll: false });
  }, [mounted, searchParams, router]);

  return null;
}

export function FlashToast() {
  return (
    <Suspense fallback={<SearchParamsSuspenseFallback />}>
      <FlashToastInner />
    </Suspense>
  );
}
