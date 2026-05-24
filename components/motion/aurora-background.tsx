"use client";

import { cn } from "@/lib/utils";

type AuroraBackgroundProps = {
  className?: string;
  showRadialGradient?: boolean;
};

export function AuroraBackground({
  className,
  showRadialGradient = true,
}: AuroraBackgroundProps) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 -z-20 overflow-hidden bg-[#050505]",
        className
      )}
      aria-hidden
    >
      <div
        className={cn(
          "absolute -inset-[10px] opacity-40 blur-[100px] will-change-transform",
          "[--aurora:repeating-linear-gradient(100deg,#10b981_10%,#22d3ee_15%,#5eead4_20%,#34d399_25%,#67e8f9_30%)]",
          "[background-image:var(--aurora),var(--aurora)] [background-size:300%_200%,200%_100%]",
          "[background-position:50%_50%,50%_50%]",
          "animate-aurora"
        )}
      />
      {showRadialGradient ? (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.1),transparent_55%)]" />
      ) : null}
    </div>
  );
}
