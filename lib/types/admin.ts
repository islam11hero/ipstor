import type { UserAccountStats } from "@/lib/types/dashboard";

export type PendingDeposit = {
  id: string;
  user_id: string;
  amount: number;
  txid: string;
  created_at: string;
  user_email: string | null;
};

export type PendingOrder = {
  id: string;
  user_id: string;
  proxy_type: string;
  quantity: number;
  total_price: number;
  created_at: string;
  tier_id?: string | null;
  addon_ids?: string[];
};

export type AdminUserOrderSummary = {
  id: string;
  proxy_type: string;
  quantity: number;
  total_price: number;
  status: "pending" | "completed" | "cancelled";
  created_at: string;
};

export type AdminRegisteredAccount = {
  id: string;
  email: string | null;
  balance: number;
  created_at: string;
  orders: AdminUserOrderSummary[];
  pending_order_count: number;
  completed_order_count: number;
  accountStats: UserAccountStats;
};
