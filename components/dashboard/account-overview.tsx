"use client";

import Link from "next/link";
import type { Icon } from "@phosphor-icons/react";
import {
  Calendar,
  Clock,
  Lightning,
  Medal,
  Package,
  ShoppingBag,
  TrendUp,
} from "@phosphor-icons/react";

import { LordIcon, type LordIconName } from "@/components/icons";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatMemberSince,
  tierBadgeClass,
} from "@/lib/dashboard/account-stats";
import type { UserAccountStats } from "@/lib/types/dashboard";
import { cn } from "@/lib/utils";

const shellGlass =
  "rounded-2xl border border-white/[0.05] bg-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl";

type AccountOverviewProps = {
  email: string;
  stats: UserAccountStats;
  walletBalance?: number;
  onNavigate?: (target: "orders" | "proxies" | "funds") => void;
  variant?: "compact" | "full";
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatRelativeDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function activityIcon(
  kind: UserAccountStats["recentActivity"][number]["kind"]
): Icon | null {
  if (kind === "deposit") return null;
  if (kind === "proxy") return Lightning;
  return ShoppingBag;
}

function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  lordIcon,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: Icon;
  lordIcon?: LordIconName;
  tone?: "default" | "warn" | "success";
}) {
  const toneClass =
    tone === "warn"
      ? "text-amber-300"
      : tone === "success"
        ? "text-emerald-300"
        : "text-white";

  return (
    <div className={cn(shellGlass, "p-4 sm:p-5")}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
          {label}
        </p>
        <div className="flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]">
          {lordIcon ? (
            <LordIcon name={lordIcon} size={28} trigger="hover" />
          ) : Icon ? (
            <Icon className="size-5 text-emerald-400/90" weight="duotone" />
          ) : null}
        </div>
      </div>
      <p className={cn("mt-3 font-heading text-2xl font-bold tracking-tight", toneClass)}>
        {value}
      </p>
      {hint ? <p className="mt-1.5 text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
}

export function AccountOverview({
  email,
  stats,
  walletBalance,
  onNavigate,
  variant = "compact",
}: AccountOverviewProps) {
  const showFull = variant === "full";
  const liveBalance = walletBalance ?? stats.walletBalance;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-xl font-semibold text-white sm:text-2xl">
              Account overview
            </h2>
            <Badge className={cn("border", tierBadgeClass(stats.accountTier))}>
              <Medal className="mr-1 size-3" weight="duotone" />
              {stats.tierLabel}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Usage snapshot inspired by enterprise proxy consoles — all figures from
            your live wallet, orders, and deliveries.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm">
          <p className="text-zinc-500">Signed in as</p>
          <p className="font-medium text-zinc-200">{email}</p>
          <p className="mt-1 text-xs text-zinc-500">
            Member since {formatMemberSince(stats.memberSince)}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6">
        <StatTile
          label="Wallet balance"
          value={formatCurrency(liveBalance)}
          hint="Available to spend"
          lordIcon="wallet"
          tone="success"
        />
        <StatTile
          label="Lifetime spend"
          value={formatCurrency(stats.totalSpent)}
          hint={`${stats.completedOrdersCount} completed order${stats.completedOrdersCount === 1 ? "" : "s"}`}
          icon={TrendUp}
        />
        <StatTile
          label="Total deposited"
          value={formatCurrency(stats.totalDeposited)}
          hint={
            stats.pendingDepositsCount > 0
              ? `${formatCurrency(stats.pendingDepositAmount)} pending`
              : "Approved top-ups"
          }
          lordIcon="wallet"
        />
        <StatTile
          label="Active proxies"
          value={String(stats.activeProxiesCount)}
          hint={stats.lastProxyAt ? `Last delivery ${formatRelativeDate(stats.lastProxyAt)}` : "None delivered yet"}
          lordIcon="zap"
        />
        <StatTile
          label="Pending orders"
          value={String(stats.pendingOrdersCount)}
          hint={
            stats.pendingOrdersCount > 0
              ? "Awaiting operator fulfillment"
              : "Queue is clear"
          }
          icon={Package}
          tone={stats.pendingOrdersCount > 0 ? "warn" : "default"}
        />
        <StatTile
          label="Avg. order"
          value={
            stats.averageOrderValue > 0
              ? formatCurrency(stats.averageOrderValue)
              : "—"
          }
          hint={
            stats.topProductLabel
              ? `Top SKU: ${stats.topProductLabel}`
              : "No purchases yet"
          }
          icon={ShoppingBag}
        />
      </div>

      <div className={cn("grid gap-4", showFull ? "lg:grid-cols-3" : "lg:grid-cols-2")}>
        <Card className={cn(shellGlass, showFull ? "lg:col-span-1" : "")}>
          <CardHeader>
            <CardTitle className="text-base">Product usage</CardTitle>
            <CardDescription className="text-zinc-500">
              Spend and delivery mix by proxy class — similar to Smartproxy usage
              panels.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.productBreakdown.length === 0 ? (
              <p className="text-sm text-zinc-500">No product history yet.</p>
            ) : (
              <ul className="space-y-3">
                {stats.productBreakdown.map((item) => {
                  const maxSpent = stats.productBreakdown[0]?.totalSpent || 1;
                  const width = Math.max(8, (item.totalSpent / maxSpent) * 100);
                  return (
                    <li key={item.proxyType}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium text-zinc-200">{item.label}</span>
                        <span className="text-zinc-400">
                          {formatCurrency(item.totalSpent)}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-zinc-500">
                        {item.orderCount} order{item.orderCount === 1 ? "" : "s"} ·{" "}
                        {item.activeProxies} active line
                        {item.activeProxies === 1 ? "" : "s"}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className={cn(shellGlass, showFull ? "lg:col-span-1" : "")}>
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
            <CardDescription className="text-zinc-500">
              Unified timeline of orders, top-ups, and proxy deliveries.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length === 0 ? (
              <p className="text-sm text-zinc-500">No account activity yet.</p>
            ) : (
              <ul className="space-y-3">
                {stats.recentActivity.map((item) => {
                  const Icon = activityIcon(item.kind);
                  return (
                    <li
                      key={item.id}
                      className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                        {Icon ? (
                          <Icon className="size-5 text-emerald-400" weight="duotone" />
                        ) : (
                          <LordIcon name="wallet" size={28} trigger="hover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-zinc-200">{item.title}</p>
                        <p className="truncate text-xs text-zinc-500">{item.subtitle}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        {item.amount !== undefined ? (
                          <p className="text-sm font-medium text-emerald-200/90">
                            {formatCurrency(item.amount)}
                          </p>
                        ) : null}
                        <p className="text-[10px] text-zinc-500">
                          {formatRelativeDate(item.created_at)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {showFull ? (
          <Card className={cn(shellGlass, "lg:col-span-1")}>
            <CardHeader>
              <CardTitle className="text-base">Account details</CardTitle>
              <CardDescription className="text-zinc-500">
                Profile metadata and last-touch timestamps.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <DetailRow label="Account tier" value={stats.tierLabel} />
              <DetailRow
                label="Member since"
                value={formatMemberSince(stats.memberSince)}
              />
              <DetailRow
                label="Last order"
                value={formatRelativeDate(stats.lastOrderAt)}
              />
              <DetailRow
                label="Last top-up"
                value={formatRelativeDate(stats.lastDepositAt)}
              />
              <DetailRow
                label="Last proxy delivery"
                value={formatRelativeDate(stats.lastProxyAt)}
              />
              <DetailRow
                label="Completed orders"
                value={String(stats.completedOrdersCount)}
              />
              <DetailRow
                label="Cancelled orders"
                value={String(stats.cancelledOrdersCount)}
              />
              <div className="flex flex-wrap gap-2 pt-2">
                {onNavigate ? (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-white/12"
                      onClick={() => onNavigate("orders")}
                    >
                      View orders
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-white/12"
                      onClick={() => onNavigate("proxies")}
                    >
                      My proxies
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-white/12"
                      onClick={() => onNavigate("funds")}
                    >
                      Billing
                    </Button>
                  </>
                ) : null}
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/12"
                  render={<Link href="/tools/proxy-tester" />}
                >
                  Validate proxies
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>

      {showFull ? null : (
        <div className="grid gap-3 sm:grid-cols-3">
          <MiniFact
            icon={Calendar}
            label="Last order"
            value={formatRelativeDate(stats.lastOrderAt)}
          />
          <MiniFact
            icon={Clock}
            label="Last top-up"
            value={formatRelativeDate(stats.lastDepositAt)}
          />
          <MiniFact
            icon={Lightning}
            label="Last delivery"
            value={formatRelativeDate(stats.lastProxyAt)}
          />
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/[0.05] pb-2 last:border-0">
      <span className="text-zinc-500">{label}</span>
      <span className="font-medium text-zinc-200">{value}</span>
    </div>
  );
}

function MiniFact({
  icon: Icon,
  label,
  value,
}: {
  icon: Icon;
  label: string;
  value: string;
}) {
  return (
    <div className={cn(shellGlass, "flex items-center gap-3 p-4")}>
      <Icon className="size-5 shrink-0 text-zinc-500" weight="duotone" />
      <div>
        <p className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
          {label}
        </p>
        <p className="text-sm font-medium text-zinc-200">{value}</p>
      </div>
    </div>
  );
}
