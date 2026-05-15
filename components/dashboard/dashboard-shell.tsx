"use client";

import { motion } from "framer-motion";

import { defaultTransition, fadeInUp } from "@/lib/motion";

type DashboardShellProps = {
  children: React.ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <motion.div
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      transition={defaultTransition}
    >
      {children}
    </motion.div>
  );
}
