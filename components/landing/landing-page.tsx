"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Check,
  Globe,
  Server,
  Shield,
  Zap,
} from "lucide-react";

import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  defaultTransition,
  fadeInUp,
  glassCard,
  glowTitle,
  hoverLift,
  tapScale,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Activity,
    emoji: "⚡",
    title: "99.9% Uptime",
    description:
      "Enterprise-grade infrastructure with redundant nodes and real-time health monitoring.",
  },
  {
    icon: Shield,
    emoji: "🛡️",
    title: "Highly Anonymous",
    description:
      "Elite IP rotation and zero-log policies keep your traffic private and untraceable.",
  },
  {
    icon: Zap,
    emoji: "🚀",
    title: "Instant Delivery",
    description:
      "Automated provisioning delivers your proxy credentials within seconds of purchase.",
  },
];

const datacenterPerks = [
  "Dedicated & shared IPs",
  "HTTP/SOCKS5 support",
  "Unlimited bandwidth",
  "50+ global locations",
];

const residentialPerks = [
  "Real residential IPs",
  "City & country targeting",
  "Rotating & sticky sessions",
  "Pay-as-you-go pricing",
];

export function LandingPage() {
  return (
    <motion.div
      className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100"
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      transition={defaultTransition}
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.18),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <motion.div
          className="absolute top-1/4 -left-32 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl"
          animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.08, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl"
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.header
        className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/70 backdrop-blur-md"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="group flex items-center gap-2">
            <motion.div
              className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg shadow-cyan-500/30"
              whileHover={{ scale: 1.05, rotate: 3 }}
            >
              <Globe className="size-4 text-black" />
            </motion.div>
            <span className="font-heading text-lg font-semibold tracking-tight">
              🌐 Proxy<span className={glowTitle}>Nova</span>
            </span>
          </Link>
          <motion.div className="flex items-center gap-3" {...hoverLift}>
            <motion.div {...tapScale}>
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-300 hover:text-white"
                render={<Link href="/login" />}
              >
                Login
              </Button>
            </motion.div>
            <motion.div {...hoverLift} {...tapScale}>
              <Button
                size="sm"
                className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-black shadow-lg shadow-cyan-500/25 hover:from-emerald-300 hover:to-cyan-300"
                render={<Link href="/login?tab=register" />}
              >
                Register 🚀
              </Button>
            </motion.div>
          </motion.div>
        </nav>
      </motion.header>

      <main>
        <section className="mx-auto max-w-6xl px-6 pt-24 pb-20 text-center md:pt-32 md:pb-28">
          <Stagger className="flex flex-col items-center">
            <StaggerItem>
              <div
                className={cn(
                  "mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium tracking-wide text-cyan-300 uppercase",
                  glassCard,
                  "border-cyan-500/30 shadow-[0_0_24px_-6px_rgba(34,211,238,0.4)]"
                )}
              >
                <Server className="size-3.5" />
                🛡️ Trusted by 10,000+ professionals
              </div>
            </StaggerItem>
            <StaggerItem>
              <h1 className="font-heading mx-auto max-w-4xl text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
                Premium Proxies for{" "}
                <span className={glowTitle}>Any Task</span>
              </h1>
            </StaggerItem>
            <StaggerItem>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 md:text-xl">
                💎 Datacenter and residential proxies built for scraping, SEO, ad
                verification, and security research — fast, anonymous, and ready
                when you are.
              </p>
            </StaggerItem>
            <StaggerItem>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <motion.div {...hoverLift} {...tapScale}>
                  <Button
                    size="lg"
                    className="h-11 gap-2 bg-gradient-to-r from-emerald-400 to-cyan-400 px-8 text-base text-black shadow-lg shadow-emerald-500/20 hover:from-emerald-300 hover:to-cyan-300"
                    render={<Link href="/login?tab=register" />}
                  >
                    Get Started 🚀
                    <ArrowRight className="size-4" />
                  </Button>
                </motion.div>
                <motion.div {...hoverLift} {...tapScale}>
                  <Button
                    variant="outline"
                    size="lg"
                    className={cn(
                      "h-11 border-white/15 px-8 text-base text-zinc-200 hover:bg-white/10",
                      glassCard
                    )}
                    render={<Link href="#pricing" />}
                  >
                    View Pricing 💳
                  </Button>
                </motion.div>
              </div>
            </StaggerItem>
          </Stagger>
        </section>

        <section className="border-y border-white/10 bg-white/[0.02] py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <Stagger>
              <StaggerItem className="mb-14 text-center">
                <h2 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
                  ⚡ Built for{" "}
                  <span className={glowTitle}>performance</span>
                </h2>
                <p className="mt-3 text-zinc-400">
                  Everything you need from a world-class proxy provider.
                </p>
              </StaggerItem>
              <div className="grid gap-6 md:grid-cols-3">
                {features.map((feature) => (
                  <StaggerItem key={feature.title}>
                    <motion.div {...hoverLift}>
                      <Card
                        className={cn(
                          "py-6 transition-colors hover:border-cyan-500/30 hover:shadow-[0_0_32px_-8px_rgba(34,211,238,0.35)]",
                          glassCard
                        )}
                      >
                        <CardHeader>
                          <motion.div
                            className="mb-2 flex size-11 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-emerald-500/10 ring-1 ring-cyan-500/30"
                            whileHover={{ scale: 1.08 }}
                          >
                            <feature.icon className="size-5 text-cyan-400" />
                          </motion.div>
                          <CardTitle className="font-heading flex items-center gap-2 text-lg">
                            <span>{feature.emoji}</span>
                            {feature.title}
                          </CardTitle>
                          <CardDescription className="text-base leading-relaxed text-zinc-400">
                            {feature.description}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    </motion.div>
                  </StaggerItem>
                ))}
              </div>
            </Stagger>
          </div>
        </section>

        <section id="pricing" className="py-20 md:py-28">
          <motion.div
            className="mx-auto max-w-6xl px-6"
            initial={fadeInUp.initial}
            whileInView={fadeInUp.animate}
            viewport={{ once: true, margin: "-80px" }}
            transition={defaultTransition}
          >
            <Stagger>
              <StaggerItem className="mb-14 text-center">
                <h2 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
                  🛒 Simple, transparent{" "}
                  <span className={glowTitle}>pricing</span>
                </h2>
                <p className="mt-3 text-zinc-400">
                  Choose the proxy type that fits your workflow.
                </p>
              </StaggerItem>
              <div className="grid gap-8 md:grid-cols-2">
                <StaggerItem>
                  <PricingCard
                    title="Datacenter Proxies"
                    emoji="🖥️"
                    description="High-speed dedicated IPs for bulk operations and automation at scale."
                    price="$1.50"
                    unit="/IP"
                    perks={datacenterPerks}
                  />
                </StaggerItem>
                <StaggerItem>
                  <PricingCard
                    title="Residential Proxies"
                    emoji="🏠"
                    description="Legitimate residential IPs for the toughest anti-bot and geo-restricted targets."
                    price="$4.00"
                    unit="/GB"
                    perks={residentialPerks}
                    highlighted
                  />
                </StaggerItem>
              </div>
            </Stagger>
          </motion.div>
        </section>
      </main>

      <motion.footer
        className="border-t border-white/10 py-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        <motion.div
          className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-zinc-500 md:flex-row"
          {...fadeInUp}
          transition={defaultTransition}
        >
          <p>
            &copy; {new Date().getFullYear()} ProxyNova. All rights reserved.
          </p>
          <p className="text-xs">🛡️ Secure · ⚡ Anonymous · 🌐 Global</p>
        </motion.div>
      </motion.footer>
    </motion.div>
  );
}

