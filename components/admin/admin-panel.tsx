"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Suspense, useCallback, useMemo, useState, useTransition } from "react";
import {
  Banknote,
  ClipboardList,
  LayoutDashboard,
  Loader2,
  MoreHorizontal,
  Shield,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { approveDeposit, fulfillOrder as fulfillOrderAction } from "@/app/admin/actions";
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
import { describeOrderExtras } from "@/lib/product-catalog";
import { hoverLift, tapScale } from "@/lib/motion";
import type {
  AdminRegisteredAccount,
  AdminUserOrderSummary,
  PendingDeposit,
  PendingOrder,
} from "@/lib/types/admin";
import {
  formatProductQuantityLabel,
  formatProductTypeLabel,
  getProduct,
} from "@/lib/pricing";
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

type AdminView = "dashboard" | "orders" | "deposits" | "accounts";

const ADMIN_VIEW_PARAM = "view";

const ADMIN_VIEW_ALIASES: Record<string, AdminView> = {
  dashboard: "dashboard",
  orders: "orders",
  deposits: "deposits",
  accounts: "accounts",
  users: "accounts",
  "registered-accounts": "accounts",
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
  accounts: AdminRegisteredAccount[];
  activeUserCount: number;
};

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
  { id: "accounts", label: "Registered accounts" },
  { id: "orders", label: "Pending Orders" },
  { id: "deposits", label: "Deposits" },
];

