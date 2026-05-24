"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Player } from "@lordicon/react";

import { cn } from "@/lib/utils";

const LordIconPlayer = dynamic(
  () =>
    import("@/components/icons/lord-icon-player").then((mod) => mod.LordIconPlayer),
  { ssr: false }
);

export type LordIconName =
  | "network"
  | "globe"
  | "server"
  | "wallet"
  | "shield"
  | "zap"
  | "clipboard";

const ICON_LOADERS: Record<LordIconName, () => Promise<object>> = {
  network: () => import("@/lib/icons/lordicon/network.json").then((m) => m.default),
  globe: () => import("@/lib/icons/lordicon/globe.json").then((m) => m.default),
  server: () => import("@/lib/icons/lordicon/server.json").then((m) => m.default),
  wallet: () => import("@/lib/icons/lordicon/wallet.json").then((m) => m.default),
  shield: () => import("@/lib/icons/lordicon/shield.json").then((m) => m.default),
  zap: () => import("@/lib/icons/lordicon/zap.json").then((m) => m.default),
  clipboard: () => import("@/lib/icons/lordicon/clipboard.json").then((m) => m.default),
};

type LordIconProps = {
  name: LordIconName;
  size?: number;
  className?: string;
  trigger?: "hover" | "loop" | "once" | "none";
  colors?: string;
  style?: CSSProperties;
};

export function LordIcon({
  name,
  size = 40,
  className,
  trigger = "hover",
  colors = "primary:#34d399,secondary:#22d3ee",
  style,
}: LordIconProps) {
  const playerRef = useRef<Player>(null);
  const [iconData, setIconData] = useState<object | null>(null);
  const [playerReady, setPlayerReady] = useState(false);

  useEffect(() => {
    let active = true;
    void ICON_LOADERS[name]().then((data) => {
      if (active) setIconData(data);
    });
    return () => {
      active = false;
    };
  }, [name]);

  useEffect(() => {
    if (trigger !== "once" && trigger !== "loop") return;
    if (!playerReady) return;
    if (trigger === "once") {
      playerRef.current?.playFromBeginning();
      return;
    }
    const id = window.setInterval(() => {
      playerRef.current?.playFromBeginning();
    }, 2800);
    return () => window.clearInterval(id);
  }, [playerReady, trigger]);

  if (!iconData) {
    return (
      <span
        className={cn("inline-block animate-pulse rounded-lg bg-emerald-500/10", className)}
        style={{ width: size, height: size, ...style }}
        aria-hidden
      />
    );
  }

  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center", className)}
      style={style}
      onMouseEnter={
        trigger === "hover" ? () => playerRef.current?.playFromBeginning() : undefined
      }
      onFocus={
        trigger === "hover" ? () => playerRef.current?.playFromBeginning() : undefined
      }
    >
      <LordIconPlayer
        ref={playerRef}
        icon={iconData}
        size={size}
        colors={colors}
        onReady={() => {
          setPlayerReady(true);
          if (trigger === "loop" || trigger === "once") {
            playerRef.current?.playFromBeginning();
          }
        }}
      />
    </span>
  );
}

/** Animated brand mark for headers and auth screens. */
export function BrandLogo({
  size = 40,
  className,
  trigger = "hover",
}: {
  size?: number;
  className?: string;
  trigger?: LordIconProps["trigger"];
}) {
  return (
    <LordIcon
      name="network"
      size={size}
      className={className}
      trigger={trigger}
      colors="primary:#34d399,secondary:#67e8f9"
    />
  );
}
