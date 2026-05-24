"use client";

import { CircleNotch } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

export function IconSpinner({
  className,
  size = 20,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <CircleNotch
      className={cn("animate-spin", className)}
      size={size}
      weight="bold"
      aria-hidden
    />
  );
}
