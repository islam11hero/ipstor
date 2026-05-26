"use client";

import type { Icon } from "@phosphor-icons/react";
import { Lightning, SquaresFour } from "@phosphor-icons/react";
import { motion } from "framer-motion";

import { OfferArtwork } from "@/components/ui/offer-artwork";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DASHBOARD_PROMO_STRIPS,
  PRODUCT_OFFER_VISUALS,
} from "@/lib/dashboard/product-offers";
import type { ProxyProduct } from "@/lib/pricing";
import {
  formatProductUnitPrice,
  type ProductDefinition,
} from "@/lib/pricing";
import { hoverLift, tapScale } from "@/lib/motion";

const shellGlass =
  "rounded-2xl border border-white/[0.05] bg-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl";

const PROMO_ICONS: Record<string, Icon> = {
  topup: Lightning,
  catalog: SquaresFour,
};

type DashboardPromoBannersProps = {
  onNavigate: (view: "funds" | "overview") => void;
};

/** Compact text-first promo row — no full-bleed raster banners. */
export function DashboardPromoBanners({ onNavigate }: DashboardPromoBannersProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {DASHBOARD_PROMO_STRIPS.map((strip, index) => {
        const Icon = PROMO_ICONS[strip.id] ?? SquaresFour;
        return (
          <motion.article
            key={strip.id}
            className={cn(
              shellGlass,
              "flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5",
              `bg-gradient-to-br ${strip.accent}`
            )}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
                <Icon className="size-5 text-emerald-400" weight="duotone" />
              </div>
              <div className="min-w-0">
                <h3 className="font-heading text-sm font-semibold text-white sm:text-base">
                  {strip.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500 sm:text-sm">
                  {strip.description}
                </p>
              </div>
            </div>
            <motion.div {...hoverLift} {...tapScale} className="shrink-0">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="w-full border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 sm:w-auto"
                onClick={() => onNavigate(strip.view)}
              >
                {strip.cta}
              </Button>
            </motion.div>
          </motion.article>
        );
      })}
    </div>
  );
}

type ProductOfferCardProps = {
  product: ProductDefinition;
  productIcon: Icon;
  onOrder: (productId: ProxyProduct) => void;
};

export function ProductOfferCard({
  product,
  productIcon: ProductIcon,
  onOrder,
}: ProductOfferCardProps) {
  const visual = PRODUCT_OFFER_VISUALS[product.id];

  return (
    <article
      className={cn(
        shellGlass,
        "group relative flex flex-col gap-4 p-5 transition-colors hover:border-emerald-500/20 sm:p-6"
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
          <ProductIcon className="size-5 text-emerald-400" weight="duotone" />
        </div>
        <div className="min-w-0 flex-1 pr-16">
          <p className="text-[10px] font-semibold tracking-wider text-emerald-400/90 uppercase">
            {visual.highlight}
          </p>
          <h3 className="mt-0.5 font-heading text-base font-semibold text-white">
            {product.label}
          </h3>
          <p className="mt-1 text-sm text-zinc-500">{visual.tagline}</p>
        </div>
        <OfferArtwork
          src={visual.artwork}
          alt=""
          size={64}
          className="absolute top-4 right-4 border-0 bg-transparent opacity-80 transition-opacity group-hover:opacity-100"
        />
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
        <span className="font-mono text-sm font-medium text-emerald-300">
          {formatProductUnitPrice(product)}
        </span>
        <span className="text-xs text-zinc-500">Manual fulfillment</span>
      </div>

      <Button
        type="button"
        size="sm"
        className="w-full bg-gradient-to-r from-emerald-400/90 to-cyan-400/90 text-black hover:from-emerald-300 hover:to-cyan-300"
        onClick={() => onOrder(product.id)}
      >
        Order now
      </Button>
    </article>
  );
}
