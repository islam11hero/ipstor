import { ShareNetwork } from "@phosphor-icons/react/ssr";

import { cn } from "@/lib/utils";

/** Lightweight static brand mark — no Lordicon runtime. */
export function BrandMark({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <ShareNetwork
      size={size}
      weight="duotone"
      className={cn("shrink-0 text-emerald-400", className)}
      aria-hidden
    />
  );
}
