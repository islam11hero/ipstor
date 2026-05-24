import { formatProductTypeLabel, getProduct } from "@/lib/pricing";
import type {
  AccountActivityItem,
  ProductUsageStat,
  UserAccountStats,
  UserDeposit,
  UserOrder,
  UserProxy,
} from "@/lib/types/dashboard";

export type AccountTier = UserAccountStats["accountTier"];

const TIER_THRESHOLDS: { minSpent: number; tier: AccountTier; label: string }[] = [
  { minSpent: 500, tier: "enterprise", label: "Enterprise" },
  { minSpent: 200, tier: "business", label: "Business" },
  { minSpent: 50, tier: "pro", label: "Pro" },
  { minSpent: 0, tier: "starter", label: "Starter" },
];

function resolveTier(totalSpent: number): Pick<UserAccountStats, "accountTier" | "tierLabel"> {
  const match = TIER_THRESHOLDS.find((entry) => totalSpent >= entry.minSpent)!;
  return { accountTier: match.tier, tierLabel: match.label };
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function latestIso(dates: (string | null | undefined)[]): string | null {
  const valid = dates.filter(Boolean) as string[];
  if (valid.length === 0) return null;
  return valid.sort((a, b) => Date.parse(b) - Date.parse(a))[0]!;
}

export function computeAccountStats(input: {
  balance: number;
  memberSince: string | null;
  proxies: UserProxy[];
  deposits: UserDeposit[];
  orders: UserOrder[];
}): UserAccountStats {
  const completedOrders = input.orders.filter((o) => o.status === "completed");
  const pendingOrders = input.orders.filter((o) => o.status === "pending");
  const cancelledOrders = input.orders.filter((o) => o.status === "cancelled");

  const approvedDeposits = input.deposits.filter((d) => d.status === "approved");
  const pendingDeposits = input.deposits.filter((d) => d.status === "pending");

  const totalSpent = roundMoney(
    completedOrders.reduce((sum, order) => sum + order.total_price, 0)
  );
  const totalDeposited = roundMoney(
    approvedDeposits.reduce((sum, deposit) => sum + deposit.amount, 0)
  );
  const pendingDepositAmount = roundMoney(
    pendingDeposits.reduce((sum, deposit) => sum + deposit.amount, 0)
  );

  const averageOrderValue =
    completedOrders.length > 0
      ? roundMoney(totalSpent / completedOrders.length)
      : 0;

  const spentByType = new Map<string, number>();
  const countByType = new Map<string, number>();
  for (const order of completedOrders) {
    spentByType.set(
      order.proxy_type,
      roundMoney((spentByType.get(order.proxy_type) ?? 0) + order.total_price)
    );
    countByType.set(order.proxy_type, (countByType.get(order.proxy_type) ?? 0) + 1);
  }

  const orderTypeById = new Map(input.orders.map((order) => [order.id, order.proxy_type]));

  const proxyCountByType = new Map<string, number>();
  for (const proxy of input.proxies) {
    if (!proxy.order_id) continue;
    const proxyType = orderTypeById.get(proxy.order_id);
    if (!proxyType) continue;
    proxyCountByType.set(proxyType, (proxyCountByType.get(proxyType) ?? 0) + 1);
  }

  const productTypes = new Set([
    ...input.orders.map((o) => o.proxy_type),
    ...Array.from(spentByType.keys()),
  ]);

  const productBreakdown: ProductUsageStat[] = [...productTypes]
    .map((proxyType) => ({
      proxyType,
      label: formatProductTypeLabel(proxyType),
      orderCount: countByType.get(proxyType) ?? 0,
      totalSpent: spentByType.get(proxyType) ?? 0,
      activeProxies: proxyCountByType.get(proxyType) ?? 0,
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent);

  let topProduct: string | null = null;
  let topProductLabel: string | null = null;
  if (productBreakdown.length > 0) {
    topProduct = productBreakdown[0]!.proxyType;
    topProductLabel = productBreakdown[0]!.label;
  }

  const tier = resolveTier(totalSpent);

  const activity: AccountActivityItem[] = [
    ...input.orders.map((order) => ({
      id: `order-${order.id}`,
      kind: "order" as const,
      title: `${formatProductTypeLabel(order.proxy_type)} order`,
      subtitle:
        order.status === "completed"
          ? "Fulfilled — check My proxies"
          : order.status === "pending"
            ? "Awaiting operator fulfillment"
            : "Cancelled",
      amount: order.total_price,
      status: order.status,
      created_at: order.created_at,
    })),
    ...input.deposits.map((deposit) => ({
      id: `deposit-${deposit.id}`,
      kind: "deposit" as const,
      title: "Wallet top-up",
      subtitle:
        deposit.status === "approved"
          ? "Approved — balance credited"
          : deposit.status === "pending"
            ? "Pending admin review"
            : deposit.status,
      amount: deposit.amount,
      status: deposit.status,
      created_at: deposit.created_at,
    })),
    ...input.proxies.map((proxy) => ({
      id: `proxy-${proxy.id}`,
      kind: "proxy" as const,
      title: "Proxy delivered",
      subtitle: `${proxy.ip_address}:${proxy.port}`,
      created_at: proxy.created_at,
    })),
  ]
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
    .slice(0, 8);

  return {
    memberSince: input.memberSince,
    ...tier,
    walletBalance: input.balance,
    totalSpent,
    totalDeposited,
    pendingDepositAmount,
    pendingDepositsCount: pendingDeposits.length,
    pendingOrdersCount: pendingOrders.length,
    completedOrdersCount: completedOrders.length,
    cancelledOrdersCount: cancelledOrders.length,
    activeProxiesCount: input.proxies.length,
    averageOrderValue,
    lastOrderAt: latestIso(input.orders.map((o) => o.created_at)),
    lastDepositAt: latestIso(input.deposits.map((d) => d.created_at)),
    lastProxyAt: latestIso(input.proxies.map((p) => p.created_at)),
    topProduct,
    topProductLabel,
    productBreakdown,
    recentActivity: activity,
  };
}

export function tierBadgeClass(tier: AccountTier): string {
  switch (tier) {
    case "enterprise":
      return "border-violet-500/35 bg-violet-500/10 text-violet-200";
    case "business":
      return "border-cyan-500/35 bg-cyan-500/10 text-cyan-200";
    case "pro":
      return "border-emerald-500/35 bg-emerald-500/10 text-emerald-200";
    default:
      return "border-zinc-500/35 bg-zinc-500/10 text-zinc-300";
  }
}

export function formatMemberSince(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function productUnitSummary(proxyType: string, quantity: number): string {
  const product = getProduct(proxyType);
  if (!product) return String(quantity);
  return product.unit === "gb" ? `${quantity} GB` : `${quantity} IP${quantity === 1 ? "" : "s"}`;
}