function PricingCard({
  title,
  emoji,
  description,
  price,
  unit,
  perks,
  highlighted,
}: {
  title: string;
  emoji: string;
  description: string;
  price: string;
  unit: string;
  perks: string[];
  highlighted?: boolean;
}) {
  return (
    <motion.div
      {...hoverLift}
      className={cn(
        "h-full rounded-xl",
        highlighted && "shadow-[0_0_48px_-8px_rgba(34,211,238,0.45)]"
      )}
    >
      <Card
        className={cn(
          "relative h-full py-6",
          glassCard,
          highlighted
            ? "border-cyan-500/40 bg-gradient-to-b from-cyan-500/15 via-white/5 to-transparent ring-1 ring-cyan-500/30"
            : "hover:border-emerald-500/20"
        )}
      >
        {highlighted && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-3 py-0.5 text-xs font-semibold text-black shadow-lg">
            💎 Most Popular
          </div>
        )}
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2 text-xl">
            <span>{emoji}</span>
            {title}
          </CardTitle>
          <CardDescription className="text-base leading-relaxed text-zinc-400">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500">Starts at</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-heading text-4xl font-bold tracking-tight text-white">
              {price}
            </span>
            <span className="text-lg text-zinc-400">{unit}</span>
          </div>
          <ul className="mt-6 space-y-3">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-2.5 text-sm text-zinc-300">
                <Check className="size-4 shrink-0 text-emerald-400" />
                {perk}
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="border-0 bg-transparent pt-2">
          <motion.div className="w-full" {...hoverLift} {...tapScale}>
            <Button
              className={cn(
                "w-full",
                highlighted
                  ? "bg-gradient-to-r from-emerald-400 to-cyan-400 text-black hover:from-emerald-300 hover:to-cyan-300"
                  : ""
              )}
              variant={highlighted ? "default" : "outline"}
              render={<Link href="/login?tab=register" />}
            >
              Get Started 🚀
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
