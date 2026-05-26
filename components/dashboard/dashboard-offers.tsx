"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DASHBOARD_PROMO_BANNERS,
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

type DashboardPromoBannersProps = {
  onNavigate: (view: "funds" | "overview") => void;
};

export function DashboardPromoBanners({ onNavigate }: DashboardPromoBannersProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {DASHBOARD_PROMO_BANNERS.map((banner, index) => (
        <motion.article
          key={banner.id}
          className={cn(
            shellGlass,
            "group relative overflow-hidden p-0 transition-colors hover:border-emerald-500/25"
          )}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.06, duration: 0.35 }}
        >
          <div className="relative aspect-[16/7] w-full overflow-hidden">
            <Image
              src={banner.image}
              alt=""
              fill
              className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/55 to-transparent" />
          </div>
          <div className="relative -mt-2 space-y-3 px-5 pb-5 sm:px-6 sm:pb-6">
            <div>
              <h3 className="font-heading text-lg font-semibold text-white sm:text-xl">
                {banner.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                {banner.description}
              </p>
            </div>
            <motion.div {...hoverLift} {...tapScale}>
              <Button
                type="button"
                size="sm"
                className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-black hover:from-emerald-300 hover:to-cyan-300"
                onClick={() => onNavigate(banner.view)}
              >
                {banner.cta}
              </Button>
            </motion.div>
          </div>
        </motion.article>
      ))}
    </div>
  );
}

type ProductOfferCardProps = {
  product: ProductDefinition;
  onOrder: (productId: ProxyProduct) => void;
};

export function ProductOfferCard({ product, onOrder }: ProductOfferCardProps) {
  const visual = PRODUCT_OFFER_VISUALS[product.id];

  return (
    <article
      className={cn(
        shellGlass,
        "group flex flex-col overflow-hidden p-0 transition-colors hover:border-emerald-500/25 hover:bg-white/[0.03]"
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[radial-gradient(ellipse_80%_60%_at_50%_20%,rgba(16,185,129,0.12),transparent)]">
        <Image
          src={visual.image}
          alt={product.label}
          fill
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold tracking-wider text-emerald-400/90 uppercase">
              {visual.highlight}
            </p>
            <h3 className="mt-1 font-heading text-lg font-semibold text-white">
              {product.label}
            </h3>
          </div>
          <span className="shrink-0 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
            {formatProductUnitPrice(product)}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-zinc-500">{visual.tagline}</p>
        <p className="text-sm text-zinc-400">{product.description}</p>
        <ul className="space-y-2 text-sm text-zinc-500">
          <li className="flex items-center gap-2">
            <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
            Wallet checkout — instant debit
          </li>
          <li className="flex items-center gap-2">
            <span className="size-1.5 shrink-0 rounded-full bg-cyan-400" />
            Operator fulfillment after order
          </li>
        </ul>
        <Button
          type="button"
          variant="outline"
          className="mt-auto w-full border-emerald-500/40 bg-transparent text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
          onClick={() => onOrder(product.id)}
        >
          Order now
        </Button>
      </div>
    </article>
  );
}
