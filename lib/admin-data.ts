import type { SupabaseClient } from "@supabase/supabase-js";

import type { PendingDeposit } from "@/lib/types/admin";

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
