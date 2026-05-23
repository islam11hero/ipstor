import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { FlashToast } from "@/components/dashboard/flash-toast";
import { SearchParamsSuspenseFallback } from "@/components/search-params-suspense-fallback";
import { Button } from "@/components/ui/button";
import { isAdminEmail } from "@/lib/admin";
import type { DashboardData, UserDeposit, UserProxy } from "@/lib/types/dashboard";
import { createClient } from "@/utils/supabase/server";

/** Data is fetched here (SSR); interactive UI including Add Funds → `/api/payment` is in `DashboardClient`. */

export const dynamic = "force-dynamic";

function dashboardLoadError(label: string, message: string) {
  return `${label}: ${message}`;
}

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

  const loadErrors: string[] = [];

  if (profileResult.error) {
    loadErrors.push(
      dashboardLoadError("Account balance", profileResult.error.message)
    );
  } else if (!profileResult.data) {
    loadErrors.push(
      dashboardLoadError(
        "Account balance",
        "Your profile record was not found. Please contact support."
      )
    );
  }

  if (proxiesResult.error) {
    loadErrors.push(
      dashboardLoadError("Proxy list", proxiesResult.error.message)
    );
  }

  if (depositsResult.error) {
    loadErrors.push(
      dashboardLoadError("Deposit history", depositsResult.error.message)
    );
  }

  if (loadErrors.length > 0) {
    return (
      <>
        <Suspense fallback={<SearchParamsSuspenseFallback />}>
          <FlashToast />
        </Suspense>
        <DashboardShell>
          <div
            className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-6 px-6 py-16 text-center"
            role="alert"
          >
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-white">
                Could not load your dashboard
              </h1>
              <p className="text-sm text-zinc-400">
                We could not fetch your account data. Details below may help
                support diagnose the issue.
              </p>
            </div>
            <ul className="w-full space-y-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-left text-sm text-red-200/90">
              {loadErrors.map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
            <Button variant="outline" size="sm" render={<Link href="/dashboard" />}>
              Try again
            </Button>
          </div>
        </DashboardShell>
      </>
    );
  }

  const idSeg = user.id.split("-")[0] ?? "nova";

  const data: DashboardData = {
    email: user.email ?? "",
    balance: Number(profileResult.data!.balance ?? 0),
    proxies: (proxiesResult.data ?? []) as UserProxy[],
    deposits: (depositsResult.data ?? []) as UserDeposit[],
    isAdmin: isAdminEmail(user.email),
    referralCode: `usr_${idSeg}`,
  };

  return (
    <>
      <Suspense fallback={<SearchParamsSuspenseFallback />}>
        <FlashToast />
      </Suspense>
      <DashboardShell>
        <DashboardClient initialData={data} />
      </DashboardShell>
    </>
  );
}
