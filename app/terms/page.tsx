import Link from "next/link";
import { Network } from "lucide-react";

export const metadata = {
  title: "Terms of Service",
  description: "IP Nova terms of service for use of our platform and infrastructure.",
};

export default function TermsPage() {
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
        <h1>Terms of Service</h1>
        <p className="text-sm text-zinc-500">
          Effective: January 1, 2026. These Terms of Service (&ldquo;Terms&rdquo;)
          govern access to and use of the websites, dashboards, APIs, and related
          offerings provided by IP Nova, a leading proxy infrastructure provider
          (&ldquo;IP Nova,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
          &ldquo;our&rdquo;). By accessing or using the Services, you agree to these
          Terms.
        </p>

        <h2>1. Eligibility and accounts</h2>
        <p>
          You must be at least 18 years old and capable of forming a binding
          contract to use the Services. You are responsible for maintaining the
          confidentiality of credentials and for all activity under your account.
          Notify us promptly of unauthorized use.
        </p>

        <h2>2. The Services</h2>
        <p>
          IP Nova provides access to proxy infrastructure and related tools as
          described on our website and in order documentation. Features, limits,
          and availability may change as we improve the platform; we will use
          commercially reasonable efforts to avoid disruptive changes to committed
          enterprise agreements.
        </p>

        <h2>3. Acceptable use</h2>
        <p>You agree not to use the Services to:</p>
        <ul>
          <li>Violate applicable law or third-party rights</li>
          <li>Send spam, conduct phishing, or distribute malware</li>
          <li>Attack, disrupt, or gain unauthorized access to systems or networks</li>
          <li>Circumvent technical limitations, billing controls, or security controls</li>
          <li>Harass, abuse, or harm individuals or organizations</li>
        </ul>
        <p>
          We may investigate suspected violations and suspend or terminate access
          where necessary to protect the platform and other customers.
        </p>

        <h2>4. Customer data and privacy</h2>
        <p>
          Our collection and use of personal information is described in the
          IP Nova Privacy Policy. You are responsible for ensuring that any
          personal data you process through the Services complies with applicable
          law and that you have obtained required consents and notices.
        </p>

        <h2>5. Fees and payment</h2>
        <p>
          Paid Services are billed according to the pricing and payment terms
          presented at purchase or in a written order form. You authorize us and our
          payment processors to charge applicable fees. Taxes may apply where
          required by law.
        </p>

        <h2>6. Intellectual property</h2>
        <p>
          IP Nova and its licensors retain all rights in the Services, including
          software, branding, and documentation. Subject to these Terms, we grant you
          a limited, non-exclusive, non-transferable right to access and use the
          Services during your subscription term.
        </p>

        <h2>7. Disclaimer of warranties</h2>
        <p>
          THE SERVICES ARE PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS
          AVAILABLE.&rdquo; TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM ALL
          WARRANTIES, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING IMPLIED
          WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
          NON-INFRINGEMENT.
        </p>

        <h2>8. Limitation of liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, IP NOVA WILL NOT BE LIABLE FOR
          ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, OR
          ANY LOSS OF PROFITS, DATA, OR GOODWILL. OUR AGGREGATE LIABILITY ARISING OUT
          OF OR RELATED TO THE SERVICES WILL NOT EXCEED THE GREATER OF (A) THE
          AMOUNTS YOU PAID TO US FOR THE SERVICES IN THE TWELVE MONTHS BEFORE THE
          CLAIM OR (B) ONE HUNDRED US DOLLARS, EXCEPT WHERE PROHIBITED BY LAW.
        </p>

        <h2>9. Indemnity</h2>
        <p>
          You will defend and indemnify IP Nova and its affiliates, officers,
          directors, employees, and agents against any claims, damages, losses, and
          expenses (including reasonable attorneys&apos; fees) arising from your
          use of the Services, your content, or your violation of these Terms.
        </p>

        <h2>10. Termination</h2>
        <p>
          You may stop using the Services at any time. We may suspend or terminate
          access for violations of these Terms, non-payment, or risks to platform
          integrity. Provisions that by their nature should survive will survive
          termination.
        </p>

        <h2>11. Governing law</h2>
        <p>
          These Terms are governed by the laws of the State of Delaware, excluding
          conflict-of-law rules, unless a different governing law is specified in a
          signed enterprise agreement between you and IP Nova.
        </p>

        <h2>12. Changes</h2>
        <p>
          We may modify these Terms by posting an updated version. If changes are
          material, we will provide reasonable notice where required by law. Continued
          use after the effective date constitutes acceptance of the updated Terms.
        </p>

        <h2>13. Contact</h2>
        <p>
          <a href="mailto:legal@ipnova.online">legal@ipnova.online</a>
        </p>
      </article>
    </div>
  );
}
