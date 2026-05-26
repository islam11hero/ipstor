import Image from "next/image";

import { cn } from "@/lib/utils";

type OfferArtworkProps = {
  src: string;
  alt: string;
  className?: string;
  size?: number;
};

/**
 * Renders offer illustrations on the site background.
 * SVG assets are preferred (true transparency). PNGs use screen blend as fallback.
 */
export function OfferArtwork({
  src,
  alt,
  className,
  size = 72,
}: OfferArtworkProps) {
  const isSvg = src.endsWith(".svg");

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center",
        "rounded-xl border border-white/[0.06] bg-[radial-gradient(ellipse_80%_70%_at_50%_30%,rgba(16,185,129,0.14),transparent)]",
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={cn(
          "pointer-events-none object-contain p-1.5",
          !isSvg && "mix-blend-screen opacity-90"
        )}
        draggable={false}
      />
    </div>
  );
}
