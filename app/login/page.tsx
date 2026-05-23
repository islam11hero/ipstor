import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { getPostAuthRedirectPath } from "@/lib/admin";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(getPostAuthRedirectPath(user.email));
  }

  const { tab } = await searchParams;
  const defaultTab = tab === "register" ? "register" : "login";

  return <AuthForm defaultTab={defaultTab} />;
}
