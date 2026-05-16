"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Suspense, useCallback, useMemo, useState, useTransition } from "react";
import {
  Banknote,
  ClipboardList,
  LayoutDashboard,
  Loader2,
  Mail,
  MoreHorizontal,
  Rocket,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

import { approveDeposit, fulfillOrder } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SearchParamsSuspenseFallback } from "@/components/search-params-suspense-fallback";
import { hoverLift, tapScale } from "@/lib/motion";
import type { PendingDeposit, PendingOrder } from "@/lib/types/admin";
import { cn } from "@/lib/utils";

type RecentDepositTableRow = {
  key: string;
  user: string;
  amount: number;
  txHash: string;
  status: string;
};

const shellGlass =
  "rounded-2xl border border-white/[0.05] bg-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl";

type AdminView = "dashboard" | "orders" | "deposits";

const ADMIN_VIEW_PARAM = "view";

const ADMIN_VIEW_ALIASES: Record<string, AdminView> = {
  dashboard: "dashboard",
  orders: "orders",
  deposits: "deposits",
  "pending-orders": "orders",
  "pending-deposits": "deposits",
};

function parseAdminViewParam(raw: string | null): AdminView {
  if (!raw) return "dashboard";
  const key = raw.trim().toLowerCase();
  return ADMIN_VIEW_ALIASES[key] ?? "dashboard";
}

type AdminPanelProps = {
  deposits: PendingDeposit[];
  orders: PendingOrder[];
  activeUserCount: number;
};

const DEMO_TOTAL_REVENUE_USD = 248_900;

const MOCK_RECENT_DEPOSITS: {
  user: string;
  amount: number;
  txHash: string;
  status: string;
}[] = [
  {
    user: "ops@meridian.io",
    amount: 2500,
    txHash: "0x7f3a…c91e (USDT-TRC20)",
    status: "Confirmed",
  },
  {
    user: "growth@northbeam.digital",
    amount: 890,
    txHash: "bc1q…9f2a (BTC)",
    status: "Confirming (2/6)",
  },
  {
    user: "security@signalfoundry.co",
    amount: 420,
    txHash: "0x9d2e…41ab (USDT-ERC20)",
    status: "Confirmed",
  },
  {
    user: "data@acme.example",
    amount: 120,
    txHash: "LTC…m8q3",
    status: "Confirmed",
  },
  {
    user: "finance@ipnova.partner",
    amount: 5000,
    txHash: "0x4b1c…e902 (USDT-TRC20)",
    status: "Manual review",
  },
];

const viewMotion = {
  initial: { opacity: 0, x: 14 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
  transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
};

const bentoContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.055, delayChildren: 0.04 },
  },
};

const bentoItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28 } },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function shortId(id: string) {
  return `${id.slice(0, 8)}…`;
}

async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  } catch {
    toast.error("Copy failed");
  }
}

function StatusBadge({
  tone,
  children,
}: {
  tone: "success" | "warn" | "danger";
  children: React.ReactNode;
}) {
  const cls =
    tone === "success"
      ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-300"
      : tone === "warn"
        ? "border-amber-500/35 bg-amber-500/10 text-amber-200"
        : "border-red-500/35 bg-red-500/10 text-red-300";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        cls
      )}
    >
      {children}
    </span>
  );
}

const SIDEBAR: { id: AdminView; label: string; badge?: number }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "orders", label: "Pending Orders" },
  { id: "deposits", label: "Deposits" },
];

