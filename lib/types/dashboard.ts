export type UserProxy = {
  id: string;
  ip_address: string;
  port: string;
  username: string;
  password: string;
  created_at: string;
  order_id?: string | null;
};

export type UserDeposit = {
  id: string;
  amount: number;
  txid: string;
  status: string;
  created_at: string;
};

export type UserOrder = {
  id: string;
  proxy_type: string;
  quantity: number;
  total_price: number;
  status: "pending" | "completed" | "cancelled" | string;
  created_at: string;
  tier_id?: string | null;
  addon_ids?: string[];
};

export type AccountTier = "starter" | "pro" | "business" | "enterprise";

export type ProductUsageStat = {
  proxyType: string;
  label: string;
  orderCount: number;
  totalSpent: number;
  activeProxies: number;
};

export type AccountActivityItem = {
  id: string;
  kind: "order" | "deposit" | "proxy";
  title: string;
  subtitle: string;
  amount?: number;
  status?: string;
  created_at: string;
};

export type UserAccountStats = {
  memberSince: string | null;
  accountTier: AccountTier;
  tierLabel: string;
  walletBalance: number;
  totalSpent: number;
  totalDeposited: number;
  pendingDepositAmount: number;
  pendingDepositsCount: number;
  pendingOrdersCount: number;
  completedOrdersCount: number;
  cancelledOrdersCount: number;
  activeProxiesCount: number;
  averageOrderValue: number;
  lastOrderAt: string | null;
  lastDepositAt: string | null;
  lastProxyAt: string | null;
  topProduct: string | null;
  topProductLabel: string | null;
  productBreakdown: ProductUsageStat[];
  recentActivity: AccountActivityItem[];
};

export type DashboardData = {
  email: string;
  balance: number;
  memberSince: string | null;
  accountStats: UserAccountStats;
  proxies: UserProxy[];
  deposits: UserDeposit[];
  orders: UserOrder[];
  isAdmin: boolean;
  /** Short code for affiliate referral URLs (`usr_<segment>`). */
  referralCode: string;
};
