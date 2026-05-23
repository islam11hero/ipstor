import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { FlashToast } from "@/components/dashboard/flash-toast";
import { SearchParamsSuspenseFallback } from "@/components/search-params-suspense-fallback";
import { Button } from "@/components/ui/button";
import { loadDashboardData } from "@/lib/dashboard/load-dashboard-data";
import { isAdminEmail } from "@/lib/admin";
import type { DashboardData } from "@/lib/types/dashboard";
import { createClient } from "@/utils/supabase/server";

/** Data is fetched here (SSR); interactive UI including Add Funds → `/api/payment` is in `DashboardClient`. */

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const loaded = await loadDashboardData(supabase, {
    id: user.id,
    email: user.email,
  });

  const fatalIssues = loaded.issues.filter((issue) => issue.fatal);

  if (fatalIssues.length > 0) {
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
                Supabase schema is out of sync with the app. Apply the setup SQL
                once, then try again.
              </p>
            </div>
            <ul className="w-full space-y-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-left text-sm text-red-200/90">
              {fatalIssues.map((issue) => (
                <li key={`${issue.label}-${issue.message}`}>
                  <span className="font-medium text-red-100">{issue.label}:</span>{" "}
                  {issue.message}
                </li>
              ))}
            </ul>
            <p className="text-xs text-zinc-500">
              Supabase Dashboard → SQL Editor → paste{" "}
              <code className="text-zinc-400">supabase/setup_all.sql</code>
            </p>
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
    balance: loaded.balance,
    proxies: loaded.proxies,
    deposits: loaded.deposits,
    orders: loaded.orders,
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