function AdminPanelInner({
  deposits,
  orders,
  activeUserCount,
}: AdminPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const view = useMemo(
    () => parseAdminViewParam(searchParams.get(ADMIN_VIEW_PARAM)),
    [searchParams]
  );

  const navigateView = useCallback(
    (next: AdminView) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(ADMIN_VIEW_PARAM, next);
      router.push(`/admin?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );
  const [fulfillOrderId, setFulfillOrderId] = useState<string | null>(null);
  const [ipAddress, setIpAddress] = useState("");
  const [port, setPort] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [provisionEmail, setProvisionEmail] = useState("");
  const [provisionPaste, setProvisionPaste] = useState("");
  const [provisionType, setProvisionType] = useState<
    "datacenter" | "residential" | "mobile"
  >("datacenter");

  const recentDepositRows = useMemo<RecentDepositTableRow[]>(() => {
    const fromDb = deposits.map((d) => ({
      key: d.id,
      user: d.user_email ?? shortId(d.user_id),
      amount: d.amount,
      txHash: d.txid,
      status: "Pending review",
    }));
    const demo = MOCK_RECENT_DEPOSITS.map((r, i) => ({
      key: `mock-${i}`,
      user: r.user,
      amount: r.amount,
      txHash: r.txHash,
      status: r.status,
    }));
    return [...fromDb, ...demo].slice(0, 8);
  }, [deposits]);

  function handleDeployProvision(e: React.FormEvent) {
    e.preventDefault();
    toast.success(
      "Provision staged — wholesale lines queued for manual sync to the user workspace."
    );
    setProvisionPaste("");
  }

  function refresh() {
    router.refresh();
  }

  function handleApprove(depositId: string) {
    startTransition(async () => {
      const result = await approveDeposit(depositId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Deposit approved and balance updated.");
      refresh();
    });
  }

  function openFulfillDialog(orderId: string) {
    setFulfillOrderId(orderId);
    setIpAddress("");
    setPort("");
    setUsername("");
    setPassword("");
  }

  function closeFulfillDialog() {
    setFulfillOrderId(null);
  }

  function handleFulfillSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fulfillOrderId) return;

    startTransition(async () => {
      const result = await fulfillOrder({
        orderId: fulfillOrderId,
        ipAddress,
        port,
        username,
        password,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Order fulfilled and proxy credentials saved.");
      closeFulfillDialog();
      refresh();
    });
  }

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl border border-cyan-500/25 bg-cyan-500/10 ring-1 ring-cyan-500/20">
            <Shield className="size-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              IP Nova Command Center
            </h1>
            <p className="text-sm text-zinc-500">
              Treasury, fulfillment, and wholesale ingress—one secure surface.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="flex shrink-0 gap-1 overflow-x-auto rounded-2xl border border-white/[0.06] bg-white/[0.02] p-2 lg:w-56 lg:flex-col lg:overflow-visible">
          {SIDEBAR.map((item) => {
            const active = view === item.id;
            const count =
              item.id === "orders"
                ? orders.length
                : item.id === "deposits"
                  ? deposits.length
                  : undefined;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigateView(item.id)}
                className={cn(
                  "flex min-w-[10rem] items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors lg:min-w-0",
                  active
                    ? "bg-white/[0.07] text-white ring-1 ring-emerald-500/25"
                    : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                )}
              >
                <span className="flex items-center gap-2">
                  {item.id === "dashboard" && (
                    <LayoutDashboard className="size-4 shrink-0 text-emerald-400/90" />
                  )}
                  {item.id === "orders" && (
                    <ClipboardList className="size-4 shrink-0 text-cyan-400/90" />
                  )}
                  {item.id === "deposits" && (
                    <Banknote className="size-4 shrink-0 text-amber-300/90" />
                  )}
                  {item.label}
                </span>
                {count !== undefined && count > 0 && (
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={viewMotion.initial}
              animate={viewMotion.animate}
              exit={viewMotion.exit}
              transition={viewMotion.transition}
            >
              {view === "dashboard" && (
                <motion.div
                  className="space-y-8"
                  variants={bentoContainer}
                  initial="hidden"
                  animate="show"
                >
                  <motion.div
                    variants={bentoItem}
                    className="grid gap-4 sm:grid-cols-3"
                  >
                    <MetricTile
                      label="Total revenue"
                      value={formatCurrency(DEMO_TOTAL_REVENUE_USD)}
                      hint="Bookings + proxy SKUs (illustrative)"
                    />
                    <MetricTile
                      label="Active users"
                      value={String(activeUserCount)}
                      hint="Profiles in database"
                    />
                    <MetricTile
                      label="Pending orders"
                      value={String(orders.length)}
                      hint="Awaiting fulfillment"
                    />
                  </motion.div>

                  <motion.div variants={bentoItem}>
                    <div className={cn(shellGlass, "p-6 sm:p-8")}>
                      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h2 className="font-heading text-xl font-semibold text-white">
                            Provision proxies
                          </h2>
                          <p className="mt-1 max-w-2xl text-sm text-zinc-500">
                            Paste wholesale lines (Vultr, ISP partners) in raw{" "}
                            <span className="font-mono text-zinc-400">IP:PORT:USER:PASS</span>{" "}
                            format. Deployment is manual—this control stages credentials
                            for operator review.
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                          <Shield className="size-3.5" aria-hidden />
                          Admin only
                        </span>
                      </div>
                      <form onSubmit={handleDeployProvision} className="space-y-5">
                        <div className="space-y-2">
                          <Label
                            htmlFor="provision-email"
                            className="flex items-center gap-2 text-zinc-300"
                          >
                            <Mail className="size-3.5 text-zinc-500" aria-hidden />
                            User email
                          </Label>
                          <Input
                            id="provision-email"
                            type="email"
                            autoComplete="off"
                            placeholder="customer@company.com"
                            value={provisionEmail}
                            onChange={(e) => setProvisionEmail(e.target.value)}
                            className="border-white/10 bg-black/50 font-mono text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="provision-paste" className="text-zinc-300">
                            Raw proxy list
                          </Label>
                          <textarea
                            id="provision-paste"
                            rows={8}
                            value={provisionPaste}
                            onChange={(e) => setProvisionPaste(e.target.value)}
                            placeholder={
                              "203.0.113.42:8800:user_a:pass_a\n203.0.113.43:8800:user_b:pass_b"
                            }
                            className={cn(
                              "w-full resize-y rounded-xl border border-white/10 bg-black/50 px-4 py-3 font-mono text-sm text-zinc-200 outline-none",
                              "placeholder:text-zinc-600 focus-visible:border-emerald-500/40 focus-visible:ring-2 focus-visible:ring-emerald-500/20"
                            )}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="provision-type" className="text-zinc-300">
                            Proxy type
                          </Label>
                          <select
                            id="provision-type"
                            value={provisionType}
                            onChange={(e) =>
                              setProvisionType(
                                e.target.value as typeof provisionType
                              )
                            }
                            className="h-11 w-full max-w-md rounded-xl border border-white/10 bg-black/50 px-3 text-sm text-zinc-200 outline-none focus-visible:border-emerald-500/40 focus-visible:ring-2 focus-visible:ring-emerald-500/20"
                          >
                            <option value="datacenter">Datacenter</option>
                            <option value="residential">Residential</option>
                            <option value="mobile">Mobile</option>
                          </select>
                        </div>
                        <Button
                          type="submit"
                          size="lg"
                          className="w-full gap-2 bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 py-7 text-base font-semibold text-black shadow-[0_0_48px_-8px_rgba(52,211,153,0.55)] hover:from-emerald-300 hover:via-cyan-300 hover:to-emerald-300 sm:w-auto sm:min-w-[240px]"
                        >
                          <Rocket className="size-5" aria-hidden />
                          Deploy to user
                        </Button>
                      </form>
                    </div>
                  </motion.div>

                  <motion.div variants={bentoItem}>
                    <div className={cn(shellGlass, "overflow-hidden")}>
                      <div className="border-b border-white/[0.06] px-6 py-4">
                        <h2 className="font-heading text-lg font-semibold text-white">
                          Recent deposits
                        </h2>
                        <p className="mt-1 text-xs text-zinc-500">
                          Treasury movements across networks (includes demo rows for UI
                          validation).
                        </p>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow className="border-white/[0.08] hover:bg-transparent">
                            <TableHead className="text-zinc-400">User</TableHead>
                            <TableHead className="text-zinc-400">Amount</TableHead>
                            <TableHead className="text-zinc-400">Crypto TX hash</TableHead>
                            <TableHead className="text-right text-zinc-400">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentDepositRows.map((row) => (
                            <TableRow
                              key={row.key}
                              className="border-white/[0.05] hover:bg-white/[0.02]"
                            >
                              <TableCell className="font-medium text-zinc-100">
                                {row.user}
                              </TableCell>
                              <TableCell className="font-mono text-sm text-emerald-200/90">
                                {formatCurrency(row.amount)}
                              </TableCell>
                              <TableCell className="max-w-[220px] truncate font-mono text-xs text-zinc-400 sm:max-w-none">
                                {row.txHash}
                              </TableCell>
                              <TableCell className="text-right">
                                <StatusBadge
                                  tone={
                                    row.status.includes("Pending") ||
                                    row.status.includes("review")
                                      ? "warn"
                                      : row.status.includes("Confirming")
                                        ? "warn"
                                        : "success"
                                  }
                                >
                                  {row.status}
                                </StatusBadge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {view === "deposits" && (
                <div className={cn(shellGlass, "overflow-hidden")}>
                  {deposits.length === 0 ? (
                    <p className="p-10 text-center text-sm text-zinc-500">
                      No pending deposits.
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/[0.08] hover:bg-transparent">
                          <TableHead>User</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>TXID</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {deposits.map((deposit) => (
                          <TableRow
                            key={deposit.id}
                            className="border-white/[0.05] hover:bg-white/[0.02]"
                          >
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium text-zinc-100">
                                  {deposit.user_email ?? shortId(deposit.user_id)}
                                </span>
                                <span className="text-xs text-zinc-500">
                                  {shortId(deposit.user_id)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(deposit.amount)}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate font-mono text-xs text-zinc-400">
                              {deposit.txid}
                            </TableCell>
                            <TableCell>
                              <StatusBadge tone="warn">Pending review</StatusBadge>
                            </TableCell>
                            <TableCell className="text-zinc-400">
                              {formatDate(deposit.created_at)}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  render={
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-white/12 bg-black/30"
                                      disabled={isPending}
                                    >
                                      <MoreHorizontal className="size-4" />
                                      <span className="sr-only">Quick actions</span>
                                    </Button>
                                  }
                                />
                                <DropdownMenuContent
                                  align="end"
                                  className="min-w-44 border-white/10 bg-zinc-950/95 text-zinc-100"
                                >
                                  <DropdownMenuItem
                                    onClick={() => handleApprove(deposit.id)}
                                  >
                                    Approve deposit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      void copyText(deposit.txid, "TXID")
                                    }
                                  >
                                    Copy TXID
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      void copyText(deposit.user_id, "User ID")
                                    }
                                  >
                                    Copy user ID
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              )}

              {view === "orders" && (
                <div className={cn(shellGlass, "overflow-hidden")}>
                  {orders.length === 0 ? (
                    <p className="p-10 text-center text-sm text-zinc-500">
                      No pending orders.
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/[0.08] hover:bg-transparent">
                          <TableHead>Order</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow
                            key={order.id}
                            className="border-white/[0.05] hover:bg-white/[0.02]"
                          >
                            <TableCell className="font-mono text-xs text-zinc-300">
                              {shortId(order.id)}
                            </TableCell>
                            <TableCell className="capitalize text-zinc-200">
                              {order.proxy_type}
                            </TableCell>
                            <TableCell>{order.quantity}</TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(order.total_price)}
                            </TableCell>
                            <TableCell>
                              <StatusBadge tone="warn">Pending</StatusBadge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  render={
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-white/12 bg-black/30"
                                      disabled={isPending}
                                    >
                                      <MoreHorizontal className="size-4" />
                                      <span className="sr-only">Quick actions</span>
                                    </Button>
                                  }
                                />
                                <DropdownMenuContent
                                  align="end"
                                  className="min-w-44 border-white/10 bg-zinc-950/95 text-zinc-100"
                                >
                                  <DropdownMenuItem
                                    onClick={() => openFulfillDialog(order.id)}
                                  >
                                    Fulfill order
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => void copyText(order.id, "Order ID")}
                                  >
                                    Copy order ID
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      void copyText(order.user_id, "User ID")
                                    }
                                  >
                                    Copy user ID
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <Dialog
        open={fulfillOrderId !== null}
        onOpenChange={(open) => !open && closeFulfillDialog()}
      >
        <DialogContent className="border-white/10 bg-zinc-950 text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Fulfill order</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Enter proxy credentials to deliver to the customer.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFulfillSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ip-address">IP Address</Label>
              <Input
                id="ip-address"
                placeholder="192.168.1.1"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                required
                className="border-white/10 bg-black/40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                placeholder="8080"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                required
                className="border-white/10 bg-black/40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="proxy_user"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="border-white/10 bg-black/40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-white/10 bg-black/40"
              />
            </div>
            <DialogFooter className="border-0 bg-transparent p-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeFulfillDialog}
                disabled={isPending}
                className="border-white/15"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-black hover:from-emerald-300 hover:to-cyan-300"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Submit & complete"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function AdminPanel(props: AdminPanelProps) {
  return (
    <Suspense fallback={<SearchParamsSuspenseFallback />}>
      <AdminPanelInner {...props} />
    </Suspense>
  );
}

function MetricTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <motion.div variants={bentoItem} {...hoverLift} {...tapScale}>
      <div className={cn(shellGlass, "p-5")}>
        <p className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
          {label}
        </p>
        <p className="mt-2 font-heading text-2xl font-bold tracking-tight text-white">
          {value}
        </p>
        <p className="mt-2 text-xs text-zinc-500">{hint}</p>
      </div>
    </motion.div>
  );
}
