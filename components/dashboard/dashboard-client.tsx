"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import {
  DashboardPromoBanners,
  ProductOfferCard,
} from "@/components/dashboard/dashboard-offers";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import type { Icon } from "@phosphor-icons/react";
import {
  BookOpen,
  Bookmark,
  BracketsCurly,
  Buildings,
  ChatCircle,
  Check,
  ClipboardText,
  Copy,
  DeviceMobile,
  DownloadSimple,
  Fire,
  Globe,
  GlobeHemisphereWest,
  HardDrive,
  HardDrives,
  Lightning,
  List,
  Lock,
  Monitor,
  MusicNote,
  PaperPlaneTilt,
  ShareNetwork,
  Shield,
  SquaresFour,
  TrendUp,
  UserCircle,
  WifiHigh,
  X,
} from "@phosphor-icons/react";

import { BrandMark, IconSpinner, LordIcon } from "@/components/icons";
import { toast } from "sonner";


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
  tierBadgeClass,
} from "@/lib/dashboard/account-stats";
import {
  defaultTransition,
  fadeInUp,
  glowTitle,
  hoverLift,
  tapScale,
} from "@/lib/motion";
import {
  isProductDashboardView,
  productFromViewSlug,
  viewSlugForProduct,
} from "@/lib/product-routing";
import {
  formatProductQuantityLabel,
  formatProductTypeLabel,
  formatProductUnitPrice,
  getProduct,
  PROXY_PRODUCTS,
  type ProxyProduct,
} from "@/lib/pricing";
import { formatProxyLine, formatProxyList } from "@/lib/proxy-format";
import { SITE_URL } from "@/lib/site-url";
import type { DashboardData, UserProxy } from "@/lib/types/dashboard";
import { cn } from "@/lib/utils";

const ProductPurchasePage = dynamic(
  () =>
    import("@/components/dashboard/product-purchase-page").then(
      (mod) => mod.ProductPurchasePage
    ),
  {
    loading: () => (
      <div className="h-72 animate-pulse rounded-2xl bg-white/[0.04]" aria-hidden />
    ),
  }
);

const OrderExtrasText = dynamic(
  () =>
    import("@/components/dashboard/order-extras-text").then(
      (mod) => mod.OrderExtrasText
    )
);

const AccountOverview = dynamic(
  () =>
    import("@/components/dashboard/account-overview").then(
      (mod) => mod.AccountOverview
    ),
  {
    loading: () => (
      <motion.div className="h-64 animate-pulse rounded-2xl bg-white/[0.04]" aria-hidden />
    ),
  }
);

const LottieEmptyState = dynamic(
  () =>
    import("@/components/motion/lottie-empty-state").then(
      (mod) => mod.LottieEmptyState
    ),
  { ssr: false }
);

type DashboardClientProps = {
  initialData: DashboardData;
};

type DashboardView =
  | "overview"
  | "account"
  | "proxies"
  | ProxyProduct
  | "orders"
  | "funds"
  | "developer"
  | "affiliate";

type WorkspaceView = Exclude<DashboardView, ProxyProduct>;

const PRODUCT_ICONS: Record<ProxyProduct, Icon> = {
  datacenter: HardDrives,
  residential: GlobeHemisphereWest,
  static_residential: Buildings,
  isp: ShareNetwork,
  mobile: DeviceMobile,
};

const VIEW_PARAM = "view";

