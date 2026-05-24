"use client";

import { cn } from "@/lib/utils";

import { BorderBeam } from "./border-beam";

type MagicCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function MagicCard({ children, className }: MagicCardProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl", className)}>
      <BorderBeam size={280} duration={12} />
      {children}
    </div>
  );
}
