"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BracketsCurly,
  Cpu,
  CursorClick,
  Package,
  TerminalWindow,
  TestTube,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { toast } from "sonner";

import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const glass =
  "rounded-2xl border border-white/[0.05] bg-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl";

const CURL_SNIPPET = `curl -sS https://api.ipnova.online/v1/proxies \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Accept: application/json"`;

const pills: { label: string; icon: Icon }[] = [
  { label: "Python", icon: BracketsCurly },
  { label: "Node.js", icon: Package },
  { label: "Puppeteer", icon: CursorClick },
  { label: "Selenium", icon: TestTube },
  { label: "cURL", icon: TerminalWindow },
  { label: "Go", icon: Cpu },
];

export function IntegrationsApiBlock() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(CURL_SNIPPET);
      toast.success("Snippet copied to clipboard");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy. Please copy manually.");
    }
  }

  return (
    <section
      id="integrations"
      className="mx-auto max-w-7xl px-6 py-20 lg:py-28"
    >
      <ScrollReveal>
      <div className="max-w-2xl">
        <p className="font-heading text-[11px] font-medium tracking-[0.28em] text-cyan-500/90 uppercase">
          Developer experience
        </p>
        <h2 className="mt-4 font-heading text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
          Built to integrate. Ready to automate.
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-zinc-500">
          Ship faster with first-class patterns across languages, browsers, and
          orchestration stacks—then wire everything through one consistent API.
        </p>
      </div>
      </ScrollReveal>

      <ScrollReveal className="mt-14 grid gap-8 lg:grid-cols-2 lg:gap-10" stagger={0.1}>
        <div className={cn(glass, "p-6 sm:p-8")}>
          <h3 className="font-heading text-lg font-semibold text-white">
            Integrations
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            Drop-in examples for the stacks teams already run in production.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {pills.map(({ label, icon: PillIcon }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-black/40 px-3 py-2.5 transition-colors hover:border-emerald-500/25 hover:bg-emerald-500/[0.04]"
              >
                <PillIcon className="size-5 shrink-0 text-emerald-400/90" weight="duotone" aria-hidden />
                <span className="text-xs font-medium text-zinc-200">{label}</span>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-8 border-white/10 text-zinc-300 hover:bg-white/[0.04]"
            render={<Link href="/resources/documentation" />}
          >
            View integration guides
          </Button>
        </div>

        <div
          className={cn(
            glass,
            "overflow-hidden border-zinc-800/80 bg-[#0a0a0b] p-0 shadow-[0_0_60px_-20px_rgba(34,211,238,0.12)]"
          )}
        >
          <div className="flex items-center justify-between border-b border-white/[0.06] bg-zinc-900/80 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-red-500/90" />
              <span className="size-2 rounded-full bg-amber-400/90" />
              <span className="size-2 rounded-full bg-emerald-500/90" />
              <span className="ml-2 font-mono text-[11px] text-zinc-500">
                fetch-proxies.sh
              </span>
            </div>
            <Button
              type="button"
              size="xs"
              variant="outline"
              className="border-white/10 bg-white/[0.04] text-[11px] text-zinc-200 hover:bg-white/[0.08]"
              onClick={() => void handleCopy()}
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
          <pre className="max-h-[320px] overflow-x-auto whitespace-pre-wrap break-words p-4 font-mono text-[11px] leading-relaxed sm:text-xs sm:leading-relaxed">
            <code>
              <span className="text-emerald-400">curl</span>{" "}
              <span className="text-zinc-500">-sS</span>{" "}
              <span className="text-sky-300">https://api.ipnova.online/v1/proxies</span>{" "}
              <span className="text-zinc-600">\</span>
              {"\n"}
              <span className="text-zinc-500">  -H</span>{" "}
              <span className="text-amber-200/90">
                &quot;Authorization: Bearer YOUR_API_KEY&quot;
              </span>{" "}
              <span className="text-zinc-600">\</span>
              {"\n"}
              <span className="text-zinc-500">  -H</span>{" "}
              <span className="text-amber-200/90">&quot;Accept: application/json&quot;</span>
            </code>
          </pre>
        </div>
      </ScrollReveal>
    </section>
  );
}