const VIEW_ALIASES: Record<string, WorkspaceView> = {
  overview: "overview",
  account: "account",
  profile: "account",
  "my-account": "account",
  proxies: "proxies",
  "my-proxies": "proxies",
  "proxy-list": "proxies",
  buy: "overview",
  "buy-proxies": "overview",
  orders: "orders",
  "my-orders": "orders",
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

const WORKSPACE_VIEW_SLUG: Record<WorkspaceView, string> = {
  overview: "overview",
  account: "account",
  proxies: "my-proxies",
  orders: "my-orders",
  funds: "billing",
  developer: "developer-api",
  affiliate: "affiliate",
};

function viewQuerySlug(view: DashboardView): string {
  if (isProductDashboardView(view)) {
    return viewSlugForProduct(view);
  }
  return WORKSPACE_VIEW_SLUG[view];
}

function parseDashboardViewParam(raw: string | null): DashboardView {
  if (!raw) return "overview";
  const key = raw.trim().toLowerCase();
  const product = productFromViewSlug(key);
  if (product) return product;
  return VIEW_ALIASES[key] ?? "overview";
}

const SETUP_GUIDE_ITEMS: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}[] = [
  { icon: Globe, label: "Google Chrome" },
  { icon: Fire, label: "Mozilla Firefox" },
  { icon: PaperPlaneTilt, label: "Telegram" },
  { icon: ChatCircle, label: "WhatsApp" },
  { icon: MusicNote, label: "TikTok" },
  { icon: DeviceMobile, label: "Android" },
  { icon: Monitor, label: "Windows" },
  { icon: Shield, label: "GoLogin" },
];

const shellGlass =
  "rounded-2xl border border-white/[0.05] bg-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl";

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

