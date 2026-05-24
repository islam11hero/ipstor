import Link from "next/link";
import nextDynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/icons";

import { AdminLoading } from "@/components/admin/admin-loading";
import { Button } from "@/components/ui/button";
import { fetchPendingDeposits, fetchRegisteredAccounts } from "@/lib/admin-data";
import { isAdminEmail } from "@/lib/admin";
import type { PendingOrder } from "@/lib/types/admin";
import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";

const AdminPanel = nextDynamic(
  () => import("@/components/admin/admin-panel").then((mod) => mod.AdminPanel),
  { loading: () => <AdminLoading /> }
);

export const dynamic = "force-dynamic";

type OrderRow = {
  id: string;
  user_id: string;
  proxy_type: string;
  quantity: number;
  total_price: number;
  created_at: string;
  tier_id?: string | null;
  addons_json?: string[] | null;
};

async function fetchPendingOrders(
  supabase: Awaited<ReturnType<typeof getDataClient>>
): Promise<PendingOrder[]> {
  const enriched = await supabase
    .from("orders")
    .select(
      "id, user_id, proxy_type, quantity, total_price, created_at, tier_id, addons_json"
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const result =
    enriched.error &&
    (enriched.error.message.includes("tier_id") ||
      enriched.error.message.includes("addons_json"))
      ? await supabase
          .from("orders")
          .select("id, user_id, proxy_type, quantity, total_price, created_at")
          .eq("status", "pending")
          .order("created_at", { ascending: false })
      : enriched;

  return ((result.data as OrderRow[] | null) ?? []).map((row) => ({
    id: row.id,
    user_id: row.user_id,
    proxy_type: row.proxy_type,
    quantity: Number(row.quantity),
    total_price: Number(row.total_price),
    created_at: row.created_at,
    tier_id: row.tier_id ?? null,
    addon_ids: Array.isArray(row.addons_json)
      ? row.addons_json.filter((item): item is string => typeof item === "string")
      : [],
  }));
}

async function getDataClient() {
  return createServiceClient() ?? (await createClient());
}

export default async function AdminPage() {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!isAdminEmail(user.email)) {
    redirect("/dashboard?error=admin_access_denied");
  }

  const supabase = await getDataClient();

  const [deposits, orders, profilesCountResult, accounts] = await Promise.all([
    fetchPendingDeposits(supabase),
    fetchPendingOrders(supabase),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    fetchRegisteredAccounts(supabase),
  ]);

  const activeUserCount = profilesCountResult.count ?? 0;

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100">
      <header className="border-b border-white/[0.06] bg-[#050505]/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandLogo size={36} trigger="hover" />
            <span className="font-heading text-base font-semibold tracking-tight text-white">
              IP Nova
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" render={<Link href="/dashboard" />}>
              Dashboard
            </Button>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <AdminPanel
          deposits={deposits}
          orders={orders}
          accounts={accounts}
          activeUserCount={activeUserCount}
        />
      </main>
    </div>
  );
}
