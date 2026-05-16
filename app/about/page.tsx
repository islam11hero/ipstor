import Link from "next/link";
import { Network } from "lucide-react";

export const metadata = {
  title: "About",
  description: "Learn about IP Nova and our mission in enterprise proxy infrastructure.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
        aria-hidden
      />
      <header className="border-b border-white/[0.06] bg-[#050505]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5 text-sm text-zinc-400 hover:text-white">
            <Network className="h-6 w-6 text-emerald-400" aria-hidden />
            <span className="font-heading font-semibold text-white">IP Nova</span>
          </Link>
          <Link href="/login" className="text-sm text-zinc-500 hover:text-white">
            Sign in
          </Link>
        </div>
      </header>
      <article className="prose-legal px-6 py-16 lg:py-24">
        <h1>About IP Nova</h1>
        <p>
          IP Nova is a leading proxy infrastructure provider, delivering
          datacenter and residential endpoints to organizations that depend on
          reliable, ethically sourced network access for data acquisition, ad
          verification, security research, and large-scale automation.
        </p>
        <p>
          We operate with the assumption that our customers run production
          workloads: latency, session semantics, and billing clarity are treated
          as first-class product requirements—not afterthoughts buried in support
          tickets.
        </p>
        <h2>What we build</h2>
        <p>
          Our platform couples a modern control plane with a globally distributed
          footprint. Teams receive credentials in industry-standard formats,
          integrate through predictable APIs, and scale consumption as their
          programs mature from experimentation to always-on pipelines.
        </p>
        <h2>How we work with customers</h2>
        <p>
          IP Nova engages with data science, growth, and security teams that
          require contractual clarity, documented acceptable use, and responsive
          technical partnership. Enterprise customers may access volume pricing,
          custom routing policies, and dedicated onboarding.
        </p>
        <h2>Contact</h2>
        <p>
          For general inquiries and partnership discussions, contact{" "}
          <a href="mailto:hello@ipnova.online">hello@ipnova.online</a>. For legal
          matters, contact <a href="mailto:legal@ipnova.online">legal@ipnova.online</a>
          .
        </p>
      </article>
    </div>
  );
}