function AdminPanelInner({
  deposits,
  orders,
  accounts,
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
  const [fulfillTargetOrder, setFulfillTargetOrder] = useState<PendingOrder | null>(null);
  const [rawProxyList, setRawProxyList] = useState("");

  const accountsWithPending = useMemo(
    () => accounts.filter((account) => account.pending_order_count > 0).length,
    [accounts]
  );

  const recentDepositRows = useMemo<RecentDepositTableRow[]>(
    () =>
      deposits.slice(0, 8).map((d) => ({
        key: d.id,
        user: d.user_email ?? shortId(d.user_id),
        amount: d.amount,
        txHash: d.txid,
        status: "Pending review",
      })),
    [deposits]
  );

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

  function openFulfillDialog(order: PendingOrder) {
    setFulfillTargetOrder(order);
    setRawProxyList("");
  }

  function closeFulfillDialog() {
    setFulfillTargetOrder(null);
    setRawProxyList("");
  }

  function handleFulfillSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fulfillTargetOrder) return;

    startTransition(async () => {
      const result = await fulfillOrderAction({
        orderId: fulfillTargetOrder.id,
        rawProxyList,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(
        `Order fulfilled — ${result.delivered ?? 0} proxy line(s) delivered.`
      );
      closeFulfillDialog();
      refresh();
    });
  }

  const fulfillProduct = fulfillTargetOrder ? getProduct(fulfillTargetOrder.proxy_type) : null;
  const fulfillLineHint =
    fulfillProduct?.unit === "gb"
      ? "Paste gateway line(s) in IP:PORT:USER:PASS format (minimum 1)."
      : fulfillTargetOrder
        ? `Paste exactly ${fulfillTargetOrder.quantity} line(s), one per row.`
        : "";

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
                  : item.id === "accounts"
                    ? accountsWithPending
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
                  {item.id === "accounts" && (
                    <Users className="size-4 shrink-0 text-violet-300/90" />
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
                      label="Pending orders"
                      value={String(orders.length)}
                      hint="Awaiting fulfillment"
                    />
                    <MetricTile
                      label="Pending deposits"
                      value={String(deposits.length)}
                      hint="Crypto top-ups to review"
                    />
                    <MetricTile
                      label="Active users"
                      value={String(activeUserCount)}
                      hint="Profiles in database"
                    />
                  </motion.div>

                  <motion.div variants={bentoItem}>
                    <div className={cn(shellGlass, "p-6 sm:p-8")}>
                      <h2 className="font-heading text-xl font-semibold text-white">
                        Operations
                      </h2>
                      <p className="mt-1 max-w-2xl text-sm text-zinc-500">
                        Fulfill proxy orders and approve crypto deposits from the
                        dedicated queues.
                      </p>
                      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                        <Button
                          type="button"
                          variant="outline"
                          className="border-white/12 bg-black/30"
                          onClick={() => navigateView("accounts")}
                        >
                          <Users className="size-4" />
                          Registered accounts ({accounts.length})
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="border-white/12 bg-black/30"
                          onClick={() => navigateView("orders")}
                        >
                          <ClipboardList className="size-4" />
                          Pending orders ({orders.length})
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="border-white/12 bg-black/30"
                          onClick={() => navigateView("deposits")}
                        >
                          <Banknote className="size-4" />
                          Pending deposits ({deposits.length})
                        </Button>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={bentoItem}>
                    <div className={cn(shellGlass, "overflow-hidden")}>
                      <div className="border-b border-white/[0.06] px-6 py-4">
                        <h2 className="font-heading text-lg font-semibold text-white">
                          Pending deposits
                        </h2>
                        <p className="mt-1 text-xs text-zinc-500">
                          Latest crypto top-ups waiting for approval (live data).
                        </p>
                      </div>
                      {recentDepositRows.length === 0 ? (
                        <p className="p-10 text-center text-sm text-zinc-500">
                          No pending deposits right now.
                        </p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow className="border-white/[0.08] hover:bg-transparent">
                              <TableHead className="text-zinc-400">User</TableHead>
                              <TableHead className="text-zinc-400">Amount</TableHead>
                              <TableHead className="text-zinc-400">TXID</TableHead>
                              <TableHead className="text-right text-zinc-400">
                                Status
                              </TableHead>
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
                                  <StatusBadge tone="warn">{row.status}</StatusBadge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {view === "accounts" && (
                <motion.div
                  className={cn(shellGlass, "overflow-hidden")}
                  initial={viewMotion.initial}
                  animate={viewMotion.animate}
                  transition={viewMotion.transition}
                >
                  <motion.div
                    className="border-b border-white/[0.06] px-6 py-4"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2 className="font-heading text-lg font-semibold text-white">
                      Registered accounts
                    </h2>
                    <p className="mt-1 text-xs text-zinc-500">
                      Customer profiles, purchase history, and pending fulfillment
                      needs.
                    </p>
                  </motion.div>
                  {accounts.length === 0 ? (
                    <p className="p-10 text-center text-sm text-zinc-500">
                      No registered accounts yet.
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/[0.08] hover:bg-transparent">
                          <TableHead>Account</TableHead>
                          <TableHead>Balance</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Purchases</TableHead>
                          <TableHead>Pending needs</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {accounts.map((account) => (
                          <TableRow
                            key={account.id}
                            className="border-white/[0.05] hover:bg-white/[0.02]"
                          >
                            <TableCell>
                              <motion.div
                                className="flex flex-col"
                                initial={{ opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.18 }}
                              >
                                <span className="font-medium text-zinc-100">
                                  {account.email ?? "No email on file"}
                                </span>
                                <span className="font-mono text-xs text-zinc-500">
                                  {shortId(account.id)}
                                </span>
                              </motion.div>
                            </TableCell>
                            <TableCell className="font-medium text-emerald-200/90">
                              {formatCurrency(account.balance)}
                            </TableCell>
                            <TableCell className="text-zinc-400">
                              {formatDate(account.created_at)}
                            </TableCell>
                            <TableCell className="max-w-[280px]">
                              <PurchasesSummary orders={account.orders} />
                            </TableCell>
                            <TableCell>
                              {account.pending_order_count > 0 ? (
                                <StatusBadge tone="warn">
                                  {account.pending_order_count} pending
                                </StatusBadge>
                              ) : (
                                <StatusBadge tone="success">None</StatusBadge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  render={
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-white/12 bg-black/30"
                                    >
                                      <MoreHorizontal className="size-4" />
                                      <span className="sr-only">Account actions</span>
                                    </Button>
                                  }
                                />
                                <DropdownMenuContent
                                  align="end"
                                  className="min-w-44 border-white/10 bg-zinc-950/95 text-zinc-100"
                                >
                                  <DropdownMenuItem
                                    onClick={() =>
                                      void copyText(account.id, "User ID")
                                    }
                                  >
                                    Copy user ID
                                  </DropdownMenuItem>
                                  {account.email ? (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        void copyText(account.email!, "Email")
                                      }
                                    >
                                      Copy email
                                    </DropdownMenuItem>
                                  ) : null}
                                  {account.pending_order_count > 0 ? (
                                    <DropdownMenuItem
                                      onClick={() => navigateView("orders")}
                                    >
                                      View pending orders
                                    </DropdownMenuItem>
                                  ) : null}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
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
                              <div>{formatProductTypeLabel(order.proxy_type)}</div>
                              {describeOrderExtras(
                                order.proxy_type,
                                order.tier_id,
                                order.addon_ids
                              ) ? (
                                <p className="mt-1 text-xs text-zinc-500">
                                  {describeOrderExtras(
                                    order.proxy_type,
                                    order.tier_id,
                                    order.addon_ids
                                  )}
                                </p>
                              ) : null}
                            </TableCell>
                            <TableCell>
                              {orderQuantityLabel(order.proxy_type, order.quantity)}
                            </TableCell>
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
                                    onClick={() => openFulfillDialog(order)}
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
        open={fulfillTargetOrder !== null}
        onOpenChange={(open) => !open && closeFulfillDialog()}
      >
        <DialogContent className="border-white/10 bg-zinc-950 text-zinc-100 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Fulfill order</DialogTitle>
            <DialogDescription className="text-zinc-500">
              {fulfillTargetOrder ? (
                <>
                  {formatProductTypeLabel(fulfillTargetOrder.proxy_type)} ·{" "}
                  {fulfillProduct
                    ? formatProductQuantityLabel(
                        fulfillProduct,
                        fulfillTargetOrder.quantity
                      )
                    : fulfillTargetOrder.quantity}{" "}
                  · {formatCurrency(fulfillTargetOrder.total_price)}. {fulfillLineHint}
                </>
              ) : (
                "Paste proxy credentials to deliver to the customer."
              )}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFulfillSubmit} className="space-y-4">
            <motion.div className="space-y-2">
              <Label htmlFor="raw-proxy-list">Proxy lines</Label>
              <textarea
                id="raw-proxy-list"
                rows={10}
                value={rawProxyList}
                onChange={(e) => setRawProxyList(e.target.value)}
                placeholder={
                  "203.0.113.42:8800:user_a:pass_a\n203.0.113.43:8800:user_b:pass_b"
                }
                required
                className={cn(
                  "w-full resize-y rounded-xl border border-white/10 bg-black/50 px-4 py-3 font-mono text-sm text-zinc-200 outline-none",
                  "placeholder:text-zinc-600 focus-visible:border-emerald-500/40 focus-visible:ring-2 focus-visible:ring-emerald-500/20"
                )}
              />
            </motion.div>
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

function orderQuantityLabel(proxyType: string, quantity: number) {
  const product = getProduct(proxyType);
  return product ? formatProductQuantityLabel(product, quantity) : String(quantity);
}

function PurchasesSummary({ orders }: { orders: AdminUserOrderSummary[] }) {
  const completed = orders.filter((order) => order.status === "completed");

  if (completed.length === 0) {
    return <span className="text-sm text-zinc-500">No purchases yet</span>;
  }

  const visible = completed.slice(0, 2);
  const remaining = completed.length - visible.length;

  return (
    <div className="space-y-1">
      {visible.map((order) => (
        <p key={order.id} className="text-sm text-zinc-300">
          {formatProductTypeLabel(order.proxy_type)} ·{" "}
          {orderQuantityLabel(order.proxy_type, order.quantity)}
        </p>
      ))}
      {remaining > 0 ? (
        <p className="text-xs text-zinc-500">+{remaining} more completed</p>
      ) : null}
    </div>
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
