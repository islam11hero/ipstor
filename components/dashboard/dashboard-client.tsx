"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  BookMarked,
  BookOpen,
  Braces,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  EyeOff,
  Flame,
  Globe,
  Globe2,
  HardDrive,
  LayoutDashboard,
  Loader2,
  Lock,
  Menu,
  MessageCircle,
  Monitor,
  Music,
  Network,
  RefreshCw,
  Send,
  Server,
  Shield,
  ShoppingCart,
  Smartphone,
  TrendingUp,
  Wallet,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { placeOrder } from "@/app/dashboard/actions";
import { SearchParamsSuspenseFallback } from "@/components/search-params-suspense-fallback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip as UiTooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { isAdminEmail } from "@/lib/admin";
import {
  defaultTransition,
  fadeInUp,
  glowTitle,
  hoverLift,
  tapScale,
} from "@/lib/motion";
import {
  calculateOrderTotal,
  DATACENTER_PRICE_PER_IP,
  RESIDENTIAL_PRICE_PER_GB,
  type ProxyProduct,
} from "@/lib/pricing";
import { formatProxyLine, formatProxyList } from "@/lib/proxy-format";
import { SITE_URL } from "@/lib/site-url";
import type { DashboardData, UserProxy } from "@/lib/types/dashboard";
import { cn } from "@/lib/utils";

type DashboardClientProps = {
  initialData: DashboardData;
};

type DashboardView =
  | "overview"
  | "proxies"
  | "buy"
  | "funds"
  | "developer"
  | "affiliate";

const VIEW_PARAM = "view";

const VIEW_ALIASES: Record<string, DashboardView> = {
  overview: "overview",
  proxies: "proxies",
  "my-proxies": "proxies",
  "proxy-list": "proxies",
  datacenter: "proxies",
  residential: "proxies",
  buy: "buy",
  "buy-proxies": "buy",
  funds: "funds",
  billing: "funds",
  "top-up": "funds",
  "add-funds": "funds",
  developer: "developer",
  "developer-api": "developer",
  affiliate: "affiliate",
  affiliates: "affiliate",
  "affiliate-program": "affiliate",
};

/** Canonical `?view=` slug for each internal view (dense sidebar URLs). */
const VIEW_QUERY_SLUG: Record<DashboardView, string> = {
  overview: "overview",
  proxies: "my-proxies",
  buy: "buy-proxies",
  funds: "billing",
  developer: "developer-api",
  affiliate: "affiliate",
};

function parseDashboardViewParam(raw: string | null): DashboardView {
  if (!raw) return "overview";
  const key = raw.trim().toLowerCase();
  return VIEW_ALIASES[key] ?? "overview";
}

const SETUP_GUIDE_ITEMS: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}[] = [
  { icon: Globe2, label: "Google Chrome" },
  { icon: Flame, label: "Mozilla Firefox" },
  { icon: Send, label: "Telegram" },
  { icon: MessageCircle, label: "WhatsApp" },
  { icon: Music, label: "TikTok" },
  { icon: Smartphone, label: "Android" },
  { icon: Monitor, label: "Windows" },
  { icon: Shield, label: "GoLogin" },
];

const SKILL_INSTALL_CMD = "npx skills add ipnova/proxy-manager";
const SKILL_PROMPT_SNIPPET =
  "Using the IP Nova skill, pull the top 20 Google SERPs from the US, UK, Germany...";

const shellGlass =
  "rounded-2xl border border-white/[0.05] bg-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl";

const MOCK_API_KEY = "pn_live_sk_7x9K2mP4vQ8wZ1nL5bH3cF6jD0sA2eR8uY1";

const AFFILIATE_DEMO_ROWS = [
  { at: "2026-05-14T18:22:00.000Z", masked: "usr_***a3f", commission: 42.5 },
  { at: "2026-05-12T09:10:00.000Z", masked: "usr_***91c", commission: 18.0 },
  { at: "2026-05-09T14:45:00.000Z", masked: "usr_***7de", commission: 64.25 },
  { at: "2026-05-02T11:02:00.000Z", masked: "usr_***502", commission: 12.0 },
] as const;

const viewTransition = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
};

const bentoContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const bentoItem = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

async function clipboardWriteWithToast(
  text: string,
  label: string
): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
    return true;
  } catch {
    toast.error("Failed to copy. Please copy manually.");
    return false;
  }
}

