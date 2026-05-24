"use client";

import { motion } from "framer-motion";
import type { IconProps } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

type MotionPhosphorProps = IconProps & {
  icon: React.ComponentType<IconProps>;
  hoverScale?: number;
  hoverRotate?: number;
  className?: string;
};

export function MotionPhosphor({
  icon: Icon,
  hoverScale = 1.12,
  hoverRotate = 0,
  className,
  weight = "duotone",
  ...props
}: MotionPhosphorProps) {
  return (
    <motion.span
      className={cn("inline-flex shrink-0", className)}
      whileHover={{ scale: hoverScale, rotate: hoverRotate }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
    >
      <Icon weight={weight} {...props} />
    </motion.span>
  );
}

export function StaticPhosphor({
  icon: Icon,
  className,
  weight = "duotone",
  ...props
}: Omit<MotionPhosphorProps, "hoverScale" | "hoverRotate">) {
  return (
    <span className={cn("inline-flex shrink-0", className)}>
      <Icon weight={weight} {...props} />
    </span>
  );
}
