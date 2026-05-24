"use client";

import { cn } from "@/lib/utils";

type BorderBeamProps = {
  className?: string;
  size?: number;
  duration?: number;
  colorFrom?: string;
  colorTo?: string;
};

export function BorderBeam({
  className,
  size = 220,
  duration = 10,
  colorFrom = "#34d399",
  colorTo = "#22d3ee",
}: BorderBeamProps) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]", className)}
      aria-hidden
    >
      <div
        className="absolute aspect-square animate-border-beam-spin bg-[conic-gradient(from_0deg,transparent_0deg,var(--color-from)_90deg,var(--color-to)_180deg,transparent_270deg)]"
        style={
          {
            width: size,
            left: "50%",
            top: "50%",
            translate: "-50% -50%",
            "--color-from": colorFrom,
            "--color-to": colorTo,
            animationDuration: `${duration}s`,
          } as React.CSSProperties
        }
      />
    </div>
  );
}
