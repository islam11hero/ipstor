"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { SparklesCore } from "@/components/motion/sparkles-core";
import { cn } from "@/lib/utils";

const ProxyNetworkGlobe = dynamic(
  () =>
    import("@/components/motion/three/proxy-network-globe").then(
      (mod) => mod.ProxyNetworkGlobe
    ),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 animate-pulse rounded-full bg-emerald-500/5" aria-hidden />
    ),
  }
);

const shell =
  "rounded-2xl border border-white/[0.08] bg-zinc-950/80 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_24px_80px_-24px_rgba(0,0,0,0.8)] backdrop-blur-2xl";

const nodes = [
  { x: "8%", y: "12%", delay: 0 },
  { x: "88%", y: "18%", delay: 0.2 },
  { x: "12%", y: "78%", delay: 0.4 },
  { x: "90%", y: "72%", delay: 0.15 },
  { x: "50%", y: "6%", delay: 0.3 },
] as const;

export function HeroNetworkVisual() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative mx-auto min-h-[420px] w-full max-w-xl lg:max-w-none">
      <SparklesCore particleCount={56} className="opacity-70" />

      <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[280px] w-[280px] sm:h-[320px] sm:w-[320px]">
        {mounted ? (
          <ProxyNetworkGlobe className="h-full w-full opacity-90" />
        ) : null}
      </div>

      <svg
        className="pointer-events-none absolute inset-0 h-full w-full text-emerald-500/15"
        aria-hidden
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="heroLine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(16 185 129)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="rgb(34 211 238)" stopOpacity="0.12" />
          </linearGradient>
        </defs>
        <path
          d="M 40 48 Q 120 120 200 80 T 360 100 T 520 60"
          fill="none"
          stroke="url(#heroLine)"
          strokeWidth="1"
          className="opacity-80"
        />
      </svg>

      {nodes.map((n, i) => (
        <span
          key={i}
          className="pointer-events-none absolute size-2 -translate-x-1/2 -translate-y-1/2"
          style={{ left: n.x, top: n.y }}
        >
          <span
            className="absolute inset-0 animate-ping rounded-full bg-emerald-400/30 motion-reduce:animate-none"
            style={{ animationDelay: `${n.delay}s` }}
          />
          <span className="absolute inset-0 rounded-full bg-emerald-400/80 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
        </span>
      ))}

      <motion.div
        className={cn(shell, "relative z-10 mx-auto mt-48 w-full max-w-md overflow-hidden p-0 lg:mt-52")}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-2 border-b border-white/[0.06] bg-white/[0.03] px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-red-500/80" />
          <span className="size-2.5 rounded-full bg-amber-400/80" />
          <span className="size-2.5 rounded-full bg-emerald-500/80" />
          <span className="ml-2 font-mono text-[10px] tracking-wide text-zinc-500">
            IP Nova — routing
          </span>
        </div>
        <div className="min-h-[200px] p-4 font-mono text-[13px] leading-relaxed sm:min-h-[220px] sm:p-5 sm:text-sm">
          <TerminalLines active={mounted} />
        </div>
      </motion.div>
    </div>
  );
}

function TerminalLines({ active }: { active: boolean }) {
  return (
    <motion.div
      className="space-y-2 text-zinc-400"
      initial="hidden"
      animate={active ? "visible" : "hidden"}
      variants={{
        visible: {
          transition: { staggerChildren: 0.35, delayChildren: 0.15 },
        },
        hidden: {},
      }}
    >
      <motion.p
        className="text-emerald-400/95"
        variants={{
          hidden: { opacity: 0, y: 4 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.4 }}
      >
        <span className="text-zinc-600">&gt;</span> Connecting to global network…
      </motion.p>
      <motion.p
        className="text-cyan-200/90"
        variants={{
          hidden: { opacity: 0, y: 4 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.4 }}
      >
        <span className="text-zinc-600">&gt;</span> Routing via{" "}
        <span className="text-zinc-200">198.51.100.24</span> (Tokyo)…
      </motion.p>
      <motion.p
        className="flex flex-wrap items-center gap-2 text-zinc-300"
        variants={{
          hidden: { opacity: 0, y: 4 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.4 }}
      >
        <span className="text-zinc-600">&gt;</span>
        <span>Status:</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-300">
          <span
            className="size-1.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
            aria-hidden
          />
          Connection secure
        </span>
      </motion.p>
      <motion.p
        className="text-zinc-600"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        }}
        transition={{ duration: 0.35 }}
      >
        <span className="inline-block h-4 w-2 animate-pulse bg-emerald-500/50 align-middle motion-reduce:animate-none" />
      </motion.p>
    </motion.div>
  );
}
