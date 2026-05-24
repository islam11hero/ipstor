import type { SupabaseClient } from "@supabase/supabase-js";

import type { UserDeposit, UserOrder, UserProxy } from "@/lib/types/dashboard";
import { computeAccountStats } from "@/lib/dashboard/account-stats";
import { createServiceClient } from "@/utils/supabase/service";

export type DashboardLoadIssue = {
  label: string;
  message: string;
  fatal: boolean;
};

export type DashboardLoadResult = {
  balance: number;
  memberSince: string | null;
  proxies: UserProxy[];
  deposits: UserDeposit[];
  orders: UserOrder[];
  accountStats: ReturnType<typeof computeAccountStats>;
  issues: DashboardLoadIssue[];
};

function isMissingRelation(message: string, relation: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes(`'public.${relation}'`) ||
    m.includes(`public.${relation}`) ||
    m.includes(`relation "${relation}" does not exist`) ||
    m.includes(`table '${relation}'`)
  );
}

function isMissingColumn(message: string, column: string): boolean {
  return message.toLowerCase().includes(column.toLowerCase());
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

export async function ensureUserProfile(
  supabase: SupabaseClient,
  user: { id: string; email?: string | null }
): Promise<{ balance: number; memberSince: string | null; error: string | null }> {
  const existing = await supabase
    .from("profiles")
    .select("balance, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (existing.data) {
    return {
      balance: Number(existing.data.balance ?? 0),
      memberSince: existing.data.created_at ?? null,
      error: null,
    };
  }

  if (existing.error && isMissingRelation(existing.error.message, "profiles")) {
    return {
      balance: 0,
      memberSince: null,
      error:
        "Database table public.profiles is missing. Run supabase/setup_all.sql in the Supabase SQL Editor.",
    };
  }

  const service = createServiceClient();
  if (service) {
    const { error: upsertErr } = await service.from("profiles").upsert(
      {
        id: user.id,
        email: user.email ?? null,
        balance: 0,
      },
      { onConflict: "id" }
    );

    if (!upsertErr) {
      const retry = await supabase
        .from("profiles")
        .select("balance, created_at")
        .eq("id", user.id)
        .maybeSingle();
      if (retry.data) {
        return {
          balance: Number(retry.data.balance ?? 0),
          memberSince: retry.data.created_at ?? null,
          error: null,
        };
      }
    }
  }

  const inserted = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      email: user.email ?? null,
      balance: 0,
    })
    .select("balance, created_at")
    .maybeSingle();

  if (inserted.data) {
    return {
      balance: Number(inserted.data.balance ?? 0),
      memberSince: inserted.data.created_at ?? null,
      error: null,
    };
  }

  const message =
    inserted.error?.message ??
    existing.error?.message ??
    "Could not create your profile row.";

  return { balance: 0, memberSince: null, error: message };
}

