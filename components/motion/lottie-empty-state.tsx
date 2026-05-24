"use client";

import dynamic from "next/dynamic";

import { cn } from "@/lib/utils";
import emptyNetworkAnimation from "@/lib/animations/empty-network.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

type LottieEmptyStateProps = {
  title: string;
  description?: string;
  className?: string;
  size?: number;
};

export function LottieEmptyState({
  title,
  description,
  className,
  size = 120,
}: LottieEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-4 py-10 text-center",
        className
      )}
    >
      <div style={{ width: size, height: size }} className="opacity-90">
        <Lottie animationData={emptyNetworkAnimation} loop />
      </div>
      <p className="mt-2 font-heading text-base font-medium text-zinc-200">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-zinc-500">{description}</p>
      ) : null}
    </div>
  );
}
