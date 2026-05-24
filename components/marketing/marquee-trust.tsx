import { Cube, Hexagon, Triangle } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";

const partners: { Icon: Icon; name: string }[] = [
  { Icon: Hexagon, name: "Acme Corp" },
  { Icon: Triangle, name: "TechNode" },
  { Icon: Cube, name: "DataScrape" },
  { Icon: Hexagon, name: "AdVerify" },
  { Icon: Triangle, name: "NorthGrid" },
  { Icon: Cube, name: "Signal Labs" },
  { Icon: Hexagon, name: "Atlas Intel" },
  { Icon: Triangle, name: "Meridian AI" },
];

function PartnerRow({ id }: { id: string }) {
  return (
    <div className="flex shrink-0 items-center gap-16 pr-16">
      {partners.map(({ Icon, name }) => (
        <div
          key={`${id}-${name}`}
          className="flex items-center gap-3 opacity-50 grayscale transition-opacity hover:opacity-70"
        >
          <Icon className="size-5 text-zinc-500" weight="duotone" aria-hidden />
          <span className="whitespace-nowrap font-heading text-sm font-medium tracking-tight text-zinc-400">
            {name}
          </span>
        </div>
      ))}
    </div>
  );
}

export function MarqueeTrust() {
  return (
    <div className="relative border-y border-white/[0.05] bg-[#050505]/60 py-10">
      <p className="mb-8 text-center font-heading text-[11px] font-medium tracking-[0.25em] text-zinc-600 uppercase">
        Trusted by data-forward teams
      </p>
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#050505] to-transparent sm:w-32"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#050505] to-transparent sm:w-32"
          aria-hidden
        />
        <div className="flex w-max animate-marquee-infinite will-change-transform">
          <PartnerRow id="a" />
          <PartnerRow id="b" />
        </div>
      </div>
    </div>
  );
}
