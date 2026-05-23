import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  AdminRegisteredAccount,
  AdminUserOrderSummary,
  PendingDeposit,
} from "@/lib/types/admin";

type DepositRow = {
  id: string;
  user_id: string;
  amount: number;
  txid: string;
  created_at: string;
  profiles?: { email: string | null } | { email: string | null }[] | null;
};

export async function fetchPendingDeposits(
  supabase: SupabaseClient
): Promise<PendingDeposit[]> {
  const withJoin = await supabase
    .from("deposits")
    .select(
      "id, user_id, amount, txid, created_at, profiles!deposits_user_id_fkey(email)"
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (!withJoin.error && withJoin.data) {
    return (withJoin.data as DepositRow[]).map(mapDepositRow);
  }

  const fallback = await supabase
    .from("deposits")
    .select("id, user_id, amount, txid, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (fallback.error || !fallback.data) {
    return [];
  }

  const userIds = [...new Set(fallback.data.map((row) => row.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email")
    .in("id", userIds);

  const emailByUserId = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile.email as string | null])
  );

  return fallback.data.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    amount: Number(row.amount),
    txid: row.txid,
    created_at: row.created_at,
    user_email: emailByUserId.get(row.user_id) ?? null,
  }));
}

type ProfileRow = {
  id: string;
  email: string | null;
  balance: number;
  created_at: string;
};

type OrderSummaryRow = {
  id: string;
  user_id: string;
  proxy_type: string;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
};

function mapOrderSummary(row: OrderSummaryRow): AdminUserOrderSummary {
  const status = row.status;
  const normalizedStatus: AdminUserOrderSummary["status"] =
    status === "completed" || status === "cancelled" ? status : "pending";

  return {
    id: row.id,
    proxy_type: row.proxy_type,
    quantity: Number(row.quantity),
    total_price: Number(row.total_price),
    status: normalizedStatus,
    created_at: row.created_at,
  };
}

export async function fetchRegisteredAccounts(
  supabase: SupabaseClient
): Promise<AdminRegisteredAccount[]> {
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, email, balance, created_at")
    .order("created_at", { ascending: false });

  if (profilesError || !profiles?.length) {
    return [];
  }

  const profileRows = profiles as ProfileRow[];
  const userIds = profileRows.map((profile) => profile.id);

  const { data: orders } = await supabase
    .from("orders")
    .select("id, user_id, proxy_type, quantity, total_price, status, created_at")
    .in("user_id", userIds)
    .order("created_at", { ascending: false });

  const ordersByUser = new Map<string, AdminUserOrderSummary[]>();
  for (const row of (orders as OrderSummaryRow[] | null) ?? []) {
    const list = ordersByUser.get(row.user_id) ?? [];
    list.push(mapOrderSummary(row));
    ordersByUser.set(row.user_id, list);
  }

  return profileRows.map((profile) => {
    const userOrders = ordersByUser.get(profile.id) ?? [];
    const pendingOrders = userOrders.filter((order) => order.status === "pending");

    return {
      id: profile.id,
      email: profile.email,
      balance: Number(profile.balance ?? 0),
      created_at: profile.created_at,
      orders: userOrders,
      pending_order_count: pendingOrders.length,
      completed_order_count: userOrders.filter(
        (order) => order.status === "completed"
      ).length,
    };
  });
}

function mapDepositRow(row: DepositRow): PendingDeposit {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;

  return {
    id: row.id,
    user_id: row.user_id,
    amount: Number(row.amount),
    txid: row.txid,
    created_at: row.created_at,
    user_email: profile?.email ?? null,
  };
}
