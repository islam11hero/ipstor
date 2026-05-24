import type { SupabaseClient } from "@supabase/supabase-js";

import { computeAccountStats } from "@/lib/dashboard/account-stats";
import type { UserDeposit, UserOrder, UserProxy } from "@/lib/types/dashboard";
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

type DepositRowAll = {
  id: string;
  user_id: string;
  amount: number;
  txid: string;
  status: string;
  created_at: string;
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

function mapDepositForStats(row: DepositRowAll): UserDeposit {
  return {
    id: row.id,
    amount: Number(row.amount),
    txid: row.txid,
    status: row.status,
    created_at: row.created_at,
  };
}

function mapProxyRow(row: Record<string, unknown>): UserProxy {
  const username =
    (typeof row.username === "string" ? row.username : null) ??
    (typeof row.proxy_user === "string" ? row.proxy_user : "") ??
    "";
  const password =
    (typeof row.password === "string" ? row.password : null) ??
    (typeof row.proxy_pass === "string" ? row.proxy_pass : "") ??
    "";

  return {
    id: String(row.id),
    ip_address: String(row.ip_address ?? ""),
    port: String(row.port ?? ""),
    username,
    password,
    created_at: String(row.created_at ?? new Date().toISOString()),
    order_id:
      typeof row.order_id === "string"
        ? row.order_id
        : row.order_id === null
          ? null
          : undefined,
  };
}

function mapOrderForStats(order: AdminUserOrderSummary): UserOrder {
  return {
    id: order.id,
    proxy_type: order.proxy_type,
    quantity: order.quantity,
    total_price: order.total_price,
    status: order.status,
    created_at: order.created_at,
  };
}

function groupByUserId<T extends { user_id: string }>(
  rows: T[]
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const row of rows) {
    const list = map.get(row.user_id) ?? [];
    list.push(row);
    map.set(row.user_id, list);
  }
  return map;
}

async function fetchAllUserProxies(
  supabase: SupabaseClient,
  userIds: string[]
): Promise<Map<string, UserProxy[]>> {
  if (userIds.length === 0) return new Map();

  const modern = await supabase
    .from("user_proxies")
    .select("id, user_id, ip_address, port, username, password, created_at, order_id")
    .in("user_id", userIds)
    .order("created_at", { ascending: false });

  let rows: Record<string, unknown>[] = [];

  if (!modern.error && modern.data) {
    rows = modern.data as Record<string, unknown>[];
  } else if (
    modern.error?.message.includes("order_id") ||
    modern.error?.message.includes("username")
  ) {
    const fallback = await supabase
      .from("user_proxies")
      .select("id, user_id, ip_address, port, proxy_user, proxy_pass, created_at")
      .in("user_id", userIds)
      .order("created_at", { ascending: false });

    if (!fallback.error && fallback.data) {
      rows = fallback.data as Record<string, unknown>[];
    }
  }

  const byUser = new Map<string, UserProxy[]>();
  for (const row of rows) {
    const userId = String(row.user_id ?? "");
    if (!userId) continue;
    const list = byUser.get(userId) ?? [];
    list.push(mapProxyRow(row));
    byUser.set(userId, list);
  }

  return byUser;
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

  const [ordersResult, depositsResult, proxiesByUser] = await Promise.all([
    supabase
      .from("orders")
      .select("id, user_id, proxy_type, quantity, total_price, status, created_at")
      .in("user_id", userIds)
      .order("created_at", { ascending: false }),
    supabase
      .from("deposits")
      .select("id, user_id, amount, txid, status, created_at")
      .in("user_id", userIds)
      .order("created_at", { ascending: false }),
    fetchAllUserProxies(supabase, userIds),
  ]);

  const ordersByUser = new Map<string, AdminUserOrderSummary[]>();
  for (const row of (ordersResult.data as OrderSummaryRow[] | null) ?? []) {
    const list = ordersByUser.get(row.user_id) ?? [];
    list.push(mapOrderSummary(row));
    ordersByUser.set(row.user_id, list);
  }

  const depositsByUser = groupByUserId(
    (depositsResult.data as DepositRowAll[] | null) ?? []
  );

  return profileRows.map((profile) => {
    const userOrders = ordersByUser.get(profile.id) ?? [];
    const pendingOrders = userOrders.filter((order) => order.status === "pending");
    const userDeposits = (depositsByUser.get(profile.id) ?? []).map(mapDepositForStats);
    const userProxies = proxiesByUser.get(profile.id) ?? [];

    const accountStats = computeAccountStats({
      balance: Number(profile.balance ?? 0),
      memberSince: profile.created_at,
      proxies: userProxies,
      deposits: userDeposits,
      orders: userOrders.map(mapOrderForStats),
    });

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
      accountStats,
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