function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function DashboardClientInner({ initialData }: DashboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [balance, setBalance] = useState(initialData.balance);

  useEffect(() => {
    setBalance(initialData.balance);
  }, [initialData.balance]);

  const view = useMemo(
    () => parseDashboardViewParam(searchParams.get(VIEW_PARAM)),
    [searchParams]
  );

  const referralShareUrl = useMemo(
    () =>
      `${SITE_URL.replace(/\/$/, "")}/?ref=${encodeURIComponent(initialData.referralCode)}`,
    [initialData.referralCode]
  );

  const navigateView = useCallback(
    (next: DashboardView) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(VIEW_PARAM, VIEW_QUERY_SLUG[next]);
      router.push(`/dashboard?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );
  const [proxyType, setProxyType] = useState<ProxyProduct>("datacenter");
  const [quantity, setQuantity] = useState("10");
  const [depositAmount, setDepositAmount] = useState("");
  const [cryptoPayLoading, setCryptoPayLoading] = useState(false);
  const [whitelistDraft, setWhitelistDraft] = useState(
    "203.0.113.0/24, 198.51.100.10"
  );
  const [apiKeyRevealed, setApiKeyRevealed] = useState(false);
  const [payYearly, setPayYearly] = useState(false);
  const [aiAgentTab, setAiAgentTab] = useState<
    "seo" | "ad" | "streaming" | "social"
  >("seo");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedButtonId, setCopiedButtonId] = useState<string | null>(null);
  const copyResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goView = useCallback(
    (next: DashboardView) => {
      navigateView(next);
      setSidebarOpen(false);
    },
    [navigateView]
  );

  const goBilling = useCallback(() => {
    router.push("/dashboard?view=billing", { scroll: false });
    setSidebarOpen(false);
  }, [router]);

  useEffect(() => {
    return () => {
      if (copyResetRef.current) clearTimeout(copyResetRef.current);
    };
  }, []);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen]);

  const bumpCopiedId = useCallback((id: string) => {
    if (copyResetRef.current) clearTimeout(copyResetRef.current);
    setCopiedButtonId(id);
    copyResetRef.current = setTimeout(() => {
      setCopiedButtonId(null);
      copyResetRef.current = null;
    }, 2000);
  }, []);

  const copyWithFeedback = useCallback(
    async (id: string, text: string, toastLabel: string) => {
      const ok = await clipboardWriteWithToast(text, toastLabel);
      if (ok) bumpCopiedId(id);
    },
    [bumpCopiedId]
  );

  const parsedQuantity = Number(quantity) || 0;
  const orderTotal = useMemo(
    () => calculateOrderTotal(proxyType, parsedQuantity),
    [proxyType, parsedQuantity]
  );

  const activeProxies = initialData.proxies.length;

  function refresh() {
    router.refresh();
  }

  function handlePlaceOrder() {
    startTransition(async () => {
      const result = await placeOrder({
        proxyType,
        quantity: parsedQuantity,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.newBalance !== undefined) {
        setBalance(result.newBalance);
      }

      toast.success(
        "Order placed successfully. Proxies will appear once fulfilled by our team."
      );
      refresh();
    });
  }

  async function handleCryptoPay(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(depositAmount);
    if (!Number.isFinite(amount) || amount < 1) {
      toast.error("Enter a valid amount of at least $1.");
      return;
    }

    setCryptoPayLoading(true);
    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ amount }),
      });

      const data = (await res.json()) as { invoice_url?: string; error?: string };

      if (!res.ok) {
        toast.error(data.error ?? "Could not start payment.");
        return;
      }

      if (
        typeof data.invoice_url === "string" &&
        data.invoice_url.startsWith("http")
      ) {
        window.location.href = data.invoice_url;
        return;
      }

      toast.error("Invalid response from payment server.");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setCryptoPayLoading(false);
    }
  }

  function handleCopyAllProxies() {
    if (initialData.proxies.length === 0) {
      toast.error("No proxies to copy yet.");
      return;
    }
    void copyWithFeedback(
      "proxy-all",
      formatProxyList(initialData.proxies),
      "Proxy list"
    );
  }

  function handleExportTxt() {
    if (initialData.proxies.length === 0) {
      toast.error("No proxies to export yet.");
      return;
    }
    downloadBlob(
      `ipnova-proxies-${Date.now()}.txt`,
      formatProxyList(initialData.proxies),
      "text/plain"
    );
    toast.success("Downloaded .TXT");
  }

  function handleSaveWhitelistMock() {
    toast.success("IP whitelist saved (preview — not persisted).");
  }

  return (
    <div className="relative min-h-screen bg-[#050505] text-zinc-100">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.08),transparent)]" />
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <motion.header
        className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#050505]/75 backdrop-blur-xl"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <nav className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 lg:gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0 border-white/15 text-zinc-200 lg:hidden"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="size-5" />
            </Button>
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <Network className="h-6 w-6 shrink-0 text-emerald-400" aria-hidden />
            <div>
              <span className="font-heading text-base font-semibold tracking-tight text-white">
                IP Nova
              </span>
              <p className="text-[10px] text-zinc-500">Enterprise proxy network</p>
            </div>
          </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className={cn(
                "hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 sm:flex",
                shellGlass
              )}
            >
              <Wallet className="size-3.5 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-300">
                {formatCurrency(balance)}
              </span>
            </div>
            <motion.div {...hoverLift} {...tapScale}>
              <Button
                variant="outline"
                size="sm"
                className={cn("border-white/15 text-zinc-200", shellGlass)}
                render={<Link href="/" />}
              >
                Home
              </Button>
            </motion.div>
          </div>
        </nav>
      </motion.header>

      <div className="relative mx-auto flex w-full min-h-[calc(100vh-4rem)] max-w-[1600px] flex-1 flex-col lg:flex-row">
        {sidebarOpen ? (
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-[2px] lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}

        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex max-h-[100dvh] w-[min(17rem,88vw)] flex-col overflow-y-auto border-r border-white/[0.06] bg-[#050505] p-3 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.85)] transition-transform duration-200 ease-out",
            "lg:static lg:z-auto lg:max-h-none lg:w-56 lg:shrink-0 lg:border-white/[0.06] lg:bg-[#050505]/40 lg:p-3 lg:shadow-none xl:w-60",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="mb-3 flex shrink-0 items-center justify-between border-b border-white/[0.08] pb-3 lg:hidden">
            <span className="px-1 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
              Navigation
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-zinc-400"
              aria-label="Close menu"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="size-5" />
            </Button>
          </div>

          <div className="flex flex-1 flex-col gap-8 lg:flex-1 lg:gap-0">
            <div className="w-full">
              <p className="mt-0 mb-2 px-3 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                Products
              </p>
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => goView("overview")}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors",
                    view === "overview"
                      ? "bg-white/[0.06] text-white ring-1 ring-emerald-500/25"
                      : "text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200"
                  )}
                >
                  <LayoutDashboard
                    className={cn(
                      "size-4 shrink-0",
                      view === "overview" ? "text-emerald-400" : "text-zinc-500"
                    )}
                  />
                  Overview
                </button>
                <button
                  type="button"
                  onClick={() => goView("proxies")}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors",
                    view === "proxies"
                      ? "bg-white/[0.06] text-white ring-1 ring-emerald-500/25"
                      : "text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200"
                  )}
                >
                  <Server
                    className={cn(
                      "size-4 shrink-0",
                      view === "proxies" ? "text-emerald-400" : "text-zinc-500"
                    )}
                  />
                  <span className="min-w-0 flex-1">Proxy List</span>
                  <Badge className="ml-auto h-4 border-none bg-emerald-500/10 px-1.5 text-[10px] font-semibold leading-none text-emerald-500">
                    ACTIVE
                  </Badge>
                </button>
                <button
                  type="button"
                  onClick={() => goView("proxies")}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors",
                    view === "proxies"
                      ? "bg-white/[0.06] text-white ring-1 ring-emerald-500/25"
                      : "text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200"
                  )}
                >
                  <HardDrive
                    className={cn(
                      "size-4 shrink-0",
                      view === "proxies" ? "text-emerald-400" : "text-zinc-500"
                    )}
                  />
                  Datacenter
                </button>
                <button
                  type="button"
                  onClick={() => goView("proxies")}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors",
                    view === "proxies"
                      ? "bg-white/[0.06] text-white ring-1 ring-emerald-500/25"
                      : "text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200"
                  )}
                >
                  <Wifi
                    className={cn(
                      "size-4 shrink-0",
                      view === "proxies" ? "text-emerald-400" : "text-zinc-500"
                    )}
                  />
                  Residential
                </button>
              </div>
            </div>

            <div className="w-full">
              <p className="mt-6 mb-2 px-3 text-[10px] font-bold tracking-widest text-zinc-500 uppercase lg:mt-6">
                Workspace
              </p>
              <div className="mt-0 flex flex-col gap-0.5 lg:mt-0">
                <button
                  type="button"
                  onClick={() => goView("funds")}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors",
                    view === "funds"
                      ? "bg-white/[0.06] text-white ring-1 ring-emerald-500/25"
                      : "text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200"
                  )}
                >
                  <Wallet
                    className={cn(
                      "size-4 shrink-0",
                      view === "funds" ? "text-emerald-400" : "text-zinc-500"
                    )}
                  />
                  Billing & Top-up
                </button>
                <button
                  type="button"
                  onClick={() => goView("affiliate")}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors",
                    view === "affiliate"
                      ? "bg-white/[0.06] text-white ring-1 ring-emerald-500/25"
                      : "text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200"
                  )}
                >
                  <TrendingUp
                    className={cn(
                      "size-4 shrink-0",
                      view === "affiliate" ? "text-emerald-400" : "text-zinc-500"
                    )}
                  />
                  Affiliate Program
                </button>
              </div>
            </div>

            <div className="w-full">
              <p className="mt-6 mb-2 px-3 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                Developer
              </p>
              <div className="flex flex-col gap-0.5">
                <Link
                  href="/dashboard?view=developer-api"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/[0.03] hover:text-zinc-200"
                >
                  <BookOpen className="size-4 shrink-0 text-zinc-500" />
                  API Docs
                </Link>
                <Link
                  href="/tools"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/[0.03] hover:text-zinc-200"
                >
                  <BookMarked className="size-4 shrink-0 text-zinc-500" />
                  Setup Guides
                </Link>
              </div>
            </div>
          </div>

          {initialData.isAdmin && (
            <div className="mt-4 border-t border-white/[0.06] pt-3">
              <Link
                href="/admin"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center justify-center gap-2 rounded-lg py-2 text-[11px] text-zinc-600 transition-colors hover:text-zinc-400 lg:justify-start lg:px-2"
              >
                <Lock className="size-3.5 shrink-0 opacity-70" aria-hidden />
                <span className="font-medium tracking-wide">Admin panel</span>
              </Link>
            </div>
          )}
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:py-8">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                Control <span className={glowTitle}>Center</span>
              </h1>
              <p className="mt-1 text-sm text-zinc-400">
                {initialData.email}
                {!isAdminEmail(initialData.email) ? "" : " · Administrator"}
              </p>
            </div>
            <div
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2 sm:hidden",
                shellGlass
              )}
            >
              <Wallet className="size-4 text-emerald-400" />
              <span className="font-medium">{formatCurrency(balance)}</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={viewTransition.initial}
              animate={viewTransition.animate}
              exit={viewTransition.exit}
              transition={viewTransition.transition}
              className="space-y-6"
            >
              {view === "overview" && (
                <motion.div
                  className="space-y-12"
                  variants={bentoContainer}
                  initial="hidden"
                  animate="show"
                >
                  {/* Section A — Most popular plans */}
                  <motion.section variants={bentoItem} className="space-y-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="font-heading text-xl font-semibold tracking-tight text-white sm:text-2xl">
                          Most popular plans
                        </h2>
                        <p className="mt-1 text-sm text-zinc-500">
                          Enterprise-grade throughput with dedicated routing and
                          SLA-backed infrastructure.
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="text-xs font-medium text-zinc-400">
                          Pay yearly
                        </span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={payYearly}
                          onClick={() => setPayYearly((v) => !v)}
                          className={cn(
                            "relative h-7 w-12 rounded-full border transition-colors",
                            payYearly
                              ? "border-emerald-500/40 bg-emerald-500/20"
                              : "border-white/10 bg-white/[0.04]"
                          )}
                        >
                          <span
                            className={cn(
                              "absolute top-1 left-1 size-5 rounded-full bg-white shadow transition-transform",
                              payYearly ? "translate-x-5" : "translate-x-0"
                            )}
                          />
                        </button>
                        <span className="ml-2 rounded bg-fuchsia-500/20 px-2 py-0.5 text-xs font-bold text-fuchsia-300">
                          SAVE 30%
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                      {[
                        {
                          title: "Proxy Server",
                          Icon: Server,
                          specs: ["100 Proxies", "250 GB Bandwidth"],
                          price: payYearly ? "$24.99 /yr" : "$2.99 /mo",
                        },
                        {
                          title: "Static Residential",
                          Icon: Building2,
                          specs: ["50 Dedicated IPs", "Unmetered sessions"],
                          price: payYearly ? "$89.99 /yr" : "$9.99 /mo",
                        },
                        {
                          title: "Rotating Residential",
                          Icon: RefreshCw,
                          specs: ["10M+ pool", "Country-level targeting"],
                          price: payYearly ? "$119.99 /yr" : "$14.99 /mo",
                        },
                      ].map((plan) => (
                        <div
                          key={plan.title}
                          className="rounded-xl border border-white/5 bg-white/[0.02] p-6"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]">
                              <plan.Icon className="size-5 text-emerald-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-heading text-base font-semibold text-white">
                                {plan.title}
                              </h3>
                              <ul className="mt-3 space-y-2">
                                {plan.specs.map((s) => (
                                  <li
                                    key={s}
                                    className="flex items-center gap-2 text-sm text-zinc-400"
                                  >
                                    <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
                                    {s}
                                  </li>
                                ))}
                              </ul>
                              <p className="mt-4 font-mono text-lg font-semibold tracking-tight text-white">
                                {plan.price}
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-4 w-full border-emerald-500/40 bg-transparent text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                                onClick={() => goBilling()}
                              >
                                Get Started
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.section>

                  {/* Section B — Setup guides */}
                  <motion.section variants={bentoItem} className="space-y-3">
                    <div>
                      <h2 className="font-heading text-xl font-semibold tracking-tight text-white sm:text-2xl">
                        Popular proxy setup guides
                      </h2>
                      <p className="mt-1 max-w-2xl text-sm text-zinc-500">
                        Learn how to use your proxies on the most popular apps and
                        platforms.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
                      {SETUP_GUIDE_ITEMS.map(({ icon: Icon, label }) => (
                        <button
                          key={label}
                          type="button"
                          className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center transition-all hover:bg-white/[0.08]"
                        >
                          <Icon className="size-8 text-zinc-300" />
                          <span className="text-xs font-medium text-zinc-400">
                            {label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.section>

                  {/* Section C — AI agent */}
                  <motion.section variants={bentoItem} className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-heading text-xl font-semibold tracking-tight text-white sm:text-2xl">
                        Use IP Nova with your AI agent
                      </h2>
                      <Badge className="border-0 bg-emerald-500/20 text-emerald-400">
                        New
                      </Badge>
                    </div>
                    <p className="max-w-3xl text-sm text-zinc-500">
                      One command to drop the IP Nova skill into Claude, Gemini,
                      Codex, and 40+ other agents.
                    </p>

                    <div className="flex flex-wrap gap-6 border-b border-white/10 text-sm font-medium">
                      {(
                        [
                          ["seo", "SEO Monitoring"],
                          ["ad", "Ad Verification"],
                          ["streaming", "Streaming QA"],
                          ["social", "Social Monitoring"],
                        ] as const
                      ).map(([id, label]) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setAiAgentTab(id)}
                          className={cn(
                            "-mb-px border-b-2 pb-3 transition-colors",
                            aiAgentTab === id
                              ? "border-emerald-500 text-emerald-400"
                              : "border-transparent text-zinc-500 hover:text-zinc-300"
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black p-6 font-mono text-sm">
                      <p className="mb-2 text-zinc-500">1. Install the skill</p>
                      <div className="mb-6 flex flex-col gap-3 rounded border border-white/5 bg-[#0a0a0a] p-3 text-emerald-400 sm:flex-row sm:items-center sm:justify-between">
                        <pre className="min-w-0 max-w-full flex-1 overflow-x-auto whitespace-nowrap text-sm">{`$ ${SKILL_INSTALL_CMD}`}</pre>
                        <button
                          type="button"
                          className="shrink-0 text-zinc-500 hover:text-zinc-300"
                          aria-label="Copy install command"
                          onClick={() =>
                            void copyWithFeedback(
                              "skill-cmd",
                              SKILL_INSTALL_CMD,
                              "Install command"
                            )
                          }
                        >
                          {copiedButtonId === "skill-cmd" ? (
                            <Check className="size-4 text-emerald-400" />
                          ) : (
                            <Copy className="size-4" />
                          )}
                        </button>
                      </div>
                      <p className="mb-2 text-zinc-500">2. Try this prompt</p>
                      <div className="flex flex-col gap-3 rounded border border-white/5 bg-[#0a0a0a] p-4 text-zinc-300 sm:flex-row sm:items-start sm:justify-between">
                        <pre className="min-w-0 max-w-full flex-1 overflow-x-auto whitespace-nowrap leading-relaxed text-sm">{`> ${SKILL_PROMPT_SNIPPET}`}</pre>
                        <button
                          type="button"
                          className="mt-0 shrink-0 self-end text-zinc-500 hover:text-zinc-300 sm:mt-1 sm:self-start"
                          aria-label="Copy prompt"
                          onClick={() =>
                            void copyWithFeedback(
                              "skill-prompt",
                              SKILL_PROMPT_SNIPPET,
                              "Prompt"
                            )
                          }
                        >
                          {copiedButtonId === "skill-prompt" ? (
                            <Check className="size-4 text-emerald-400" />
                          ) : (
                            <Copy className="size-4" />
                          )}
                        </button>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-400">
                        <span>
                          <CheckCircle2 className="mr-1 inline size-4 text-emerald-500" />
                          Per-country ranking diff
                        </span>
                        <span>
                          <CheckCircle2 className="mr-1 inline size-4 text-emerald-500" />
                          Competitor movement ranked
                        </span>
                      </div>
                    </div>
                  </motion.section>
                </motion.div>
              )}

              {view === "buy" && (
                <div className="space-y-6">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <ProductCard
                      title="Datacenter"
                      priceLabel={`$${DATACENTER_PRICE_PER_IP.toFixed(2)}/IP`}
                      description="High-speed dedicated IPs for automation, scraping, and bulk tasks."
                      icon={Server}
                      selected={proxyType === "datacenter"}
                      onSelect={() => setProxyType("datacenter")}
                    />
                    <ProductCard
                      title="Residential"
                      priceLabel={`$${RESIDENTIAL_PRICE_PER_GB.toFixed(2)}/GB`}
                      description="Real residential IPs for strict anti-bot and geo-targeted use cases."
                      icon={Globe}
                      selected={proxyType === "residential"}
                      onSelect={() => setProxyType("residential")}
                    />
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card className={cn(shellGlass)}>
                      <CardHeader>
                        <CardTitle>Order calculator</CardTitle>
                        <CardDescription className="text-zinc-500">
                          {proxyType === "datacenter"
                            ? "Enter the number of IPs you need."
                            : "Enter the bandwidth in gigabytes (GB)."}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="quantity">
                            {proxyType === "datacenter"
                              ? "Quantity (IPs)"
                              : "Quantity (GB)"}
                          </Label>
                          <Input
                            id="quantity"
                            type="number"
                            min={1}
                            step={proxyType === "datacenter" ? 1 : 0.1}
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="border-white/10 bg-zinc-950/80"
                          />
                        </div>
                        <motion.div className="w-full" {...hoverLift} {...tapScale}>
                          <Button
                            className="w-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-black shadow-lg shadow-cyan-500/20 hover:from-emerald-300 hover:to-cyan-300"
                            disabled={isPending || parsedQuantity <= 0}
                            onClick={handlePlaceOrder}
                          >
                            {isPending ? (
                              <>
                                <Loader2 className="animate-spin" />
                                Processing…
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="size-4" />
                                Place order
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </CardContent>
                    </Card>

                    <motion.div {...hoverLift}>
                      <Card
                        className={cn(
                          shellGlass,
                          "border-emerald-500/15 bg-gradient-to-br from-emerald-500/[0.08] via-white/[0.02] to-cyan-500/[0.06] shadow-[0_0_40px_-12px_rgba(34,211,238,0.22)]"
                        )}
                      >
                        <CardHeader>
                          <CardTitle>Order summary</CardTitle>
                          <CardDescription className="text-zinc-500">
                            Live pricing — no hidden fees
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Product</span>
                              <span className="font-medium capitalize">{proxyType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Quantity</span>
                              <span className="font-medium">
                                {parsedQuantity || "—"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Unit price</span>
                              <span className="font-medium">
                                {proxyType === "datacenter"
                                  ? formatCurrency(DATACENTER_PRICE_PER_IP)
                                  : formatCurrency(RESIDENTIAL_PRICE_PER_GB)}
                                {proxyType === "datacenter" ? "/IP" : "/GB"}
                              </span>
                            </div>
                            <Separator className="bg-white/10" />
                            <div className="flex justify-between text-base">
                              <span className="font-medium">Total</span>
                              <span className="text-xl font-bold text-cyan-300">
                                {formatCurrency(orderTotal)}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-zinc-500">Your balance</span>
                              <span
                                className={cn(
                                  balance >= orderTotal
                                    ? "text-emerald-400"
                                    : "text-red-400"
                                )}
                              >
                                {formatCurrency(balance)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                </div>
              )}

              {view === "proxies" && (
                <div className="space-y-6">
                  <Card className={cn(shellGlass, "overflow-hidden")}>
                    <CardHeader className="flex flex-col gap-4 border-b border-white/[0.06] pb-6 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <CardTitle className="font-heading text-xl text-white">
                          Deployed proxies
                        </CardTitle>
                        <CardDescription className="text-zinc-500">
                          Live credentials issued to your workspace. Copy or export in
                          raw <span className="font-mono text-zinc-400">IP:PORT:USER:PASS</span>{" "}
                          format for runners and secret managers.
                        </CardDescription>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <motion.div {...hoverLift} {...tapScale}>
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn("border-white/12", shellGlass)}
                            onClick={handleCopyAllProxies}
                            disabled={activeProxies === 0}
                          >
                            {copiedButtonId === "proxy-all" ? (
                              <Check className="size-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                            {copiedButtonId === "proxy-all" ? "Copied!" : "Copy all"}
                          </Button>
                        </motion.div>
                        <motion.div {...hoverLift} {...tapScale}>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-black hover:from-emerald-300 hover:to-cyan-300"
                            onClick={handleExportTxt}
                            disabled={activeProxies === 0}
                          >
                            <Download className="size-3.5" />
                            Download .txt
                          </Button>
                        </motion.div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6 sm:pt-0">
                      {activeProxies === 0 ? (
                        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                            <Server className="size-7 text-zinc-500" aria-hidden />
                          </div>
                          <p className="font-heading text-lg font-semibold text-white">
                            No active proxies found
                          </p>
                          <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
                            Deposit crypto to order your first node. Once treasury confirms
                            payment, our operators provision wholesale capacity (Vultr,
                            ISP partners) directly into this table.
                          </p>
                          <Button
                            className="mt-6 gap-2 bg-gradient-to-r from-emerald-400 to-cyan-400 text-black hover:from-emerald-300 hover:to-cyan-300"
                            size="sm"
                            onClick={() => goView("funds")}
                          >
                            <Wallet className="size-3.5" />
                            Add funds &amp; order
                          </Button>
                        </div>
                      ) : (
                        <ScrollArea className="max-h-[min(560px,70vh)] w-full">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-white/[0.08] hover:bg-transparent">
                                <TableHead className="text-zinc-400">IP address</TableHead>
                                <TableHead className="text-zinc-400">Port</TableHead>
                                <TableHead className="text-zinc-400">Username</TableHead>
                                <TableHead className="text-zinc-400">Password</TableHead>
                                <TableHead className="text-zinc-400">Type</TableHead>
                                <TableHead className="text-zinc-400">Status</TableHead>
                                <TableHead className="w-12 text-right text-zinc-400">
                                  Copy
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {initialData.proxies.map((proxy) => {
                                const line = formatProxyLine(proxy);
                                return (
                                  <TableRow
                                    key={proxy.id}
                                    className="border-white/[0.06] hover:bg-white/[0.02]"
                                  >
                                    <TableCell className="font-mono text-sm text-zinc-200">
                                      {proxy.ip_address}
                                    </TableCell>
                                    <TableCell className="font-mono text-sm text-zinc-300">
                                      {proxy.port}
                                    </TableCell>
                                    <TableCell className="max-w-[140px] truncate font-mono text-xs text-cyan-100/90">
                                      {proxy.username}
                                    </TableCell>
                                    <TableCell className="max-w-[120px] truncate font-mono text-xs text-zinc-400">
                                      {proxy.password}
                                    </TableCell>
                                    <TableCell>
                                      <Badge className="border-white/10 bg-white/[0.04] text-xs font-normal text-zinc-300">
                                        Datacenter
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400">
                                        <span aria-hidden>🟢</span>
                                        Active
                                      </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <UiTooltip>
                                        <TooltipTrigger
                                          render={
                                            <Button
                                              variant="ghost"
                                              size="icon-sm"
                                              className="text-zinc-400 hover:text-cyan-300"
                                              onClick={() =>
                                                void copyWithFeedback(
                                                  `proxy-${proxy.id}`,
                                                  line,
                                                  "Proxy line"
                                                )
                                              }
                                            />
                                          }
                                        >
                                          {copiedButtonId === `proxy-${proxy.id}` ? (
                                            <Check className="size-3.5 text-emerald-400" />
                                          ) : (
                                            <Copy className="size-3.5" />
                                          )}
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          {copiedButtonId === `proxy-${proxy.id}`
                                            ? "Copied!"
                                            : "Copy line"}
                                        </TooltipContent>
                                      </UiTooltip>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>

                  <Card className={cn(shellGlass)}>
                    <CardHeader>
                      <CardTitle className="text-lg">IP whitelist</CardTitle>
                      <CardDescription className="text-zinc-500">
                        Restrict outbound sessions to trusted ranges (preview UI).
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
                      <div className="min-w-0 flex-1 space-y-2">
                        <Label htmlFor="whitelist">Allowed CIDRs / IPs</Label>
                        <Input
                          id="whitelist"
                          value={whitelistDraft}
                          onChange={(e) => setWhitelistDraft(e.target.value)}
                          placeholder="203.0.113.0/24, 198.51.100.10"
                          className="border-white/10 bg-zinc-950/80 font-mono text-sm"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/10"
                        onClick={handleSaveWhitelistMock}
                      >
                        Save whitelist
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {view === "funds" && (
                <motion.div
                  initial={fadeInUp.initial}
                  animate={fadeInUp.animate}
                  transition={defaultTransition}
                  className="mx-auto max-w-lg"
                >
                  <Card
                    className={cn(
                      shellGlass,
                      "overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.08] via-zinc-950/40 to-cyan-500/[0.06] shadow-[0_0_48px_-12px_rgba(16,185,129,0.22)]"
                    )}
                  >
                    <CardHeader>
                      <CardTitle className="font-heading flex items-center gap-2 text-xl">
                        <Zap className="size-6 text-emerald-400" />
                        Add funds
                      </CardTitle>
                      <CardDescription className="text-zinc-500">
                        Pay with cryptocurrency via NOWPayments. Your balance updates
                        automatically when the payment completes.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleCryptoPay} className="space-y-5">
                        <div className="space-y-2">
                          <Label htmlFor="crypto-amount">Amount (USD)</Label>
                          <Input
                            id="crypto-amount"
                            type="number"
                            min={1}
                            step={0.01}
                            placeholder="50.00"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            required
                            disabled={cryptoPayLoading}
                            className="border-white/10 bg-zinc-950/80 text-lg font-medium"
                          />
                        </div>
                        <motion.div {...hoverLift} {...tapScale}>
                          <Button
                            type="submit"
                            disabled={cryptoPayLoading}
                            className="w-full gap-2 bg-gradient-to-r from-emerald-400 to-cyan-400 py-6 text-base font-semibold text-black shadow-lg shadow-emerald-500/20 hover:from-emerald-300 hover:to-cyan-300"
                          >
                            {cryptoPayLoading ? (
                              <>
                                <Loader2 className="size-5 animate-spin" />
                                Opening checkout…
                              </>
                            ) : (
                              <>
                                <Zap className="size-5" />
                                Pay with crypto
                              </>
                            )}
                          </Button>
                        </motion.div>
                        <p className="text-center text-xs text-zinc-500">
                          You will be redirected to NOWPayments to choose your asset and
                          complete the transfer.
                        </p>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {view === "affiliate" && (
                <motion.div
                  className="space-y-6"
                  variants={bentoContainer}
                  initial="hidden"
                  animate="show"
                >
                  <motion.div variants={bentoItem}>
                    <Card
                      className={cn(
                        shellGlass,
                        "overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.08] via-white/[0.02] to-cyan-500/[0.06] ring-1 ring-emerald-500/15"
                      )}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="border-0 bg-emerald-500/15 text-emerald-300">
                            Growth
                          </Badge>
                          <Badge className="border-0 bg-cyan-500/10 text-cyan-300">
                            20% recurring
                          </Badge>
                        </div>
                        <CardTitle className="font-heading pt-2 text-2xl tracking-tight text-white sm:text-3xl">
                          Invite developers.{" "}
                          <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                            Earn 20% recurring commission.
                          </span>
                        </CardTitle>
                        <CardDescription className="max-w-2xl text-[15px] text-zinc-400">
                          Share IP Nova with teams running HTTP/HTTPS/SOCKS5 automation.
                          When referrals activate paid plans, you earn on every renewal
                          cycle—tracked transparently in this workspace.
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </motion.div>

                  <motion.div variants={bentoItem}>
                    <Card className={cn(shellGlass)}>
                      <CardHeader className="pb-2">
                        <CardTitle className="font-heading flex items-center gap-2 text-lg text-white">
                          <Copy className="size-5 text-emerald-400" />
                          Your referral link
                        </CardTitle>
                        <CardDescription className="text-zinc-500">
                          Anyone who lands on this URL has your code stored locally until
                          they register—perfect for docs, demos, and conference swag.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                        <Input
                          readOnly
                          value={referralShareUrl}
                          className="h-11 border-white/[0.08] bg-black/40 font-mono text-sm text-zinc-200"
                        />
                        <Button
                          type="button"
                          className="h-11 shrink-0 bg-gradient-to-r from-emerald-400 to-cyan-400 text-black hover:from-emerald-300 hover:to-cyan-300"
                          onClick={() =>
                            void copyWithFeedback(
                              "referral-link",
                              referralShareUrl,
                              "Referral link"
                            )
                          }
                        >
                          {copiedButtonId === "referral-link" ? (
                            <Check className="size-4" />
                          ) : (
                            <Copy className="size-4" />
                          )}
                          {copiedButtonId === "referral-link"
                            ? "Copied!"
                            : "Copy link"}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    variants={bentoItem}
                    className="grid gap-4 sm:grid-cols-3"
                  >
                    <AffiliateGlowMetric
                      label="Total clicks"
                      value="2,450"
                      glow="emerald"
                    />
                    <AffiliateGlowMetric
                      label="Active referrals"
                      value="14"
                      glow="cyan"
                    />
                    <AffiliateGlowMetric
                      label="Unpaid earnings"
                      value="$350.00"
                      glow="emerald"
                    />
                  </motion.div>

                  <motion.div variants={bentoItem} className="grid gap-4 lg:grid-cols-5">
                    <Card
                      className={cn(
                        shellGlass,
                        "lg:col-span-2 border-amber-500/15 bg-gradient-to-br from-amber-500/[0.06] to-transparent"
                      )}
                    >
                      <CardHeader>
                        <CardTitle className="font-heading text-lg text-white">
                          Payouts
                        </CardTitle>
                        <CardDescription className="text-sm text-zinc-400">
                          Withdrawals settle in <strong className="text-zinc-200">USDT</strong>{" "}
                          or <strong className="text-zinc-200">BTC</strong> on supported
                          networks once your unpaid balance exceeds{" "}
                          <strong className="text-amber-200">$50.00</strong>. Enterprise
                          partners may request invoiced wires on signed agreements.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button
                          type="button"
                          size="lg"
                          className="w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 py-6 text-base font-semibold text-black shadow-[0_0_40px_-6px_rgba(251,191,36,0.55)] hover:from-amber-300 hover:via-orange-300 hover:to-amber-400"
                          onClick={() =>
                            toast.success("Payout request received — finance will confirm wallet details.")
                          }
                        >
                          Request payout
                        </Button>
                        <p className="mt-3 text-center text-xs text-zinc-500">
                          Mock UI — settlement rails activate after compliance review.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className={cn(shellGlass, "lg:col-span-3")}>
                      <CardHeader className="pb-2">
                        <CardTitle className="font-heading text-lg text-white">
                          Recent referrals
                        </CardTitle>
                        <CardDescription className="text-zinc-500">
                          Latest attributed signups (masked IDs). Demo data for layout
                          preview.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-0 sm:px-6">
                        <ScrollArea className="h-[280px] sm:h-[240px]">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-white/[0.06] hover:bg-transparent">
                                <TableHead className="text-zinc-400">Date</TableHead>
                                <TableHead className="text-zinc-400">User</TableHead>
                                <TableHead className="text-right text-zinc-400">
                                  Commission
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {AFFILIATE_DEMO_ROWS.map((row) => (
                                <TableRow
                                  key={row.at}
                                  className="border-white/[0.06] hover:bg-white/[0.02]"
                                >
                                  <TableCell className="font-mono text-xs text-zinc-400">
                                    {formatDate(row.at)}
                                  </TableCell>
                                  <TableCell className="font-mono text-sm text-emerald-200/90">
                                    {row.masked}
                                  </TableCell>
                                  <TableCell className="text-right font-medium text-white">
                                    {formatCurrency(row.commission)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              )}

              {view === "developer" && (
                <div className="mx-auto max-w-3xl space-y-6">
                  <Card className={cn(shellGlass)}>
                    <CardHeader>
                      <CardTitle className="font-heading flex items-center gap-2 text-lg">
                        <Braces className="size-5 text-cyan-400" />
                        API credentials
                      </CardTitle>
                      <CardDescription className="text-zinc-500">
                        Programmatic access to your active proxy inventory (sample key
                        for UI preview).
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div
                          className={cn(
                            "min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-black/40 px-4 py-3 font-mono text-sm",
                            !apiKeyRevealed && "select-none blur-sm"
                          )}
                        >
                          {MOCK_API_KEY}
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-white/12"
                            onClick={() => setApiKeyRevealed((v) => !v)}
                          >
                            {apiKeyRevealed ? (
                              <>
                                <EyeOff className="size-3.5" />
                                Hide
                              </>
                            ) : (
                              <>
                                <Eye className="size-3.5" />
                                Reveal
                              </>
                            )}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            className="bg-emerald-500 text-black hover:bg-emerald-400"
                            onClick={() =>
                              void copyWithFeedback(
                                "api-key",
                                MOCK_API_KEY,
                                "API key"
                              )
                            }
                          >
                            {copiedButtonId === "api-key" ? (
                              <Check className="size-3.5" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                            {copiedButtonId === "api-key" ? "Copied!" : "Copy"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className={cn(shellGlass)}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">cURL</CardTitle>
                        <CardDescription className="text-xs text-zinc-500">
                          Fetch proxies as JSON
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <pre className="max-h-[220px] overflow-x-auto whitespace-pre rounded-lg border border-white/[0.06] bg-black/50 p-3 text-[11px] leading-relaxed text-zinc-300">
                          {`curl -sS https://api.ipnova.online/v1/proxies \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Accept: application/json"`}
                        </pre>
                      </CardContent>
                    </Card>
                    <Card className={cn(shellGlass)}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Python (requests)</CardTitle>
                        <CardDescription className="text-xs text-zinc-500">
                          Same response, typed for scripts
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <pre className="max-h-[220px] overflow-x-auto whitespace-pre rounded-lg border border-white/[0.06] bg-black/50 p-3 text-[11px] leading-relaxed text-zinc-300">
                          {`import requests

r = requests.get(
    "https://api.ipnova.online/v1/proxies",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Accept": "application/json",
    },
    timeout=30,
)
r.raise_for_status()
data = r.json()`}
                        </pre>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function AffiliateGlowMetric({
  label,
  value,
  glow,
}: {
  label: string;
  value: string;
  glow: "emerald" | "cyan";
}) {
  const halo =
    glow === "emerald"
      ? "from-emerald-400/35 via-emerald-500/10 to-transparent"
      : "from-cyan-400/35 via-cyan-500/10 to-transparent";
  const textGrad =
    glow === "emerald"
      ? "from-emerald-200 to-cyan-200 drop-shadow-[0_0_26px_rgba(52,211,153,0.42)]"
      : "from-cyan-200 to-emerald-200 drop-shadow-[0_0_26px_rgba(34,211,238,0.42)]";

  return (
    <motion.div {...hoverLift}>
      <Card
        className={cn(
          shellGlass,
          "relative h-full overflow-hidden ring-1 ring-inset ring-white/[0.07]"
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-b opacity-90",
            halo
          )}
          aria-hidden
        />
        <CardContent className="relative p-5 sm:p-6">
          <p className="text-xs font-medium tracking-wider text-zinc-500 uppercase">
            {label}
          </p>
          <p
            className={cn(
              "mt-3 font-heading text-3xl font-bold tracking-tight tabular-nums sm:text-4xl",
              "bg-gradient-to-r bg-clip-text text-transparent",
              textGrad
            )}
          >
            {value}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ProductCard({
  title,
  priceLabel,
  description,
  icon: Icon,
  selected,
  onSelect,
}: {
  title: string;
  priceLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      {...hoverLift}
      {...tapScale}
      className={cn(
        "w-full rounded-2xl border p-5 text-left backdrop-blur-xl transition-all",
        selected
          ? "border-cyan-500/45 bg-gradient-to-br from-cyan-500/15 to-zinc-950/80 shadow-[0_0_40px_-8px_rgba(34,211,238,0.35)] ring-1 ring-cyan-500/25"
          : cn(shellGlass, "hover:border-emerald-500/20")
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-11 items-center justify-center rounded-lg bg-cyan-500/10 ring-1 ring-cyan-500/20">
          <Icon className="size-5 text-cyan-400" />
        </div>
        {selected && (
          <Badge className="border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
            Selected
          </Badge>
        )}
      </div>
      <h3 className="font-heading mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm font-medium text-cyan-300">{priceLabel}</p>
      <p className="mt-2 text-sm text-zinc-400">{description}</p>
    </motion.button>
  );
}

export function DashboardClient(props: DashboardClientProps) {
  return (
    <Suspense fallback={<SearchParamsSuspenseFallback />}>
      <DashboardClientInner {...props} />
    </Suspense>
  );
}
