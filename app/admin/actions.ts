"use server";

import { revalidatePath } from "next/cache";

import { ADMIN_EMAIL } from "@/lib/admin";
import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email || user.email !== ADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }

  return user;
}

async function getPrivilegedClient() {
  await assertAdmin();
  return createServiceClient() ?? (await createClient());
}

function revalidateDashboardAndAdmin() {
  revalidatePath("/dashboard");
  revalidatePath("/admin");
}

export async function approveDeposit(depositId: string) {
  try {
    const supabase = await getPrivilegedClient();

    const { data: deposit, error: fetchError } = await supabase
      .from("deposits")
      .select("id, user_id, amount, status")
      .eq("id", depositId)
      .eq("status", "pending")
      .single();

    if (fetchError || !deposit) {
      return { error: "Deposit not found or already processed." };
    }

    const { data: approvedDeposit, error: depositError } = await supabase
      .from("deposits")
      .update({ status: "approved" })
      .eq("id", depositId)
      .eq("status", "pending")
      .select("id")
      .single();

    if (depositError || !approvedDeposit) {
      return { error: "Deposit not found or already processed." };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", deposit.user_id)
      .single();

    if (profileError || !profile) {
      await supabase
        .from("deposits")
        .update({ status: "pending" })
        .eq("id", depositId);
      return { error: "User profile not found." };
    }

    const newBalance = Number(profile.balance ?? 0) + Number(deposit.amount);

    const { error: balanceError } = await supabase
      .from("profiles")
      .update({ balance: newBalance })
      .eq("id", deposit.user_id);

    if (balanceError) {
      await supabase
        .from("deposits")
        .update({ status: "pending" })
        .eq("id", depositId);
      return { error: balanceError.message };
    }

    revalidateDashboardAndAdmin();
    return { success: true };
  } catch {
    return { error: "You are not authorized to perform this action." };
  }
}

export async function fulfillOrder(input: {
  orderId: string;
  ipAddress: string;
  port: string;
  username: string;
  password: string;
}) {
  try {
    const supabase = await getPrivilegedClient();

    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("id, user_id, status")
      .eq("id", input.orderId)
      .eq("status", "pending")
      .single();

    if (fetchError || !order) {
      return { error: "Order not found or already fulfilled." };
    }

    const { data: completedOrder, error: orderError } = await supabase
      .from("orders")
      .update({ status: "completed" })
      .eq("id", order.id)
      .eq("status", "pending")
      .select("id")
      .single();

    if (orderError || !completedOrder) {
      return { error: "Order not found or already fulfilled." };
    }

    const { error: proxyError } = await supabase.from("user_proxies").insert({
      user_id: order.user_id,
      order_id: order.id,
      ip_address: input.ipAddress.trim(),
      port: input.port.trim(),
      username: input.username.trim(),
      password: input.password,
    });

    if (proxyError) {
      await supabase
        .from("orders")
        .update({ status: "pending" })
        .eq("id", order.id);
      return { error: proxyError.message };
    }

    revalidateDashboardAndAdmin();
    return { success: true };
  } catch {
    return { error: "You are not authorized to perform this action." };
  }
}
