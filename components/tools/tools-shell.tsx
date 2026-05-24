import Link from "next/link";
import { BrandMark } from "@/components/icons";

import { Button } from "@/components/ui/button";

export function ToolsShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100">
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#050505]/90 backdrop-blur-xl">
        <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandMark size={36} />
            <span className="font-heading text-sm font-semibold tracking-tight text-white sm:text-base">
              IP Nova
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-zinc-400 hover:bg-white/[0.05] hover:text-white"
              render={<Link href="/tools" />}
            >
              Tools hub
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-black"
              render={<Link href="/dashboard" />}
            >
              Dashboard
            </Button>
          </div>
        </nav>
      </header>
      {children}
    </div>
  );
}
