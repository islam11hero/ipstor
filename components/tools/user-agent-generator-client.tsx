"use client";

import { useCallback, useMemo, useState } from "react";
import { Check, Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Os = "windows" | "mac" | "linux";
type Browser = "chrome" | "firefox" | "safari" | "edge";

type UaEntry = { ua: string; os: Os; browser: Browser };

const USER_AGENTS: UaEntry[] = [
  {
    os: "windows",
    browser: "chrome",
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  },
  {
    os: "windows",
    browser: "edge",
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
  },
  {
    os: "windows",
    browser: "firefox",
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0",
  },
  {
    os: "mac",
    browser: "chrome",
    ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  },
  {
    os: "mac",
    browser: "safari",
    ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 15_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15",
  },
  {
    os: "mac",
    browser: "firefox",
    ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 15.1; rv:133.0) Gecko/20100101 Firefox/133.0",
  },
  {
    os: "linux",
    browser: "chrome",
    ua: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  },
  {
    os: "linux",
    browser: "firefox",
    ua: "Mozilla/5.0 (X11; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0",
  },
  {
    os: "linux",
    browser: "edge",
    ua: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
  },
  {
    os: "windows",
    browser: "chrome",
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.117 Safari/537.36",
  },
  {
    os: "mac",
    browser: "chrome",
    ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.117 Safari/537.36",
  },
  {
    os: "linux",
    browser: "firefox",
    ua: "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:132.0) Gecko/20100101 Firefox/132.0",
  },
];

function shufflePick<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

const glassPanel =
  "rounded-2xl border border-white/[0.05] bg-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl";

export function UserAgentGeneratorClient() {
  const [os, setOs] = useState<Os>("windows");
  const [browser, setBrowser] = useState<Browser>("chrome");
  const [samples, setSamples] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const pool = useMemo(() => {
    const strict = USER_AGENTS.filter((e) => e.os === os && e.browser === browser);
    if (strict.length >= 5) return strict.map((e) => e.ua);
    const loose = USER_AGENTS.filter((e) => e.os === os);
    if (loose.length >= 5) return loose.map((e) => e.ua);
    return USER_AGENTS.map((e) => e.ua);
  }, [os, browser]);

  const generate = useCallback(() => {
    setSamples(shufflePick(pool, 5));
    setCopiedIdx(null);
  }, [pool]);

  const copyOne = useCallback(async (ua: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(ua);
      setCopiedIdx(idx);
      toast.success("User-agent copied to clipboard");
      window.setTimeout(() => setCopiedIdx((c) => (c === idx ? null : c)), 2000);
    } catch {
      toast.error("Could not copy");
    }
  }, []);

  return (
    <main className="relative mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(139,92,246,0.1),transparent)]"
        aria-hidden
      />
      <div className="flex items-center gap-2 text-xs font-medium tracking-[0.2em] text-violet-400/90 uppercase">
        <Sparkles className="size-3.5" aria-hidden />
        Utility
      </div>
      <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
        User-Agent generator
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-zinc-500 sm:text-[15px]">
        Generate realistic modern browser profiles for automation, QA, and
        traffic shaping experiments.
      </p>

      <div className={cn(glassPanel, "mt-10 p-5 sm:p-6")}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="ua-os"
              className="text-xs font-semibold tracking-wider text-zinc-500 uppercase"
            >
              Operating system
            </label>
            <select
              id="ua-os"
              value={os}
              onChange={(e) => setOs(e.target.value as Os)}
              className="mt-2 w-full rounded-xl border border-white/[0.08] bg-black/40 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="windows">Windows</option>
              <option value="mac">Mac</option>
              <option value="linux">Linux</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="ua-browser"
              className="text-xs font-semibold tracking-wider text-zinc-500 uppercase"
            >
              Browser
            </label>
            <select
              id="ua-browser"
              value={browser}
              onChange={(e) => setBrowser(e.target.value as Browser)}
              className="mt-2 w-full rounded-xl border border-white/[0.08] bg-black/40 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="chrome">Chrome</option>
              <option value="firefox">Firefox</option>
              <option value="safari">Safari</option>
              <option value="edge">Edge</option>
            </select>
          </div>
        </div>
        <Button
          type="button"
          className="mt-6 w-full bg-gradient-to-r from-violet-500 to-cyan-500 font-semibold text-white hover:from-violet-400 hover:to-cyan-400 sm:w-auto"
          onClick={generate}
        >
          Generate profiles
        </Button>
      </div>

      {samples.length > 0 && (
        <div className="mt-10 space-y-4">
          <h2 className="text-sm font-semibold tracking-wide text-zinc-400 uppercase">
            Sample profiles
          </h2>
          {samples.map((ua, idx) => (
            <div
              key={`${idx}-${ua.slice(0, 32)}`}
              className={cn(
                glassPanel,
                "flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5"
              )}
            >
              <p className="min-w-0 flex-1 break-all font-mono text-[11px] leading-relaxed text-zinc-300 sm:text-xs">
                {ua}
              </p>
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                className="shrink-0 border-white/10 bg-white/[0.03] hover:bg-white/[0.08]"
                onClick={() => void copyOne(ua, idx)}
                aria-label="Copy user-agent"
              >
                {copiedIdx === idx ? (
                  <Check className="size-4 text-emerald-400" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
