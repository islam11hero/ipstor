import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "next-themes";

import { ReferralTracker } from "@/components/ReferralTracker";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SITE_URL } from "@/lib/site-url";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "IP Nova — Enterprise proxy infrastructure",
    template: "%s | IP Nova",
  },
  description:
    "Buy proxies, residential IPs, and datacenter proxies from IP Nova — enterprise-grade infrastructure for data teams, security research, and growth organizations.",
  keywords: [
    "buy proxies",
    "residential IPs",
    "datacenter proxies",
    "IP Nova",
    "enterprise proxies",
    "SOCKS5",
    "HTTP proxy",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "IP Nova",
    url: SITE_URL,
    title: "IP Nova — Enterprise proxy infrastructure",
    description:
      "Buy proxies, residential IPs, and datacenter proxies from IP Nova.",
  },
  twitter: {
    card: "summary_large_image",
    title: "IP Nova — Enterprise proxy infrastructure",
    description:
      "Buy proxies, residential IPs, and datacenter proxies from IP Nova.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} dark h-full antialiased`}
    >
      <body className="min-h-full bg-[#050505] font-sans text-zinc-100 selection:bg-emerald-500/25 selection:text-emerald-50">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <TooltipProvider>
            <ReferralTracker />
            {children}
            <Footer />
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
