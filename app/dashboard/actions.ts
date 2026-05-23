"use server";

import { revalidatePath } from "next/cache";

import { ensureUserProfile } from "@/lib/dashboard/load-dashboard-data";
import {
  calculateOrderTotal,
  getProduct,
  isProxyProduct,
  type ProxyProduct,
} from "@/lib/pricing";
import { createClient } from "@/utils/supabase/server";

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: "You must be signed in." as const, supabase: null, user: null };
  }

  return { error: null, supabase, user };
}

export async function placeOrder(input: {
  proxyType: ProxyProduct;
  quantity: number;
}) {
  const auth = await getAuthenticatedUser();
  if (auth.error || !auth.supabase || !auth.user) {
    return { error: auth.error ?? "Unauthorized" };
  }

  if (!isProxyProduct(input.proxyType)) {
    return { error: "Unknown product type." };
  }

  const product = getProduct(input.proxyType)!;
  const quantity = Number(input.quantity);
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return { error: "Enter a valid quantity greater than zero." };
  }

  if (product.unit === "ip" && !Number.isInteger(quantity)) {
    return { error: "Enter a whole number of IPs for this product." };
  }

  const profile = await ensureUserProfile(auth.supabase, auth.user);
  if (profile.error) {
    return { error: profile.error };
  }

  const totalPrice = calculateOrderTotal(input.proxyType, quantity);
  const currentBalance = profile.balance;

  if (currentBalance < totalPrice) {
    return {
      error: `Insufficient balance. You need $${totalPrice.toFixed(2)} but have $${currentBalance.toFixed(2)}.`,
    };
  }

  const newBalance = Math.round((currentBalance - totalPrice) * 100) / 100;

  const { error: balanceError } = await auth.supabase
    .from("profiles")
    .update({ balance: newBalance })
    .eq("id", auth.user.id);

  if (balanceError) {
    return { error: balanceError.message };
  }

  const { data: order, error: orderError } = await auth.supabase
    .from("orders")
    .insert({
      user_id: auth.user.id,
      proxy_type: input.proxyType,
      quantity,
      total_price: totalPrice,
      status: "pending",
    })
    .select("id")
    .single();

  if (orderError || !order) {
    await auth.supabase
      .from("profiles")
      .update({ balance: currentBalance })
      .eq("id", auth.user.id);
    return { error: orderError?.message ?? "Could not create order." };
  }

  revalidatePath("/dashboard");
  return { success: true, newBalance, orderId: order.id };
}
