"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState, useTransition } from "react";
import {
  Activity,
  Braces,
  Check,
  Copy,
  Download,
  Eye,
  EyeOff,
  Globe,
  HardDrive,
  LayoutDashboard,
  Loader2,
  Server,
  Shield,
  ShoppingCart,
  Wallet,
  Wifi,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { placeOrder } from "@/app/dashboard/actions";
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
  | "developer";

const shellGlass =
  "rounded-2xl border border-white/[0.05] bg-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl";

const BANDWIDTH_DEMO = [
  { day: "Mon", gb: 42 },
  { day: "Tue", gb: 58 },
  { day: "Wed", gb: 51 },
  { day: "Thu", gb: 74 },
  { day: "Fri", gb: 69 },
  { day: "Sat", gb: 88 },
  { day: "Sun", gb: 76 },
];

const MOCK_API_KEY = "pn_live_sk_7x9K2mP4vQ8wZ1nL5bH3cF6jD0sA2eR8uY1";

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

async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  } catch {
    toast.error("Failed to copy. Please copy manually.");
  }
}

function pingMsForProxy(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i) * (i + 1)) % 97;
  return 18 + (h % 45);
}

function proxiesToJson(proxies: UserProxy[]): string {
  return JSON.stringify(
    proxies.map((p) => ({
      ip: p.ip_address,
      port: p.port,
      username: p.username,
      password: p.password,
    })),
    null,
    2
  );
}

function proxiesToCsv(proxies: UserProxy[]): string {
  const header = "ip,port,username,password";
  const rows = proxies.map(
    (p) =>
      `${p.ip_address},${p.port},${escapeCsv(p.username)},${escapeCsv(p.password)}`
  );
  return [header, ...rows].join("\n");
}

function escapeCsv(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
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

const NAV: {
  id: DashboardView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "proxies", label: "My Proxies", icon: HardDrive },
  { id: "buy", label: "Buy Proxies", icon: ShoppingCart },
  { id: "funds", label: "Add Funds", icon: Wallet },
  { id: "developer", label: "Developer API", icon: Braces },
];

