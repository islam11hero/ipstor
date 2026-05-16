"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useTransition } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Banknote,
  ClipboardList,
  LayoutDashboard,
  Loader2,
  MoreHorizontal,
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
import { hoverLift, tapScale } from "@/lib/motion";
import type { PendingDeposit, PendingOrder } from "@/lib/types/admin";
import { cn } from "@/lib/utils";

const shellGlass =
  "rounded-2xl border border-white/[0.05] bg-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl";

type AdminView = "dashboard" | "orders" | "deposits";

type AdminPanelProps = {
  deposits: PendingDeposit[];
  orders: PendingOrder[];
  activeUserCount: number;
};

const DEMO_MRR_USD = 142_500;

const REVENUE_30D = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  const base = 4200 + (i % 7) * 380 + (i % 5) * 210;
  return { day: `${day}`, revenue: Math.round(base + (i % 4) * 900) };
});

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
    toast.success(`${label} copied`);
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

export function AdminPanel({
  deposits,
  orders,
  activeUserCount,
}: AdminPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [view, setView] = useState<AdminView>("dashboard");
  const [fulfillOrderId, setFulfillOrderId] = useState<string | null>(null);
  const [ipAddress, setIpAddress] = useState("");
  const [port, setPort] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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
              Command Center
            </h1>
            <p className="text-sm text-zinc-500">
              Revenue signals, treasury, and fulfillment in one surface.
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
                onClick={() => setView(item.id)}
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
                  className="space-y-6"
                  variants={bentoContainer}
                  initial="hidden"
                  animate="show"
                >
                  <motion.div
                    variants={bentoItem}
                    className="grid gap-4 sm:grid-cols-3"
                  >
                    <MetricTile
                      label="Total MRR"
                      value={formatCurrency(DEMO_MRR_USD)}
                      hint="Illustrative aggregate"
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
                    <div className={cn(shellGlass, "p-5 sm:p-6")}>
                      <div className="mb-4">
                        <h2 className="font-heading text-lg font-semibold text-white">
                          30-day revenue
                        </h2>
                        <p className="text-xs text-zinc-500">
                          Synthetic series for executive reporting (not wired to
                          billing).
                        </p>
                      </div>
                      <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={REVENUE_30D}
                            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient
                                id="revBar"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop offset="0%" stopColor="#34d399" stopOpacity={0.95} />
                                <stop offset="100%" stopColor="#0d9488" stopOpacity={0.35} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid
                              strokeDasharray="4 8"
                              stroke="rgba(255,255,255,0.06)"
                              vertical={false}
                            />
                            <XAxis
                              dataKey="day"
                              tick={{ fill: "#71717a", fontSize: 9 }}
                              axisLine={false}
                              tickLine={false}
                              interval={4}
                            />
                            <YAxis
                              tick={{ fill: "#71717a", fontSize: 10 }}
                              axisLine={false}
                              tickLine={false}
                              width={44}
                              tickFormatter={(v) =>
                                v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
                              }
                            />
                            <Tooltip
                              cursor={{ fill: "rgba(255,255,255,0.03)" }}
                              contentStyle={{
                                background: "rgba(9,9,11,0.94)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                borderRadius: 12,
                                fontSize: 12,
                              }}
                              formatter={(v) => [
                                formatCurrency(Number(v)),
                                "Revenue",
                              ]}
                            />
                            <Bar
                              dataKey="revenue"
                              fill="url(#revBar)"
                              radius={[4, 4, 0, 0]}
                              maxBarSize={18}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={bentoItem} className="grid gap-4 lg:grid-cols-2">
                    <SnapshotCard
                      title="Orders pipeline"
                      value={orders.length}
                      statusLabel={orders.length ? "Action needed" : "Clear"}
                      tone={orders.length ? "warn" : "success"}
                    />
                    <SnapshotCard
                      title="Treasury queue"
                      value={deposits.length}
                      statusLabel={deposits.length ? "Awaiting approval" : "Clear"}
                      tone={deposits.length ? "warn" : "success"}
                    />
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

function SnapshotCard({
  title,
  value,
  statusLabel,
  tone,
}: {
  title: string;
  value: number;
  statusLabel: string;
  tone: "success" | "warn";
}) {
  return (
    <motion.div variants={bentoItem} {...hoverLift}>
      <div className={cn(shellGlass, "flex items-center justify-between p-5")}>
        <div>
          <p className="text-xs font-medium text-zinc-500">{title}</p>
          <p className="mt-1 font-heading text-3xl font-bold text-white">{value}</p>
        </div>
        <StatusBadge tone={tone === "success" ? "success" : "warn"}>
          {statusLabel}
        </StatusBadge>
      </div>
    </motion.div>
  );
}