function shortOrderId(id: string) {
  return id.slice(0, 8);
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
      params.set(VIEW_PARAM, viewQuerySlug(next));
      router.push(`/dashboard?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );
  const [depositAmount, setDepositAmount] = useState("");
  const [cryptoPayLoading, setCryptoPayLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedButtonId, setCopiedButtonId] = useState<string | null>(null);
  const copyResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pendingOrdersCount = useMemo(
    () => initialData.orders.filter((order) => order.status === "pending").length,
    [initialData.orders]
  );

  const goView = useCallback(
    (next: DashboardView) => {
      navigateView(next);
      setSidebarOpen(false);
    },
    [navigateView]
  );

  const goBuyProduct = useCallback(
    (product: ProxyProduct) => {
      goView(product);
    },
    [goView]
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

  const activeProxies = initialData.proxies.length;

  function refresh() {
    router.refresh();
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
              <List className="size-5" />
            </Button>
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <BrandMark size={36} />
            <div>
              <span className="font-heading text-base font-semibold tracking-tight text-white">
                IP Nova
              </span>
              <p className="text-[10px] text-zinc-500">Enterprise proxy network</p>
            </div>
          </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Badge
              className={cn(
                "hidden border sm:inline-flex",
                tierBadgeClass(initialData.accountStats.accountTier)
              )}
            >
              {initialData.accountStats.tierLabel}
            </Badge>
            <div
              className={cn(
                "hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 sm:flex",
                shellGlass
              )}
            >
              <LordIcon name="wallet" size={22} trigger="hover" />
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
                  <SquaresFour
                    className={cn(
                      "size-5 shrink-0",
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
                  <HardDrives
                    className={cn(
                      "size-5 shrink-0",
                      view === "proxies" ? "text-emerald-400" : "text-zinc-500"
                    )}
                  />
                  <span className="min-w-0 flex-1">Proxy List</span>
                  <Badge className="ml-auto h-4 border-none bg-emerald-500/10 px-1.5 text-[10px] font-semibold leading-none text-emerald-500">
                    ACTIVE
                  </Badge>
                </button>
                {PROXY_PRODUCTS.map((product) => {
                  const Icon = PRODUCT_ICONS[product.id];
                  const buying = view === product.id;
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => goBuyProduct(product.id)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors",
                        buying
                          ? "bg-white/[0.06] text-white ring-1 ring-emerald-500/25"
                          : "text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200"
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-5 shrink-0",
                          buying ? "text-emerald-400" : "text-zinc-500"
                        )}
                      />
                      {product.shortLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="w-full">
              <p className="mt-6 mb-2 px-3 text-[10px] font-bold tracking-widest text-zinc-500 uppercase lg:mt-6">
                Workspace
              </p>
              <motion.div className="mt-0 flex flex-col gap-0.5 lg:mt-0">
                <button
                  type="button"
                  onClick={() => goView("account")}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors",
                    view === "account"
                      ? "bg-white/[0.06] text-white ring-1 ring-emerald-500/25"
                      : "text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200"
                  )}
                >
                  <UserCircle
                    className={cn(
                      "size-5 shrink-0",
                      view === "account" ? "text-emerald-400" : "text-zinc-500"
                    )}
                  />
                  My account
                </button>
                <button
                  type="button"
                  onClick={() => goView("orders")}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors",
                    view === "orders"
                      ? "bg-white/[0.06] text-white ring-1 ring-emerald-500/25"
                      : "text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200"
                  )}
                >
                  <ClipboardText
                    className={cn(
                      "size-5 shrink-0",
                      view === "orders" ? "text-emerald-400" : "text-zinc-500"
                    )}
                  />
                  <span className="min-w-0 flex-1">My orders</span>
                  {pendingOrdersCount > 0 ? (
                    <Badge className="ml-auto h-4 border-none bg-amber-500/15 px-1.5 text-[10px] font-semibold leading-none text-amber-300">
                      {pendingOrdersCount}
                    </Badge>
                  ) : null}
                </button>
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
                  <LordIcon
                    name="wallet"
                    size={24}
                    trigger="hover"
                    className={view === "funds" ? "" : "opacity-60"}
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
                  <TrendUp
                    className={cn(
                      "size-5 shrink-0",
                      view === "affiliate" ? "text-emerald-400" : "text-zinc-500"
                    )}
                  />
                  Affiliate Program
                </button>
              </motion.div>
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
                  <BookOpen className="size-5 shrink-0 text-zinc-500" />
                  API Docs
                </Link>
                <Link
                  href="/tools"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/[0.03] hover:text-zinc-200"
                >
                  <Bookmark className="size-5 shrink-0 text-zinc-500" />
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
                <Lock className="size-4.5 shrink-0 opacity-70" aria-hidden />
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
              <LordIcon name="wallet" size={24} trigger="hover" />
              <span className="font-medium">{formatCurrency(balance)}</span>
            </div>
          </div>

          <div key={view} className="animate-in fade-in duration-200 space-y-6">
              {view === "overview" && (
                <motion.div
                  className="space-y-12"
                  variants={bentoContainer}
                  initial="hidden"
                  animate="show"
                >
                  <motion.section variants={bentoItem} className="space-y-5">
                    <AccountOverview
                      email={initialData.email}
                      stats={initialData.accountStats}
                      walletBalance={balance}
                      variant="compact"
                      onNavigate={(target) => goView(target)}
                    />
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-white/12"
                        onClick={() => goView("account")}
                      >
                        Full account report
                      </Button>
                    </div>
                  </motion.section>

                  {/* Section A — Live products */}
                  <motion.section variants={bentoItem} className="space-y-5">
                    <div>
                      <h2 className="font-heading text-xl font-semibold tracking-tight text-white sm:text-2xl">
                        Available products
                      </h2>
                      <p className="mt-1 text-sm text-zinc-500">
                        Current catalog pricing — orders debit your wallet balance
                        instantly.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                      {PROXY_PRODUCTS.map((product) => (
                        <ProductOfferCard
                          key={product.id}
                          product={product}
                          productIcon={PRODUCT_ICONS[product.id]}
                          onOrder={goBuyProduct}
                        />
                      ))}
                    </div>
                    <Card className={cn(shellGlass)}>
                      <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-zinc-500">Wallet balance</p>
                          <p className="font-mono text-2xl font-semibold text-white">
                            {formatCurrency(balance)}
                          </p>
                          <p className="mt-1 text-sm text-zinc-500">
                            {activeProxies > 0
                              ? `${activeProxies} active proxy line${activeProxies === 1 ? "" : "s"}`
                              : "No active proxies yet"}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Button
                            type="button"
                            variant="outline"
                            className="border-white/12"
                            onClick={() => goView("proxies")}
                          >
                            My proxies
                          </Button>
                          <Button
                            type="button"
                            className="bg-emerald-500 text-black hover:bg-emerald-400"
                            onClick={() => goBilling()}
                          >
                            Add funds
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.section>

                  <motion.section variants={bentoItem}>
                    <DashboardPromoBanners
                      onNavigate={(target) => {
                        if (target === "funds") goView("funds");
                        else goView("overview");
                      }}
                    />
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
                        <Link
                          key={label}
                          href="/tools"
                          className="flex flex-col items-center justify-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center transition-all hover:bg-white/[0.08]"
                        >
                          <Icon className="size-8 text-zinc-300" />
                          <span className="text-xs font-medium text-zinc-400">
                            {label}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </motion.section>
                </motion.div>
              )}

              {view === "account" && (
                <AccountOverview
                  email={initialData.email}
                  stats={initialData.accountStats}
                  walletBalance={balance}
                  variant="full"
                  onNavigate={(target) => goView(target)}
                />
              )}

              {isProductDashboardView(view) && (
                <ProductPurchasePage
                  productId={view}
                  balance={balance}
                  icon={PRODUCT_ICONS[view]}
                  onOrderPlaced={(newBalance) => {
                    if (typeof newBalance === "number") {
                      setBalance(newBalance);
                    }
                    refresh();
                    goView("orders");
                  }}
                />
              )}

              {view === "orders" && (
                <div className="space-y-6">
                  <Card className={cn(shellGlass, "overflow-hidden")}>
                    <CardHeader>
                      <CardTitle className="font-heading text-xl text-white">
                        My orders
                      </CardTitle>
                      <CardDescription className="text-zinc-500">
                        Track pending and completed purchases. Proxies appear in My
                        proxies once an operator fulfills your order.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 sm:px-6">
                      {initialData.orders.length === 0 ? (
                        <LottieEmptyState
                          title="No orders yet"
                          description="Purchase your first proxy package and track fulfillment here."
                          className="pb-6"
                        />
                      ) : (
                        <ScrollArea className="max-h-[520px]">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-white/[0.06] hover:bg-transparent">
                                <TableHead className="text-zinc-400">Date</TableHead>
                                <TableHead className="text-zinc-400">Order</TableHead>
                                <TableHead className="text-zinc-400">Product</TableHead>
                                <TableHead className="text-zinc-400">Qty</TableHead>
                                <TableHead className="text-zinc-400">Total</TableHead>
                                <TableHead className="text-right text-zinc-400">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {initialData.orders.map((order) => {
                                const product = getProduct(order.proxy_type);
                                return (
                                  <TableRow
                                    key={order.id}
                                    className="border-white/[0.06] hover:bg-white/[0.02]"
                                  >
                                    <TableCell className="font-mono text-xs text-zinc-400">
                                      {formatDate(order.created_at)}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-zinc-300">
                                      {shortOrderId(order.id)}
                                    </TableCell>
                                    <TableCell className="text-sm text-zinc-200">
                                      <span>{formatProductTypeLabel(order.proxy_type)}</span>
                                      <OrderExtrasText
                                        proxyType={order.proxy_type}
                                        tierId={order.tier_id}
                                        addonIds={order.addon_ids}
                                      />
                                    </TableCell>
                                    <TableCell className="text-sm text-zinc-300">
                                      {product
                                        ? formatProductQuantityLabel(
                                            product,
                                            order.quantity
                                          )
                                        : order.quantity}
                                    </TableCell>
                                    <TableCell className="font-medium text-emerald-200/90">
                                      {formatCurrency(order.total_price)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <OrderStatusBadge status={order.status} />
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
                              <Check className="size-4.5 text-emerald-400" />
                            ) : (
                              <Copy className="size-4.5" />
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
                            <DownloadSimple className="size-4.5" />
                            Download .txt
                          </Button>
                        </motion.div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6 sm:pt-0">
                      {activeProxies === 0 ? (
                        <div className="px-6 py-6">
                          <LottieEmptyState
                            title="No active proxies found"
                            description="Deposit crypto and place an order. Operators deliver lines here after fulfillment."
                            size={140}
                          />
                          <div className="flex justify-center pb-8">
                            <Button
                              className="gap-2 bg-gradient-to-r from-emerald-400 to-cyan-400 text-black hover:from-emerald-300 hover:to-cyan-300"
                              size="sm"
                              onClick={() => goView("funds")}
                            >
                              <LordIcon name="wallet" size={22} trigger="hover" />
                              Add funds &amp; order
                            </Button>
                          </div>
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
                                            <Check className="size-4.5 text-emerald-400" />
                                          ) : (
                                            <Copy className="size-4.5" />
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

                </div>
              )}

              {view === "funds" && (
                <motion.div
                  initial={fadeInUp.initial}
                  animate={fadeInUp.animate}
                  transition={defaultTransition}
                  className="mx-auto max-w-2xl space-y-6"
                >
                  <Card
                    className={cn(
                      shellGlass,
                      "overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.08] via-zinc-950/40 to-cyan-500/[0.06] shadow-[0_0_48px_-12px_rgba(16,185,129,0.22)]"
                    )}
                  >
                    <CardHeader>
                      <CardTitle className="font-heading flex items-center gap-2 text-xl">
                        <Lightning className="size-6 text-emerald-400" />
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
                                <IconSpinner className="size-5" />
                                Opening checkout…
                              </>
                            ) : (
                              <>
                                <Lightning className="size-5" />
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

                  <Card className={cn(shellGlass)}>
                    <CardHeader>
                      <CardTitle className="font-heading text-lg">
                        Deposit history
                      </CardTitle>
                      <CardDescription className="text-zinc-500">
                        Your crypto top-ups and their approval status.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 sm:px-6">
                      {initialData.deposits.length === 0 ? (
                        <p className="px-6 pb-6 text-center text-sm text-zinc-500">
                          No deposits yet. Add funds above to get started.
                        </p>
                      ) : (
                        <ScrollArea className="max-h-[320px]">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-white/[0.06] hover:bg-transparent">
                                <TableHead className="text-zinc-400">Date</TableHead>
                                <TableHead className="text-zinc-400">Amount</TableHead>
                                <TableHead className="text-zinc-400">TXID</TableHead>
                                <TableHead className="text-right text-zinc-400">
                                  Status
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {initialData.deposits.map((deposit) => (
                                <TableRow
                                  key={deposit.id}
                                  className="border-white/[0.06] hover:bg-white/[0.02]"
                                >
                                  <TableCell className="font-mono text-xs text-zinc-400">
                                    {formatDate(deposit.created_at)}
                                  </TableCell>
                                  <TableCell className="font-medium text-emerald-200/90">
                                    {formatCurrency(deposit.amount)}
                                  </TableCell>
                                  <TableCell className="max-w-[140px] truncate font-mono text-xs text-zinc-500 sm:max-w-[200px]">
                                    {deposit.txid}
                                  </TableCell>
                                  <TableCell className="text-right text-sm capitalize text-zinc-300">
                                    {deposit.status}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      )}
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
                          Share this link so signups are attributed to your account when
                          the affiliate program is enabled.
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
                            <Check className="size-5" />
                          ) : (
                            <Copy className="size-5" />
                          )}
                          {copiedButtonId === "referral-link"
                            ? "Copied!"
                            : "Copy link"}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div variants={bentoItem}>
                    <Card className={cn(shellGlass)}>
                      <CardHeader>
                        <CardTitle className="font-heading text-lg text-white">
                          Performance & payouts
                        </CardTitle>
                        <CardDescription className="text-zinc-500">
                          Click tracking, commissions, and crypto payouts will appear here
                          once the affiliate program is live. Your referral link above is
                          ready to share.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="rounded-xl border border-dashed border-white/10 bg-black/30 px-4 py-10 text-center text-sm text-zinc-500">
                          No referral activity recorded yet.
                        </p>
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
                        <BracketsCurly className="size-5 text-cyan-400" />
                        API credentials
                      </CardTitle>
                      <CardDescription className="text-zinc-500">
                        Programmatic API keys are not available yet. Export your proxy
                        list from My proxies, or use the examples below once keys are
                        issued.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        type="button"
                        variant="outline"
                        className="border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/10"
                        onClick={() => goView("proxies")}
                      >
                        Go to My proxies
                      </Button>
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
          </div>
        </main>
      </div>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  if (normalized === "completed") {
    return (
      <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
        Completed
      </Badge>
    );
  }
  if (normalized === "cancelled") {
    return (
      <Badge className="border-red-500/30 bg-red-500/10 text-red-300">
        Cancelled
      </Badge>
    );
  }
  return (
    <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-200">
      Pending
    </Badge>
  );
}


export function DashboardClient(props: DashboardClientProps) {
  return (
    <Suspense fallback={<SearchParamsSuspenseFallback />}>
      <DashboardClientInner {...props} />
    </Suspense>
  );
}
