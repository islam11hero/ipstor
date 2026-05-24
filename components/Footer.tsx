"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EnvelopeSimple, PaperPlaneTilt, ShareNetwork } from "@phosphor-icons/react";

import { BrandMark } from "@/components/icons";

import { Badge } from "@/components/ui/badge";
import {
  FOOTER_COMPANY_PROGRAMMATIC_LINKS,
  FOOTER_COMPANY_STATIC_LINKS,
  FOOTER_LEGAL_PROGRAMMATIC_LINKS,
  FOOTER_LEGAL_STATIC_LINKS,
  FOOTER_LOCATIONS_LINKS,
  FOOTER_PRODUCT_LINKS,
  FOOTER_RESOURCES_LINKS,
  FOOTER_TOOLS_PROGRAMMATIC_LINKS,
  FOOTER_TOOLS_STATIC_LINKS,
  programmaticPath,
} from "@/lib/seo-sitemap-paths";

const linkClass =
  "text-sm text-zinc-500 transition-colors hover:text-zinc-200 inline-flex items-center flex-wrap gap-x-1";

const heading =
  "font-heading text-[11px] font-semibold tracking-[0.2em] text-zinc-500 uppercase";

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="border-t border-white/[0.06] bg-[#050505]">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:py-20">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-3 md:gap-12 lg:grid-cols-6 lg:gap-8">
          <div>
            <h3 className={heading}>Products</h3>
            <ul className="mt-4 space-y-3">
              {FOOTER_PRODUCT_LINKS.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={programmaticPath({
                      category: "products",
                      slug: item.slug,
                    })}
                    className={linkClass}
                  >
                    {item.label}
                    {"popular" in item && item.popular === true ? (
                      <Badge className="ml-2 border-none bg-emerald-500/20 text-[10px] text-emerald-400">
                        Popular
                      </Badge>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={heading}>Tools</h3>
            <ul className="mt-4 space-y-3">
              {FOOTER_TOOLS_STATIC_LINKS.map((item) => (
                <li key={item.path}>
                  <Link href={item.path} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
              {FOOTER_TOOLS_PROGRAMMATIC_LINKS.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={programmaticPath({
                      category: "tools",
                      slug: item.slug,
                    })}
                    className={linkClass}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={heading}>Resources</h3>
            <ul className="mt-4 space-y-3">
              {FOOTER_RESOURCES_LINKS.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={programmaticPath({
                      category: "resources",
                      slug: item.slug,
                    })}
                    className={linkClass}
                  >
                    {"live" in item && item.live ? (
                      <span
                        className="mr-2 inline-block size-2 animate-pulse rounded-full bg-emerald-500"
                        aria-hidden
                      />
                    ) : null}
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={heading}>Locations</h3>
            <ul className="mt-4 space-y-3">
              {FOOTER_LOCATIONS_LINKS.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={programmaticPath({
                      category: "locations",
                      slug: item.slug,
                    })}
                    className={linkClass}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={heading}>Company</h3>
            <ul className="mt-4 space-y-3">
              {FOOTER_COMPANY_STATIC_LINKS.map((item) => (
                <li key={item.path}>
                  <Link href={item.path} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
              {FOOTER_COMPANY_PROGRAMMATIC_LINKS.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={programmaticPath({
                      category: "company",
                      slug: item.slug,
                    })}
                    className={linkClass}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={heading}>Legal</h3>
            <ul className="mt-4 space-y-3">
              {FOOTER_LEGAL_STATIC_LINKS.map((item) => (
                <li key={item.path}>
                  <Link href={item.path} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
              {FOOTER_LEGAL_PROGRAMMATIC_LINKS.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={programmaticPath({
                      category: "legal",
                      slug: item.slug,
                    })}
                    className={linkClass}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-white/[0.06] pt-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-heading text-base font-semibold tracking-tight text-white"
            >
              <BrandMark size={40} />
              IP Nova
            </Link>

            <div className="flex flex-col gap-3 md:items-end">
              <div className="flex flex-wrap items-center gap-5 text-zinc-500">
                <a
                  href={programmaticPath({
                    category: "resources",
                    slug: "blog",
                  })}
                  className="transition-colors hover:text-zinc-200"
                  aria-label="IP Nova blog"
                >
                  <ShareNetwork className="size-6" weight="duotone" />
                </a>
                <a
                  href={programmaticPath({
                    category: "company",
                    slug: "contact-us",
                  })}
                  className="transition-colors hover:text-zinc-200"
                  aria-label="Contact IP Nova"
                >
                  <PaperPlaneTilt className="size-6" weight="duotone" />
                </a>
                <a
                  href="mailto:support@ipnova.online"
                  className="transition-colors hover:text-zinc-200"
                  aria-label="Email IP Nova"
                >
                  <EnvelopeSimple className="size-6" weight="duotone" />
                </a>
              </div>
              <p className="text-xs tracking-wide text-zinc-500">
                VISA • MASTERCARD • CRYPTO
              </p>
              <p className="text-xs text-zinc-600">
                &copy; 2026 IP Nova. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
