"use client";

import { cn } from "@/lib/utils";

type AnimatedShinyTextProps = {
  children: React.ReactNode;
  className?: string;
};

export function AnimatedShinyText({ children, className }: AnimatedShinyTextProps) {
  return (
    <span
      className={cn(
        "animate-shiny-text bg-gradient-to-r from-emerald-200 via-white to-cyan-200 bg-[length:200%_auto] bg-clip-text text-transparent",
        className
      )}
    >
      {children}
    </span>
  );
}
