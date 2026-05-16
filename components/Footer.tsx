"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Globe,
  Mail,
  Send,
  Share2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

const linkClass =
  "text-sm text-zinc-500 transition-colors hover:text-zinc-200 inline-flex items-center flex-wrap gap-x-1";

const heading =
  "font-heading text-[11px] font-semibold tracking-[0.2em] text-zinc-500 uppercase";

export function Footer() {
  const pathname = usePathname();
  if (
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/admin")
  ) {
    return null;
  }

  return (
    <footer className="border-t border-white/[0.06] bg-[#050505]">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:py-20">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-3 md:gap-12 lg:grid-cols-6 lg:gap-8">
          <div>
            <h3 className={heading}>Products</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/products/residential-proxies" className={linkClass}>
                  Residential Proxies
                  <Badge className="ml-2 border-none bg-emerald-500/20 text-[10px] text-emerald-400">
                    Popular
                  </Badge>
                </Link>
              </li>
              <li>
                <Link href="/products/isp-proxies" className={linkClass}>
                  ISP Proxies
                </Link>
              </li>
              <li>
                <Link href="/products/datacenter-proxies" className={linkClass}>
                  Datacenter Proxies
                </Link>
              </li>
              <li>
                <Link href="/products/mobile-proxies" className={linkClass}>
                  Mobile Proxies
                </Link>
              </li>
              <li>
                <Link href="/products/web-unblocker" className={linkClass}>
                  Web Unblocker
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={heading}>Tools</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/tools/proxy-tester" className={linkClass}>
                  Proxy Tester
                </Link>
              </li>
              <li>
                <Link href="/tools/ip-lookup" className={linkClass}>
                  IP Lookup
                </Link>
              </li>
              <li>
                <Link href="/tools/chrome-extension" className={linkClass}>
                  Chrome Extension
                </Link>
              </li>
              <li>
                <Link href="/tools/firefox-addon" className={linkClass}>
                  Firefox Add-on
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={heading}>Resources</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/resources/blog" className={linkClass}>
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/resources/documentation" className={linkClass}>
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/resources/integrations" className={linkClass}>
                  Integrations
                </Link>
              </li>
              <li>
                <Link href="/resources/network-status" className={linkClass}>
                  <span
                    className="mr-2 inline-block size-2 animate-pulse rounded-full bg-emerald-500"
                    aria-hidden
                  />
                  Network Status
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={heading}>Locations</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/locations/united-states" className={linkClass}>
                  United States
                </Link>
              </li>
              <li>
                <Link href="/locations/united-kingdom" className={linkClass}>
                  United Kingdom
                </Link>
              </li>
              <li>
                <Link href="/locations/germany" className={linkClass}>
                  Germany
                </Link>
              </li>
              <li>
                <Link href="/locations/japan" className={linkClass}>
                  Japan
                </Link>
              </li>
              <li>
                <Link href="/locations/global-network" className={linkClass}>
                  Global Network
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={heading}>Company</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/company/about-us" className={linkClass}>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/company/affiliate-program" className={linkClass}>
                  Affiliate Program
                </Link>
              </li>
              <li>
                <Link href="/company/contact-us" className={linkClass}>
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={heading}>Legal</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/legal/terms-of-service" className={linkClass}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy-policy" className={linkClass}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/kyc-policy" className={linkClass}>
                  KYC Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-white/[0.06] pt-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <Link
              href="/"
              className="inline-flex items-center font-heading text-base font-semibold tracking-tight text-white"
            >
              <Globe
                className="mr-2 inline h-5 w-5 shrink-0 text-emerald-500"
                aria-hidden
              />
              ProxyNova
            </Link>

            <div className="flex flex-col gap-3 md:items-end">
              <div className="flex flex-wrap items-center gap-5 text-zinc-500">
                <a
                  href="/resources/blog"
                  className="transition-colors hover:text-zinc-200"
                  aria-label="ProxyNova blog"
                >
                  <Share2 className="size-5" />
                </a>
                <a
                  href="/company/contact-us"
                  className="transition-colors hover:text-zinc-200"
                  aria-label="Contact ProxyNova"
                >
                  <Send className="size-5" />
                </a>
                <a
                  href="mailto:support@proxynova.io"
                  className="transition-colors hover:text-zinc-200"
                  aria-label="Email ProxyNova"
                >
                  <Mail className="size-5" />
                </a>
              </div>
              <p className="text-xs tracking-wide text-zinc-500">
                VISA • MASTERCARD • CRYPTO
              </p>
              <p className="text-xs text-zinc-600">
                &copy; 2026 ProxyNova. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
