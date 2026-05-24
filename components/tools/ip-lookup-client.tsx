"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GlobeHemisphereWest, Warning } from "@phosphor-icons/react";

import { IconSpinner } from "@/components/icons";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type IpApiPayload = {
  ip?: string;
  error?: boolean;
  reason?: string;
  city?: string | null;
  region?: string | null;
  country_name?: string | null;
  org?: string | null;
  asn?: string | number | null;
  timezone?: string | null;
};

const glass =
  "rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl sm:p-6";

export function IpLookupClient() {
  const [data, setData] = useState<IpApiPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/tools/ip", { cache: "no-store" });
        const json = (await res.json()) as IpApiPayload;
        if (cancelled) return;
        if (!res.ok || json.error) {
          setErr(json.reason ?? "Could not load IP data.");
          setData(null);
        } else {
          setData(json);
        }
      } catch {
        if (!cancelled) setErr("Network error. Try again in a moment.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div role="main" className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(ellipse_65%_50%_at_50%_0%,rgba(16,185,129,0.1),transparent)]"
        aria-hidden
      />
      <div className="flex items-center gap-2 text-xs font-medium tracking-[0.2em] text-emerald-500/90 uppercase">
        <GlobeHemisphereWest className="size-4.5" weight="duotone" aria-hidden />
        Utility
      </div>
      <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
        IP lookup
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-500 sm:text-[15px]">
        Your browser reveals a public IP to every site you visit. See what the
        internet reads about you right now.
      </p>

      {loading && (
        <div className="mt-12 flex items-center gap-3 text-zinc-400">
          <IconSpinner className="size-5 text-emerald-400" />
          Resolving your connection…
        </div>
      )}

      {!loading && err && (
        <p className="mt-10 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {err}
        </p>
      )}

      {!loading && data?.ip && (
        <>
          <div className="mt-10 rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 sm:px-5">
            <div className="flex flex-wrap items-start gap-3">
              <span className="relative mt-0.5 flex size-3 shrink-0">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400/50" />
                <span className="relative inline-flex size-3 rounded-full bg-amber-400 ring-2 ring-amber-400/40" />
              </span>
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-amber-100">
                  <Warning className="size-5 shrink-0 text-amber-400" weight="duotone" aria-hidden />
                  Your real IP is exposed
                </p>
                <p className="mt-1 text-xs leading-relaxed text-amber-200/80 sm:text-sm">
                  This page loaded your public IP in plaintext. Sites, scripts, and
                  intermediaries can fingerprint it unless you route through a
                  trusted proxy fabric.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-10 text-center text-[10px] font-medium tracking-[0.35em] text-zinc-500 uppercase sm:text-left">
            Public IPv4 / IPv6
          </p>
          <p className="mt-2 break-all text-center font-mono text-3xl font-bold tracking-tight text-emerald-400 [text-shadow:0_0_40px_rgba(52,211,153,0.35)] sm:text-left sm:text-4xl md:text-5xl lg:text-6xl">
            {data.ip}
          </p>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoCard label="Country" value={data.country_name ?? "—"} />
            <InfoCard label="City" value={data.city ?? "—"} />
            <InfoCard label="ISP" value={data.org ?? "—"} />
            <InfoCard label="ASN" value={formatAsn(data.asn)} />
            <InfoCard
              label="Region"
              value={data.region ?? "—"}
              className="sm:col-span-2 lg:col-span-1"
            />
            <InfoCard label="Timezone" value={data.timezone ?? "—"} />
          </div>

          <div className="mt-14 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.08] via-white/[0.02] to-cyan-500/[0.06] p-6 text-center sm:p-10">
            <p className="font-heading text-xl font-semibold text-white sm:text-2xl">
              Hide your real IP with IP Nova&apos;s premium proxies
            </p>
            <p className="mx-auto mt-3 max-w-lg text-sm text-zinc-400">
              Route traffic through residential, ISP, datacenter, or mobile pools
              with one contract and one operator-grade dashboard.
            </p>
            <Button
              size="lg"
              className="mt-8 bg-gradient-to-r from-emerald-400 to-cyan-400 px-8 font-semibold text-black shadow-lg shadow-emerald-500/20 hover:from-emerald-300 hover:to-cyan-300"
              render={<Link href="/dashboard" />}
            >
              Open dashboard
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function formatAsn(asn: string | number | null | undefined): string {
  if (asn == null) return "—";
  if (typeof asn === "object") return "—";
  return String(asn);
}

function InfoCard({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn(glass, className)}>
      <p className="text-[10px] font-semibold tracking-[0.2em] text-zinc-500 uppercase">
        {label}
      </p>
      <p className="mt-2 text-lg font-medium leading-snug text-zinc-100 sm:text-xl">
        {value}
      </p>
    </div>
  );
}
