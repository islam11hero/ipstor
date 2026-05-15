"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Check,
  Copy,
  Download,
  Globe,
  HardDrive,
  Loader2,
  QrCode,
  Server,
  Shield,
  ShoppingCart,
  Wallet,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";

import { placeOrder, submitDepositRequest } from "@/app/dashboard/actions";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { isAdminEmail } from "@/lib/admin";
import {
  calculateOrderTotal,
  DATACENTER_PRICE_PER_IP,
  RESIDENTIAL_PRICE_PER_GB,
  USDT_TRC20_ADDRESS,
  type ProxyProduct,
} from "@/lib/pricing";
import { formatProxyLine, formatProxyList } from "@/lib/proxy-format";
import type { DashboardData } from "@/lib/types/dashboard";
import {
  defaultTransition,
  fadeInUp,
  glassCard,
  glowTitle,
  hoverLift,
  tapScale,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

type DashboardClientProps = {
  initialData: DashboardData;
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

export function DashboardClient({ initialData }: DashboardClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [balance, setBalance] = useState(initialData.balance);
  const [activeTab, setActiveTab] = useState("overview");
  const [proxyType, setProxyType] = useState<ProxyProduct>("datacenter");
  const [quantity, setQuantity] = useState("10");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositTxid, setDepositTxid] = useState("");

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

  function handleDepositSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await submitDepositRequest({
        amount: Number(depositAmount),
        txid: depositTxid,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(
        "Deposit request submitted. Balance updates after admin approval."
      );
      setDepositAmount("");
      setDepositTxid("");
      refresh();
    });
  }

  function handleCopyAllProxies() {
    if (initialData.proxies.length === 0) {
      toast.error("No proxies to copy yet.");
      return;
    }
    void copyText(formatProxyList(initialData.proxies), "Proxy list");
  }

  function handleExportProxies() {
    if (initialData.proxies.length === 0) {
      toast.error("No proxies to export yet.");
      return;
    }
    const blob = new Blob([formatProxyList(initialData.proxies)], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `proxynova-proxies-${Date.now()}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Proxies exported as .txt");
  }

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.08),transparent)]" />
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <motion.header
        className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/70 backdrop-blur-md"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-500 shadow-lg shadow-cyan-500/20">
              <Globe className="size-4 text-black" />
            </div>
            <div>
              <span className="font-heading text-base font-semibold tracking-tight">
                🌐 Proxy<span className={glowTitle}>Nova</span>
              </span>
              <p className="text-[10px] text-zinc-500">🛡️ Enterprise Proxy Network</p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 sm:flex">
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
                  Admin 🛡️
                </Button>
              </motion.div>
            )}
            <motion.div {...hoverLift} {...tapScale}>
              <Button
                variant="outline"
                size="sm"
                className={cn("border-white/15 text-zinc-200", glassCard)}
                render={<Link href="/" />}
              >
                Home
              </Button>
            </motion.div>
          </div>
        </nav>
      </motion.header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              🚀 Control <span className={glowTitle}>Center</span>
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              {initialData.email}
              {!isAdminEmail(initialData.email) ? "" : " · 🛡️ Administrator"}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 sm:hidden">
            <Wallet className="size-4 text-emerald-400" />
            <span className="font-medium">{formatCurrency(balance)}</span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList
            className={cn(
              "h-auto w-full flex-wrap justify-start gap-1 p-1",
              glassCard,
              "bg-zinc-900/60"
            )}
          >
            <TabsTrigger value="overview" className="gap-1.5 data-active:bg-zinc-800/80">
              <Activity className="size-3.5" />
              Overview ⚡
            </TabsTrigger>
            <TabsTrigger value="buy" className="gap-1.5 data-active:bg-zinc-800/80">
              <ShoppingCart className="size-3.5" />
              Buy Proxies 🛒
            </TabsTrigger>
            <TabsTrigger value="proxies" className="gap-1.5 data-active:bg-zinc-800/80">
              <HardDrive className="size-3.5" />
              My Proxies 🌐
            </TabsTrigger>
            <TabsTrigger value="funds" className="gap-1.5 data-active:bg-zinc-800/80">
              <Wallet className="size-3.5" />
              Add Funds 💳
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StaggerItem>
                <MetricCard
                  icon={Wallet}
                  emoji="💎"
                  label="Current Balance"
                  value={formatCurrency(balance)}
                  accent="emerald"
                />
              </StaggerItem>
              <StaggerItem>
                <MetricCard
                  icon={Server}
                  emoji="🌐"
                  label="Active Proxies"
                  value={String(activeProxies)}
                  accent="cyan"
                />
              </StaggerItem>
              <StaggerItem>
                <MetricCard
                  icon={Wifi}
                  emoji="⚡"
                  label="Network Status"
                  value={
                    <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                      <span className="mr-1.5 size-1.5 rounded-full bg-emerald-400" />
                      Online
                    </Badge>
                  }
                  accent="emerald"
                />
              </StaggerItem>
            </Stagger>

            <motion.div
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              transition={{ ...defaultTransition, delay: 0.2 }}
            >
            <Card className={cn(glassCard, "bg-zinc-900/40")}>
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2 text-lg">
                  <Shield className="size-5 text-cyan-400" />
                  🛡️ Quick Setup Guide
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Use this format in your scrapers, bots, and automation tools.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4 font-mono text-sm text-cyan-100">
                  IP:Port:Username:Password
                </div>
                <ul className="grid gap-2 text-sm text-zinc-400 sm:grid-cols-2">
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                    HTTP & SOCKS5 compatible endpoints
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                    Copy single lines or export the full list
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                    Orders appear here after admin fulfillment
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                    Top up via USDT TRC20 in Add Funds
                  </li>
                </ul>
              </CardContent>
            </Card>
            </motion.div>

            {initialData.deposits.length > 0 && (
              <Card className={cn(glassCard, "bg-zinc-900/40")}>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Deposits</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[180px]">
                    <div className="space-y-2 pr-4">
                      {initialData.deposits.slice(0, 5).map((deposit) => (
                        <div
                          key={deposit.id}
                          className="flex items-center justify-between rounded-lg border border-white/5 bg-zinc-950/50 px-3 py-2 text-sm"
                        >
                          <span>{formatCurrency(deposit.amount)}</span>
                          <Badge
                            variant="outline"
                            className={cn(
                              deposit.status === "approved"
                                ? "border-emerald-500/30 text-emerald-400"
                                : "border-amber-500/30 text-amber-400"
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
          </TabsContent>

          <TabsContent value="buy" className="space-y-6">
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
              <Card className="border-white/10 bg-zinc-900/50">
                <CardHeader>
                  <CardTitle>Order calculator</CardTitle>
                  <CardDescription className="text-zinc-400">
                    {proxyType === "datacenter"
                      ? "Enter the number of IPs you need."
                      : "Enter the bandwidth in gigabytes (GB)."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">
                      {proxyType === "datacenter" ? "Quantity (IPs)" : "Quantity (GB)"}
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      min={1}
                      step={proxyType === "datacenter" ? 1 : 0.1}
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="border-white/10 bg-zinc-950"
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
                        Place order 🛒
                      </>
                    )}
                  </Button>
                  </motion.div>
                </CardContent>
              </Card>

              <motion.div {...hoverLift}>
              <Card className="border border-cyan-500/30 bg-gradient-to-br from-cyan-500/15 via-white/5 to-emerald-500/5 shadow-[0_0_40px_-12px_rgba(34,211,238,0.25)] backdrop-blur-md">
                <CardHeader>
                  <CardTitle>Order summary</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Live pricing — no hidden fees
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Product</span>
                      <span className="capitalize font-medium">{proxyType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Quantity</span>
                      <span className="font-medium">{parsedQuantity || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Unit price</span>
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
          </TabsContent>

          <TabsContent value="proxies">
            <Card className={cn(glassCard, "bg-zinc-900/40")}>
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg">My Proxies</CardTitle>
                  <CardDescription className="text-zinc-400">
                    {activeProxies} active endpoint{activeProxies === 1 ? "" : "s"}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <motion.div {...hoverLift} {...tapScale}>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn("border-white/15 bg-zinc-950/80", glassCard)}
                    onClick={handleCopyAllProxies}
                    disabled={activeProxies === 0}
                  >
                    <Copy className="size-3.5" />
                    Copy All List
                  </Button>
                  </motion.div>
                  <motion.div {...hoverLift} {...tapScale}>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-black"
                    onClick={handleExportProxies}
                    disabled={activeProxies === 0}
                  >
                    <Download className="size-3.5" />
                    Export as .TXT
                  </Button>
                  </motion.div>
                </div>
              </CardHeader>
              <CardContent>
                {activeProxies === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-16 text-center">
                    <HardDrive className="mb-3 size-10 text-zinc-600" />
                    <p className="font-medium text-zinc-300">No proxies yet</p>
                    <p className="mt-1 max-w-sm text-sm text-zinc-500">
                      Purchase proxies in the Buy tab. They appear here after our
                      team fulfills your order.
                    </p>
                    <Button
                      className="mt-4 bg-cyan-500 text-black hover:bg-cyan-400"
                      size="sm"
                      onClick={() => setActiveTab("buy")}
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
                          <TableHead>Proxy Details</TableHead>
                          <TableHead>Created At</TableHead>
                          <TableHead className="w-12" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {initialData.proxies.map((proxy) => {
                          const line = formatProxyLine(proxy);
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
                                <code className="rounded bg-zinc-950 px-2 py-1 font-mono text-xs text-cyan-100">
                                  {line}
                                </code>
                              </TableCell>
                              <TableCell className="text-zinc-400">
                                {formatDate(proxy.created_at)}
                              </TableCell>
                              <TableCell>
                                <Tooltip>
                                  <TooltipTrigger
                                    render={
                                      <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        className="text-zinc-400 hover:text-cyan-300"
                                        onClick={() =>
                                          void copyText(line, "Proxy")
                                        }
                                      />
                                    }
                                  >
                                    <Copy className="size-3.5" />
                                  </TooltipTrigger>
                                  <TooltipContent>Copy proxy</TooltipContent>
                                </Tooltip>
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
          </TabsContent>

          <TabsContent value="funds">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-white/10 bg-zinc-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="size-5 text-cyan-400" />
                    Crypto checkout
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    Send USDT (TRC20) to the address below, then submit your TXID.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center rounded-xl border border-white/10 bg-zinc-950/80 p-8">
                    <div className="flex size-40 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/5">
                      <QrCode className="size-24 text-cyan-400/60" strokeWidth={1} />
                    </div>
                    <p className="mt-4 text-xs font-medium tracking-wider text-zinc-500 uppercase">
                      USDT · TRC20
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Deposit address</Label>
                    <div className="flex gap-2">
                      <div className="flex-1 rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-3 py-2.5 font-mono text-xs break-all text-cyan-100">
                        {USDT_TRC20_ADDRESS}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 border-white/10"
                        onClick={() =>
                          void copyText(USDT_TRC20_ADDRESS, "Address")
                        }
                      >
                        <Copy className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-zinc-900/50">
                <CardHeader>
                  <CardTitle>Submit deposit</CardTitle>
                  <CardDescription className="text-zinc-400">
                    We manually verify crypto payments and credit your balance.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleDepositSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="deposit-amount">Amount (USD)</Label>
                      <Input
                        id="deposit-amount"
                        type="number"
                        min={1}
                        step={0.01}
                        placeholder="100.00"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        required
                        className="border-white/10 bg-zinc-950"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deposit-txid">Transaction ID (TXID)</Label>
                      <Input
                        id="deposit-txid"
                        placeholder="Paste your blockchain TXID"
                        value={depositTxid}
                        onChange={(e) => setDepositTxid(e.target.value)}
                        required
                        className="border-white/10 bg-zinc-950 font-mono text-sm"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-emerald-500 text-black hover:bg-emerald-400"
                      disabled={isPending}
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="animate-spin" />
                          Submitting…
                        </>
                      ) : (
                        "Submit deposit request"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  emoji,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  emoji: string;
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
        glassCard,
        "bg-gradient-to-br to-zinc-900/40 ring-1 backdrop-blur-md",
        accentClass.split(" ").slice(0, 2).join(" ")
      )}
    >
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-xs font-medium tracking-wider text-zinc-500 uppercase">
            {emoji} {label}
          </p>
          <motion.div className="mt-2 font-heading text-2xl font-bold tracking-tight">
            {value}
          </motion.div>
        </div>
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-lg ring-1",
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
        "w-full rounded-xl border p-5 text-left backdrop-blur-md transition-all",
        selected
          ? "border-cyan-500/50 bg-gradient-to-br from-cyan-500/15 to-zinc-900/80 shadow-[0_0_40px_-8px_rgba(34,211,238,0.4)] ring-1 ring-cyan-500/30"
          : cn(glassCard, "bg-zinc-900/40 hover:border-emerald-500/20")
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
