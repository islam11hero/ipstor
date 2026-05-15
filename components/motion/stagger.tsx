"use client";

import { motion, type MotionProps } from "framer-motion";

import {
  defaultTransition,
  fadeInUp,
  staggerContainer,
} from "@/lib/motion";

type StaggerProps = MotionProps & {
  children: React.ReactNode;
  className?: string;
};

export function Stagger({ children, className, ...props }: StaggerProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

type StaggerItemProps = MotionProps & {
  children: React.ReactNode;
  className?: string;
};

export function StaggerItem({ children, className, ...props }: StaggerItemProps) {
  return (
    <motion.div
      variants={fadeInUp}
      transition={defaultTransition}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