async function fetchUserProxies(
  supabase: SupabaseClient,
  userId: string
): Promise<{ proxies: UserProxy[]; error: string | null }> {
  const modern = await supabase
    .from("user_proxies")
    .select("id, ip_address, port, username, password, created_at, order_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(2000);

  if (!modern.error) {
    return {
      proxies: (modern.data ?? []).map((row) =>
        mapProxyRow(row as Record<string, unknown>)
      ),
      error: null,
    };
  }

  if (isMissingRelation(modern.error.message, "user_proxies")) {
    return { proxies: [], error: modern.error.message };
  }

  if (
    isMissingColumn(modern.error.message, "username") ||
    isMissingColumn(modern.error.message, "password")
  ) {
    const legacy = await supabase
      .from("user_proxies")
      .select("id, ip_address, port, proxy_user, proxy_pass, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(2000);

    if (!legacy.error) {
      return {
        proxies: (legacy.data ?? []).map((row) =>
          mapProxyRow(row as Record<string, unknown>)
        ),
        error: null,
      };
    }

    const minimal = await supabase
      .from("user_proxies")
      .select("id, ip_address, port, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(2000);

    if (!minimal.error) {
      return {
        proxies: (minimal.data ?? []).map((row) =>
          mapProxyRow(row as Record<string, unknown>)
        ),
        error: null,
      };
    }

    return { proxies: [], error: legacy.error.message };
  }

  return { proxies: [], error: modern.error.message };
}

async function fetchUserDeposits(
  supabase: SupabaseClient,
  userId: string
): Promise<{ deposits: UserDeposit[]; error: string | null }> {
  const result = await supabase
    .from("deposits")
    .select("id, amount, txid, status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (!result.error) {
    return { deposits: (result.data ?? []) as UserDeposit[], error: null };
  }

  if (isMissingRelation(result.error.message, "deposits")) {
    return { deposits: [], error: result.error.message };
  }

  return { deposits: [], error: result.error.message };
}

async function fetchUserOrders(
  supabase: SupabaseClient,
  userId: string
): Promise<{ orders: UserOrder[]; error: string | null }> {
  const enriched = await supabase
    .from("orders")
    .select(
      "id, proxy_type, quantity, total_price, status, created_at, tier_id, addons_json"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  const result =
    enriched.error &&
    (enriched.error.message.includes("tier_id") ||
      enriched.error.message.includes("addons_json"))
      ? await supabase
          .from("orders")
          .select("id, proxy_type, quantity, total_price, status, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(50)
      : enriched;

  if (!result.error) {
    return {
      orders: (result.data ?? []).map((row) => mapOrderRow(row as Record<string, unknown>)),
      error: null,
    };
  }

  if (isMissingRelation(result.error.message, "orders")) {
    return { orders: [], error: result.error.message };
  }

  return { orders: [], error: result.error.message };
}

function mapOrderRow(row: Record<string, unknown>): UserOrder {
  const addonRaw = row.addons_json;
  const addonIds = Array.isArray(addonRaw)
    ? addonRaw.filter((item): item is string => typeof item === "string")
    : [];

  return {
    id: String(row.id),
    proxy_type: String(row.proxy_type),
    quantity: Number(row.quantity),
    total_price: Number(row.total_price),
    status: String(row.status ?? "pending"),
    created_at: String(row.created_at ?? new Date().toISOString()),
    tier_id: typeof row.tier_id === "string" ? row.tier_id : null,
    addon_ids: addonIds,
  };
}

export async function loadDashboardData(
  supabase: SupabaseClient,
  user: { id: string; email?: string | null }
): Promise<DashboardLoadResult> {
  const issues: DashboardLoadIssue[] = [];

  const [profile, proxiesResult, depositsResult, ordersResult] = await Promise.all([
    ensureUserProfile(supabase, user),
    fetchUserProxies(supabase, user.id),
    fetchUserDeposits(supabase, user.id),
    fetchUserOrders(supabase, user.id),
  ]);

  if (profile.error) {
    issues.push({
      label: "Account balance",
      message: profile.error,
      fatal: true,
    });
  }

  if (proxiesResult.error) {
    issues.push({
      label: "Proxy list",
      message: proxiesResult.error,
      fatal: isMissingRelation(proxiesResult.error, "user_proxies"),
    });
  }

  if (depositsResult.error) {
    issues.push({
      label: "Deposit history",
      message: depositsResult.error,
      fatal: isMissingRelation(depositsResult.error, "deposits"),
    });
  }

  if (ordersResult.error) {
    issues.push({
      label: "Order history",
      message: ordersResult.error,
      fatal: isMissingRelation(ordersResult.error, "orders"),
    });
  }

  const schemaFatal = issues.some(
    (i) =>
      i.fatal &&
      i.message.includes("Run supabase/setup_all.sql")
  );

  if (!schemaFatal && issues.some((i) => i.fatal)) {
    const setupHint =
      "Run supabase/setup_all.sql in Supabase → SQL Editor, then try again.";
    for (const issue of issues) {
      if (issue.fatal && !issue.message.includes("setup_all.sql")) {
        issue.message = `${issue.message} (${setupHint})`;
      }
    }
  }

  return {
    balance: profile.balance,
    memberSince: profile.memberSince,
    proxies: proxiesResult.proxies,
    deposits: depositsResult.deposits,
    orders: ordersResult.orders,
    accountStats: computeAccountStats({
      balance: profile.balance,
      memberSince: profile.memberSince,
      proxies: proxiesResult.proxies,
      deposits: depositsResult.deposits,
      orders: ordersResult.orders,
    }),
    issues,
  };
}
