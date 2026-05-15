import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { FlashToast } from "@/components/dashboard/flash-toast";
import { isAdminEmail } from "@/lib/admin";
import type { DashboardData, UserDeposit, UserProxy } from "@/lib/types/dashboard";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [profileResult, proxiesResult, depositsResult] = await Promise.all([
    supabase.from("profiles").select("balance").eq("id", user.id).single(),
    supabase
      .from("user_proxies")
      .select("id, ip_address, port, username, password, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("deposits")
      .select("id, amount, txid, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const data: DashboardData = {
    email: user.email ?? "",
    balance: Number(profileResult.data?.balance ?? 0),
    proxies: (proxiesResult.data ?? []) as UserProxy[],
    deposits: (depositsResult.data ?? []) as UserDeposit[],
    isAdmin: isAdminEmail(user.email),
  };

  return (
    <>
      <Suspense fallback={null}>
        <FlashToast />
      </Suspense>
      <DashboardShell>
        <DashboardClient initialData={data} />
      </DashboardShell>
    </>
  );
}
