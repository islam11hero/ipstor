"use client";

import { motion } from "framer-motion";
import { useMemo, useState, useTransition } from "react";
import type { Icon } from "@phosphor-icons/react";
import { ShoppingCart, Sparkle } from "@phosphor-icons/react";

import { IconSpinner, LordIcon } from "@/components/icons";
import { toast } from "sonner";

import { placeOrder } from "@/app/dashboard/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { hoverLift, tapScale } from "@/lib/motion";
import {
  calculateOrderQuote,
  formatTierUnitPrice,
  getProductPageConfig,
  type ProductAddon,
} from "@/lib/product-catalog";
import {
  formatProductQuantityLabel,
  formatProductUnitPrice,
  getProduct,
  type ProxyProduct,
} from "@/lib/pricing";
import { cn } from "@/lib/utils";

const shellGlass =
  "rounded-2xl border border-white/[0.05] bg-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl";

type ProductPurchasePageProps = {
  productId: ProxyProduct;
  balance: number;
  icon: Icon;
  onOrderPlaced: (newBalance?: number) => void;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function addonPriceLabel(addon: ProductAddon, productUnit: "ip" | "gb"): string {
  if (addon.pricing.kind === "flat") {
    return `+${formatCurrency(addon.pricing.amount)}`;
  }
  const suffix = productUnit === "gb" ? "/GB" : "/IP";
  return `+${formatCurrency(addon.pricing.amount)}${suffix}`;
}

export function ProductPurchasePage({
  productId,
  balance,
  icon: Icon,
  onOrderPlaced,
}: ProductPurchasePageProps) {
  const product = getProduct(productId)!;
  const config = getProductPageConfig(productId);
  const [tierId, setTierId] = useState(config.tiers[0]!.id);
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(String(config.suggestedQuantities[1] ?? 10));
  const [isPending, startTransition] = useTransition();

  const parsedQuantity = Number(quantity) || 0;

  const quote = useMemo(
    () =>
      calculateOrderQuote({
        proxyType: productId,
        quantity: parsedQuantity,
        tierId,
        addonIds,
      }),
    [productId, parsedQuantity, tierId, addonIds]
  );

  function toggleAddon(addonId: string) {
    setAddonIds((current) =>
      current.includes(addonId)
        ? current.filter((id) => id !== addonId)
        : [...current, addonId]
    );
  }

  function handlePlaceOrder() {
    startTransition(async () => {
      const result = await placeOrder({
        proxyType: productId,
        quantity: parsedQuantity,
        tierId,
        addonIds,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Order placed — our team will fulfill it manually.");
      onOrderPlaced(result.newBalance);
    });
  }

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <section className={cn(shellGlass, "overflow-hidden")}>
        <motion.div
          className="border-b border-white/[0.06] bg-gradient-to-br from-emerald-500/[0.08] via-transparent to-cyan-500/[0.06] px-6 py-8 sm:px-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
        >
          <motion.div
            className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <motion.div
              className="flex items-start gap-4"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 }}
            >
              <motion.div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/25 bg-emerald-500/10 ring-1 ring-emerald-500/20">
                <Icon size={34} weight="duotone" className="text-emerald-400" />
              </motion.div>
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-emerald-400/90 uppercase">
                  Product page
                </p>
                <h2 className="font-heading mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {product.label}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
                  {config.tagline}
                </p>
              </div>
            </motion.div>
            <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-right">
              <p className="text-xs text-zinc-500">Starting at</p>
              <p className="font-heading text-2xl font-bold text-cyan-300">
                {formatProductUnitPrice(product)}
              </p>
            </div>
          </motion.div>
          <ul className="mt-6 grid gap-2 sm:grid-cols-3">
            {config.highlights.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2 text-sm text-zinc-400"
              >
                <Sparkle className="mt-0.5 size-3.5 shrink-0 text-emerald-400" weight="fill" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="font-heading text-lg font-semibold text-white">
            Choose your plan
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Higher tiers increase unit pricing and unlock premium operator handling.
          </p>
        </div>
        <motion.div className="grid gap-4 lg:grid-cols-3">
          {config.tiers.map((tier) => {
            const selected = tierId === tier.id;
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => setTierId(tier.id)}
                className={cn(
                  "rounded-2xl border p-5 text-left transition-all",
                  selected
                    ? "border-cyan-500/45 bg-gradient-to-br from-cyan-500/15 to-zinc-950/80 ring-1 ring-cyan-500/25"
                    : cn(shellGlass, "hover:border-emerald-500/20")
                )}
              >
                <motion.div
                  className="flex items-start justify-between gap-2"
                  initial={false}
                  animate={selected ? { scale: 1.01 } : { scale: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  <div>
                    <p className="font-heading text-lg font-semibold text-white">
                      {tier.label}
                    </p>
                    <p className="mt-1 text-sm font-medium text-cyan-300">
                      {formatTierUnitPrice(product, tier)}
                    </p>
                  </div>
                  {tier.badge ? (
                    <Badge className="border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
                      {tier.badge}
                    </Badge>
                  ) : null}
                </motion.div>
                <p className="mt-3 text-sm text-zinc-400">{tier.description}</p>
              </button>
            );
          })}
        </motion.div>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="font-heading text-lg font-semibold text-white">
            Premium add-ons
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Optional upgrades applied to this order — billed with your base quantity.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {config.addons.map((addon) => {
            const checked = addonIds.includes(addon.id);
            return (
              <label
                key={addon.id}
                className={cn(
                  "flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors",
                  checked
                    ? "border-emerald-500/35 bg-emerald-500/[0.06]"
                    : "border-white/[0.08] bg-white/[0.02] hover:border-white/15"
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleAddon(addon.id)}
                  className="mt-1 size-4 rounded border-white/20 bg-zinc-950 accent-emerald-500"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-zinc-100">{addon.label}</span>
                    <span className="text-sm font-medium text-emerald-300">
                      {addonPriceLabel(addon, product.unit)}
                    </span>
                    {addon.popular ? (
                      <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-200">
                        Popular
                      </Badge>
                    ) : null}
                  </span>
                  <span className="mt-1 block text-sm text-zinc-500">
                    {addon.description}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className={cn(shellGlass)}>
          <CardHeader>
            <CardTitle>Order calculator</CardTitle>
            <CardDescription className="text-zinc-500">
              {product.unit === "ip"
                ? "How many IPs do you need on this plan?"
                : "How many gigabytes (GB) should we provision?"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <motion.div
              className="flex flex-wrap gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              {config.suggestedQuantities.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  size="sm"
                  variant="outline"
                  className={cn(
                    "border-white/12",
                    String(preset) === quantity && "border-emerald-500/40 bg-emerald-500/10"
                  )}
                  onClick={() => setQuantity(String(preset))}
                >
                  {formatProductQuantityLabel(product, preset)}
                </Button>
              ))}
            </motion.div>
            <div className="space-y-2">
              <Label htmlFor={`quantity-${productId}`}>
                {product.unit === "ip" ? "Quantity (IPs)" : "Quantity (GB)"}
              </Label>
              <Input
                id={`quantity-${productId}`}
                type="number"
                min={1}
                step={product.unit === "ip" ? 1 : 0.1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="border-white/10 bg-zinc-950/80"
              />
            </div>
            <p className="text-xs text-zinc-500">
              Manual fulfillment after payment. Track delivery in My orders.
            </p>
            <motion.div className="w-full" {...hoverLift} {...tapScale}>
              <Button
                className="w-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-black shadow-lg shadow-cyan-500/20 hover:from-emerald-300 hover:to-cyan-300"
                disabled={isPending || parsedQuantity <= 0}
                onClick={handlePlaceOrder}
              >
                {isPending ? (
                  <>
                    <IconSpinner className="size-5" />
                    Processing…
                  </>
                ) : (
                  <>
                    <ShoppingCart className="size-4" />
                    Place order · {formatCurrency(quote.total)}
                  </>
                )}
              </Button>
            </motion.div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            shellGlass,
            "border-emerald-500/15 bg-gradient-to-br from-emerald-500/[0.08] via-white/[0.02] to-cyan-500/[0.06]"
          )}
        >
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
            <CardDescription className="text-zinc-500">
              {config.tiers.find((tier) => tier.id === tierId)?.label} plan with
              selected add-ons
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="flex justify-between">
              <span className="text-zinc-500">Product</span>
              <span className="font-medium">{product.shortLabel}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-zinc-500">Plan</span>
              <span className="font-medium">{quote.tierLabel}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-zinc-500">Quantity</span>
              <span className="font-medium">
                {parsedQuantity
                  ? formatProductQuantityLabel(product, parsedQuantity)
                  : "—"}
              </span>
            </p>
            <p className="flex justify-between">
              <span className="text-zinc-500">Unit price</span>
              <span className="font-medium">
                {product.unit === "gb"
                  ? `$${quote.unitPrice.toFixed(2)}/GB`
                  : `$${quote.unitPrice.toFixed(2)}/IP`}
              </span>
            </p>
            <p className="flex justify-between">
              <span className="text-zinc-500">Base subtotal</span>
              <span className="font-medium">{formatCurrency(quote.baseSubtotal)}</span>
            </p>
            {quote.tierSurcharge > 0 ? (
              <p className="flex justify-between text-amber-200/90">
                <span>Plan uplift</span>
                <span>+{formatCurrency(quote.tierSurcharge)}</span>
              </p>
            ) : null}
            {quote.addonLines.map((line) => (
              <p key={line.label} className="flex justify-between text-emerald-200/90">
                <span>{line.label}</span>
                <span>+{formatCurrency(line.amount)}</span>
              </p>
            ))}
            <Separator className="bg-white/10" />
            <p className="flex justify-between text-base">
              <span className="font-medium">Total</span>
              <span className="text-xl font-bold text-cyan-300">
                {formatCurrency(quote.total)}
              </span>
            </p>
            <p className="flex justify-between text-xs">
              <span className="text-zinc-500">Your balance</span>
              <span
                className={cn(
                  balance >= quote.total ? "text-emerald-400" : "text-red-400"
                )}
              >
                {formatCurrency(balance)}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