export function DashboardClient({ initialData }: DashboardClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [balance, setBalance] = useState(initialData.balance);
  const [view, setView] = useState<DashboardView>("overview");
  const [proxyType, setProxyType] = useState<ProxyProduct>("datacenter");
  const [quantity, setQuantity] = useState("10");
  const [depositAmount, setDepositAmount] = useState("");
  const [cryptoPayLoading, setCryptoPayLoading] = useState(false);
  const [whitelistDraft, setWhitelistDraft] = useState(
    "203.0.113.0/24, 198.51.100.10"
  );
  const [apiKeyRevealed, setApiKeyRevealed] = useState(false);

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
    void copyText(formatProxyList(initialData.proxies), "Proxy list");
  }

  function handleExportTxt() {
    if (initialData.proxies.length === 0) {
      toast.error("No proxies to export yet.");
      return;
    }
    downloadBlob(
      `proxynova-proxies-${Date.now()}.txt`,
      formatProxyList(initialData.proxies),
      "text/plain"
    );
    toast.success("Downloaded .TXT");
  }

  function handleExportJson() {
    if (initialData.proxies.length === 0) {
      toast.error("No proxies to export yet.");
      return;
    }
    downloadBlob(
      `proxynova-proxies-${Date.now()}.json`,
      proxiesToJson(initialData.proxies),
      "application/json"
    );
    toast.success("Downloaded .JSON");
  }

  function handleExportCsv() {
    if (initialData.proxies.length === 0) {
      toast.error("No proxies to export yet.");
      return;
    }
    downloadBlob(
      `proxynova-proxies-${Date.now()}.csv`,
      proxiesToCsv(initialData.proxies),
      "text/csv"
    );
    toast.success("Downloaded .CSV");
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
          <Link href="/" className="flex items-center gap-2.5">
            <Globe className="h-6 w-6 shrink-0 text-emerald-500" aria-hidden />
            <div>
              <span className="font-heading text-base font-semibold tracking-tight text-white">
                ProxyNova
              </span>
              <p className="text-[10px] text-zinc-500">Enterprise proxy network</p>
            </div>
          </Link>

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
            {initialData.isAdmin && (
              <motion.div {...hoverLift} {...tapScale}>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-black"
                  render={<Link href="/admin" />}
                >
                  Admin
                </Button>
              </motion.div>
            )}
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

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1600px] flex-col lg:flex-row">
        <aside
          className={cn(
            "flex shrink-0 gap-1 overflow-x-auto border-b border-white/[0.06] p-3 lg:w-60 lg:flex-col lg:border-b-0 lg:border-r lg:border-white/[0.06] lg:bg-[#050505]/40 lg:p-4 xl:w-64"
          )}
        >
          <p className="mb-3 hidden px-2 text-[10px] font-semibold tracking-[0.2em] text-zinc-500 uppercase lg:block">
            Workspace
          </p>
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setView(item.id)}
                className={cn(
                  "flex min-w-[9.5rem] shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors lg:min-w-0",
                  active
                    ? "bg-white/[0.06] text-white ring-1 ring-emerald-500/25"
                    : "text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200"
                )}
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0",
                    active ? "text-emerald-400" : "text-zinc-500"
                  )}
                />
                {item.label}
              </button>
            );
          })}
        </aside>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:py-8">
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
                  className="space-y-6"
                  variants={bentoContainer}
                  initial="hidden"
                  animate="show"
                >
                  <motion.div
                    variants={bentoItem}
                    className="grid gap-4 sm:grid-cols-3"
                  >
                    <MetricCard
                      icon={Server}
                      label="Active Proxies"
                      value={String(activeProxies)}
                      accent="cyan"
                    />
                    <MetricCard
                      icon={Wallet}
                      label="Total Balance"
                      value={formatCurrency(balance)}
                      accent="emerald"
                    />
                    <MetricCard
                      icon={Activity}
                      label="Network Uptime"
                      value={
                        <span className="flex items-center gap-2">
                          <span className="relative flex size-2">
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/40" />
                            <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
                          </span>
                          99.98%
                        </span>
                      }
                      accent="emerald"
                    />
                  </motion.div>

                  <motion.div variants={bentoItem} className="grid gap-4 lg:grid-cols-12">
                    <div className="lg:col-span-8">
                      <Card className={cn(shellGlass, "h-full min-h-[300px]")}>
                        <CardHeader className="pb-2">
                          <CardTitle className="font-heading flex items-center gap-2 text-lg">
                            <Wifi className="size-5 text-emerald-400" />
                            Bandwidth usage
                          </CardTitle>
                          <CardDescription className="text-zinc-500">
                            Last 7 days (illustrative aggregate, TB-scale normalized
                            to GB for display)
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[280px] pt-0">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={BANDWIDTH_DEMO}
                              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                            >
                              <defs>
                                <linearGradient
                                  id="bandwidthFill"
                                  x1="0"
                                  y1="0"
                                  x2="0"
                                  y2="1"
                                >
                                  <stop
                                    offset="0%"
                                    stopColor="#34d399"
                                    stopOpacity={0.45}
                                  />
                                  <stop
                                    offset="100%"
                                    stopColor="#34d399"
                                    stopOpacity={0}
                                  />
                                </linearGradient>
                                <linearGradient
                                  id="bandwidthStroke"
                                  x1="0"
                                  y1="0"
                                  x2="1"
                                  y2="0"
                                >
                                  <stop offset="0%" stopColor="#6ee7b7" />
                                  <stop offset="100%" stopColor="#10b981" />
                                </linearGradient>
                              </defs>
                              <CartesianGrid
                                strokeDasharray="4 8"
                                stroke="rgba(255,255,255,0.06)"
                                vertical={false}
                              />
                              <XAxis
                                dataKey="day"
                                tick={{ fill: "#71717a", fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                              />
                              <YAxis
                                tick={{ fill: "#71717a", fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                                width={36}
                              />
                              <Tooltip
                                contentStyle={{
                                  background: "rgba(9,9,11,0.92)",
                                  border: "1px solid rgba(255,255,255,0.08)",
                                  borderRadius: 12,
                                  fontSize: 12,
                                }}
                                labelStyle={{ color: "#a1a1aa" }}
                                formatter={(v) => [`${Number(v)} GB`, "Usage"]}
                              />
                              <Area
                                type="monotone"
                                dataKey="gb"
                                stroke="url(#bandwidthStroke)"
                                strokeWidth={2}
                                fill="url(#bandwidthFill)"
                                dot={false}
                                activeDot={{
                                  r: 4,
                                  fill: "#34d399",
                                  stroke: "#022c22",
                                  strokeWidth: 2,
                                }}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="flex flex-col gap-4 lg:col-span-4">
                      <Card className={cn(shellGlass, "flex-1")}>
                        <CardHeader className="pb-2">
                          <CardTitle className="font-heading flex items-center gap-2 text-base">
                            <Shield className="size-4 text-cyan-400" />
                            Quick setup
                          </CardTitle>
                          <CardDescription className="text-xs text-zinc-500">
                            Standard auth string for your stack.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/[0.06] p-3 font-mono text-xs text-cyan-100">
                            IP:Port:Username:Password
                          </div>
                          <ul className="space-y-2 text-xs text-zinc-400">
                            <li className="flex gap-2">
                              <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-400" />
                              HTTP and SOCKS5 compatible endpoints
                            </li>
                            <li className="flex gap-2">
                              <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-400" />
                              Export hub for bulk automation
                            </li>
                          </ul>
                        </CardContent>
                      </Card>

                      {initialData.deposits.length > 0 && (
                        <Card className={cn(shellGlass)}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Recent deposits</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ScrollArea className="h-[140px]">
                              <div className="space-y-2 pr-3">
                                {initialData.deposits.slice(0, 5).map((deposit) => (
                                  <div
                                    key={deposit.id}
                                    className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-black/30 px-3 py-2 text-xs"
                                  >
                                    <span>{formatCurrency(deposit.amount)}</span>
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        deposit.status === "approved"
                                          ? "border-emerald-500/35 text-emerald-400"
                                          : "border-amber-500/35 text-amber-400"
                                      )}
                                    >
                                      {deposit.status}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </motion.div>
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

                  <Card className={cn(shellGlass)}>
                    <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <CardTitle className="text-lg">My Proxies</CardTitle>
                        <CardDescription className="text-zinc-500">
                          {activeProxies} active endpoint{activeProxies === 1 ? "" : "s"}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-3">
                        <p className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
                          Export hub
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <motion.div {...hoverLift} {...tapScale}>
                            <Button
                              variant="outline"
                              size="sm"
                              className={cn("border-white/12", shellGlass)}
                              onClick={handleCopyAllProxies}
                              disabled={activeProxies === 0}
                            >
                              <Copy className="size-3.5" />
                              Copy all
                            </Button>
                          </motion.div>
                          <motion.div {...hoverLift} {...tapScale}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-white/12"
                              onClick={handleExportTxt}
                              disabled={activeProxies === 0}
                            >
                              <Download className="size-3.5" />
                              .TXT
                            </Button>
                          </motion.div>
                          <motion.div {...hoverLift} {...tapScale}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-white/12"
                              onClick={handleExportJson}
                              disabled={activeProxies === 0}
                            >
                              <Download className="size-3.5" />
                              .JSON
                            </Button>
                          </motion.div>
                          <motion.div {...hoverLift} {...tapScale}>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-black"
                              onClick={handleExportCsv}
                              disabled={activeProxies === 0}
                            >
                              <Download className="size-3.5" />
                              .CSV
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {activeProxies === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-16 text-center">
                          <HardDrive className="mb-3 size-10 text-zinc-600" />
                          <p className="font-medium text-zinc-300">No proxies yet</p>
                          <p className="mt-1 max-w-sm text-sm text-zinc-500">
                            Purchase proxies in Buy Proxies. They appear here after our
                            team fulfills your order.
                          </p>
                          <Button
                            className="mt-4 bg-cyan-500 text-black hover:bg-cyan-400"
                            size="sm"
                            onClick={() => setView("buy")}
                          >
                            Buy Proxies
                          </Button>
                        </div>
                      ) : (
                        <ScrollArea className="w-full">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-white/10 hover:bg-transparent">
                                <TableHead>Status</TableHead>
                                <TableHead>Ping</TableHead>
                                <TableHead>Proxy details</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="w-12" />
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {initialData.proxies.map((proxy) => {
                                const line = formatProxyLine(proxy);
                                const ms = pingMsForProxy(proxy.id);
                                return (
                                  <TableRow
                                    key={proxy.id}
                                    className="border-white/5 hover:bg-white/[0.02]"
                                  >
                                    <TableCell>
                                      <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                                        Active
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <span className="inline-flex items-center gap-2 tabular-nums text-sm text-zinc-300">
                                        <span
                                          className="size-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                                          aria-hidden
                                        />
                                        {ms}ms
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      <code className="rounded-md border border-white/[0.06] bg-zinc-950/80 px-2 py-1 font-mono text-xs text-cyan-100">
                                        {line}
                                      </code>
                                    </TableCell>
                                    <TableCell className="text-zinc-400">
                                      {formatDate(proxy.created_at)}
                                    </TableCell>
                                    <TableCell>
                                      <UiTooltip>
                                        <TooltipTrigger
                                          render={
                                            <Button
                                              variant="ghost"
                                              size="icon-sm"
                                              className="text-zinc-400 hover:text-cyan-300"
                                              onClick={() => void copyText(line, "Proxy")}
                                            />
                                          }
                                        >
                                          <Copy className="size-3.5" />
                                        </TooltipTrigger>
                                        <TooltipContent>Copy proxy</TooltipContent>
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
                            onClick={() => void copyText(MOCK_API_KEY, "API key")}
                          >
                            <Copy className="size-3.5" />
                            Copy
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
                        <pre className="max-h-[220px] overflow-auto rounded-lg border border-white/[0.06] bg-black/50 p-3 text-[11px] leading-relaxed text-zinc-300">
                          {`curl -sS https://api.proxynova.io/v1/proxies \\
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
                        <pre className="max-h-[220px] overflow-auto rounded-lg border border-white/[0.06] bg-black/50 p-3 text-[11px] leading-relaxed text-zinc-300">
                          {`import requests

r = requests.get(
    "https://api.proxynova.io/v1/proxies",
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

function MetricCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  accent: "cyan" | "emerald";
}) {
  const accentClass =
    accent === "cyan"
      ? "from-cyan-500/10 ring-cyan-500/20 text-cyan-400"
      : "from-emerald-500/10 ring-emerald-500/20 text-emerald-400";

  return (
    <motion.div {...hoverLift}>
      <Card
        className={cn(
          shellGlass,
          "h-full bg-gradient-to-br to-zinc-950/30 ring-1 ring-inset",
          accentClass.split(" ").slice(0, 2).join(" ")
        )}
      >
        <CardContent className="flex items-start justify-between p-5">
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-wider text-zinc-500 uppercase">
              {label}
            </p>
            <div className="mt-2 font-heading text-2xl font-bold tracking-tight">
              {value}
            </div>
          </div>
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg ring-1",
              accentClass
            )}
          >
            <Icon className="size-5" />
          </div>
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
