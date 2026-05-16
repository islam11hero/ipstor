import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Network } from "lucide-react";

import { AdminPanel } from "@/components/admin/admin-panel";
import { Button } from "@/components/ui/button";
import { fetchPendingDeposits } from "@/lib/admin-data";
import { isAdminEmail } from "@/lib/admin";
import type { PendingOrder } from "@/lib/types/admin";
import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";

export const dynamic = "force-dynamic";

type OrderRow = {
  id: string;
  user_id: string;
  proxy_type: string;
  quantity: number;
  total_price: number;
  created_at: string;
};

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

  const [deposits, ordersResult, profilesCountResult] = await Promise.all([
    fetchPendingDeposits(supabase),
    supabase
      .from("orders")
      .select("id, user_id, proxy_type, quantity, total_price, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
  ]);

  const activeUserCount = profilesCountResult.count ?? 0;

  const orders: PendingOrder[] = (
    (ordersResult.data as OrderRow[] | null) ?? []
  ).map((row) => ({
    id: row.id,
    user_id: row.user_id,
    proxy_type: row.proxy_type,
    quantity: Number(row.quantity),
    total_price: Number(row.total_price),
    created_at: row.created_at,
  }));

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100">
      <header className="border-b border-white/[0.06] bg-[#050505]/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Network className="h-6 w-6 shrink-0 text-emerald-400" aria-hidden />
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

      <main className="mx-auto max-w-6xl px-6 py-10">
        <Suspense fallback={null}>
          <AdminPanel
            deposits={deposits}
            orders={orders}
            activeUserCount={activeUserCount}
          />
        </Suspense>
      </main>
    </div>
  );
}
