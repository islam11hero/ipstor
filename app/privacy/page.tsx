import Link from "next/link";
import { Network } from "lucide-react";

export const metadata = {
  title: "Privacy Policy",
  description: "IP Nova privacy policy and data practices.",
};

export default function PrivacyPage() {
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
        <h1>Privacy Policy</h1>
        <p className="text-sm text-zinc-500">
          Last updated: January 1, 2026. IP Nova, a leading proxy infrastructure
          provider (&ldquo;IP Nova,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
          &ldquo;our&rdquo;) describes how we collect, use, disclose, and safeguard
          information in connection with our websites, dashboards, and services
          (collectively, the &ldquo;Services&rdquo;).
        </p>

        <h2>1. Scope</h2>
        <p>
          This Privacy Policy applies to visitors of our marketing websites,
          registered users of the IP Nova dashboard, and business contacts who
          interact with our sales and support teams. If you use the Services on
          behalf of an organization, that organization&apos;s agreement with us may
          also govern certain processing activities.
        </p>

        <h2>2. Information we collect</h2>
        <h3>2.1 Account and authentication data</h3>
        <p>
          When you create an account, we collect identifiers such as email address,
          authentication tokens, and profile attributes necessary to operate the
          Services (for example, account balance and transaction history associated
          with your workspace).
        </p>
        <h3>2.2 Technical and usage data</h3>
        <p>
          We collect standard server logs, device and browser metadata, IP addresses
          as they appear to our systems, timestamps, and diagnostic information used
          to secure the platform, prevent abuse, and improve reliability.
        </p>
        <h3>2.3 Payment data</h3>
        <p>
          Payment processing may be performed by third-party payment partners. We do
          not store full payment card numbers on IP Nova infrastructure when
          payments are processed by those partners. We may store limited payment
          metadata required for reconciliation, invoicing, and fraud prevention.
        </p>

        <h2>3. How we use information</h2>
        <ul>
          <li>Provide, maintain, and secure the Services</li>
          <li>Authenticate users and prevent unauthorized access</li>
          <li>Process transactions, credits, and support requests</li>
          <li>Comply with law and enforce our Terms of Service</li>
          <li>Analyze aggregate usage to improve performance and user experience</li>
        </ul>

        <h2>4. Sharing and disclosure</h2>
        <p>
          We may share information with subprocessors that provide infrastructure,
          analytics, payment processing, and customer communications, subject to
          confidentiality obligations. We may disclose information if required by
          law, court order, or to protect the rights, property, or safety of
          IP Nova, our customers, or the public.
        </p>

        <h2>5. Data retention</h2>
        <p>
          We retain information for as long as necessary to provide the Services and
          fulfill the purposes described in this policy, unless a longer retention
          period is required or permitted by law.
        </p>

        <h2>6. Security</h2>
        <p>
          IP Nova implements administrative, technical, and organizational
          measures designed to protect information against unauthorized access,
          alteration, disclosure, or destruction. No method of transmission over
          the Internet is completely secure; we encourage customers to protect
          account credentials and enable strong authentication where available.
        </p>

        <h2>7. International transfers</h2>
        <p>
          We may process information in countries other than your country of
          residence. Where required, we implement appropriate safeguards consistent
          with applicable law.
        </p>

        <h2>8. Your rights</h2>
        <p>
          Depending on your jurisdiction, you may have rights to access, correct,
          delete, or restrict certain processing of your personal information, or to
          object to processing. To exercise rights, contact{" "}
          <a href="mailto:privacy@ipnova.online">privacy@ipnova.online</a>. We may
          need to verify your identity before fulfilling requests.
        </p>

        <h2>9. Children</h2>
        <p>
          The Services are not directed to individuals under 16, and we do not
          knowingly collect personal information from children.
        </p>

        <h2>10. Changes</h2>
        <p>
          We may update this Privacy Policy from time to time. Material changes
          will be communicated through the Services or by other appropriate means.
        </p>

        <h2>11. Contact</h2>
        <p>
          Questions about this Privacy Policy:{" "}
          <a href="mailto:privacy@ipnova.online">privacy@ipnova.online</a>
        </p>
      </article>
    </div>
  );
}
