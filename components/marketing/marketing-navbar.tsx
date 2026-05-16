"use client";

import Link from "next/link";
import { Network } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLink =
  "text-sm text-zinc-400 transition-colors hover:text-white whitespace-nowrap";

const centerLinks: { label: string; href: string }[] = [
  { label: "Products", href: "/#solutions" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Use Cases", href: "/#use-cases" },
  { label: "Locations", href: "/locations/united-states" },
  { label: "Resources", href: "/resources/documentation" },
];

export function MarketingNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#050505]/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6 lg:h-[4.25rem]">
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          <Network
            className="h-8 w-8 shrink-0 text-emerald-400 transition-transform group-hover:scale-[1.02]"
            aria-hidden
          />
          <span className="font-heading text-2xl font-bold tracking-tight text-white">
            IP Nova
          </span>
        </Link>

        <div className="hidden flex-1 justify-center lg:flex">
          <div className="flex items-center gap-10">
            {centerLinks.map((item) => (
              <Link key={item.href} href={item.href} className={navLink}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-400 hover:bg-white/[0.05] hover:text-white"
            render={<Link href="/login" />}
          >
            Sign in
          </Button>
          <Button
            size="sm"
            className={cn(
              "border-0 bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 font-semibold text-black shadow-lg shadow-emerald-500/20",
              "hover:from-emerald-300 hover:to-cyan-300"
            )}
            render={<Link href="/login?tab=register" />}
          >
            Get Access
          </Button>
        </div>
      </nav>
    </header>
  );
}
