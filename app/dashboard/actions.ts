"use server";

import { revalidatePath } from "next/cache";

import { ensureUserProfile } from "@/lib/dashboard/load-dashboard-data";
import {
  calculateOrderQuote,
  validateOrderSelection,
} from "@/lib/product-catalog";
import {
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
  tierId?: string;
  addonIds?: string[];
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

  const validated = validateOrderSelection({
    proxyType: input.proxyType,
    tierId: input.tierId ?? "standard",
    addonIds: input.addonIds ?? [],
  });
  if ("error" in validated) {
    return { error: validated.error };
  }

  const profile = await ensureUserProfile(auth.supabase, auth.user);
  if (profile.error) {
    return { error: profile.error };
  }

  const quote = calculateOrderQuote({
    proxyType: input.proxyType,
    quantity,
    tierId: validated.tierId,
    addonIds: validated.addonIds,
  });
  const totalPrice = quote.total;
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

  const orderPayload = {
    user_id: auth.user.id,
    proxy_type: input.proxyType,
    quantity,
    total_price: totalPrice,
    status: "pending" as const,
    tier_id: validated.tierId,
    addons_json: validated.addonIds,
  };

  let orderResult = await auth.supabase
    .from("orders")
    .insert(orderPayload)
    .select("id")
    .single();

  if (orderResult.error?.message?.includes("addons_json")) {
    const { tier_id: _tier, addons_json: _addons, ...legacyPayload } = orderPayload;
    orderResult = await auth.supabase
      .from("orders")
      .insert(legacyPayload)
      .select("id")
      .single();
  }

  const { data: order, error: orderError } = orderResult;

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
