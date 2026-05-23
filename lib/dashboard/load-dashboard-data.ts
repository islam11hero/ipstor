import type { SupabaseClient } from "@supabase/supabase-js";

import type { UserDeposit, UserProxy } from "@/lib/types/dashboard";
import { createServiceClient } from "@/utils/supabase/service";

export type DashboardLoadIssue = {
  label: string;
  message: string;
  fatal: boolean;
};

export type DashboardLoadResult = {
  balance: number;
  proxies: UserProxy[];
  deposits: UserDeposit[];
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
  };
}

export async function ensureUserProfile(
  supabase: SupabaseClient,
  user: { id: string; email?: string | null }
): Promise<{ balance: number; error: string | null }> {
  const existing = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", user.id)
    .maybeSingle();

  if (existing.data) {
    return { balance: Number(existing.data.balance ?? 0), error: null };
  }

  if (existing.error && isMissingRelation(existing.error.message, "profiles")) {
    return {
      balance: 0,
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
        .select("balance")
        .eq("id", user.id)
        .maybeSingle();
      if (retry.data) {
        return { balance: Number(retry.data.balance ?? 0), error: null };
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
    .select("balance")
    .maybeSingle();

  if (inserted.data) {
    return { balance: Number(inserted.data.balance ?? 0), error: null };
  }

  const message =
    inserted.error?.message ??
    existing.error?.message ??
    "Could not create your profile row.";

  return { balance: 0, error: message };
}

async function fetchUserProxies(
  supabase: SupabaseClient,
  userId: string
): Promise<{ proxies: UserProxy[]; error: string | null }> {
  const modern = await supabase
    .from("user_proxies")
    .select("id, ip_address, port, username, password, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

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
      .order("created_at", { ascending: false });

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
      .order("created_at", { ascending: false });

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

export async function loadDashboardData(
  supabase: SupabaseClient,
  user: { id: string; email?: string | null }
): Promise<DashboardLoadResult> {
  const issues: DashboardLoadIssue[] = [];

  const profile = await ensureUserProfile(supabase, user);
  if (profile.error) {
    issues.push({
      label: "Account balance",
      message: profile.error,
      fatal: true,
    });
  }

  const [proxiesResult, depositsResult] = await Promise.all([
    fetchUserProxies(supabase, user.id),
    fetchUserDeposits(supabase, user.id),
  ]);

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
    proxies: proxiesResult.proxies,
    deposits: depositsResult.deposits,
    issues,
  };
}
