"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type SpotlightProps = {
  className?: string;
  fill?: string;
};

export function Spotlight({ className, fill = "white" }: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      container.style.setProperty("--spotlight-x", `${x}px`);
      container.style.setProperty("--spotlight-y", `${y}px`);
    };

    container.addEventListener("mousemove", handleMove);
    return () => container.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
      aria-hidden
    >
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-500 [background:radial-gradient(600px_circle_at_var(--spotlight-x,50%)_var(--spotlight-y,40%),rgba(16,185,129,0.12),transparent_45%)] motion-safe:opacity-100"
        style={
          {
            "--spotlight-color": fill,
          } as React.CSSProperties
        }
      />
    </div>
  );
}
