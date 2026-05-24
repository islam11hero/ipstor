import Link from "next/link";
import { BrandMark } from "@/components/icons";

import { staticPageMetadata } from "@/lib/page-metadata";

export const metadata = staticPageMetadata({
  path: "/privacy",
  title: "Privacy Policy",
  description:
    "IP Nova privacy policy: data categories, retention, ethical IP sourcing alignment, KYC scope, international transfers, and security measures for enterprise customers.",
});

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
            <BrandMark size={36} />
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
          Last updated: January 1, 2026. This policy describes how IP Nova collects,
          uses, discloses, and safeguards information in connection with our websites,
          dashboards, APIs, and related services (the &ldquo;Services&rdquo;).
        </p>
        <p>
          IP Nova provides forward proxy infrastructure for business customers who route
          HTTP, HTTPS, and SOCKS5 traffic through our networks for purposes such as web
          scraping, ad verification, fraud prevention, and application testing—subject
          to acceptable use and applicable law. Because our customers operate at
          enterprise scale, we write this policy for security, legal, and data teams who
          must map subprocessors, logging categories, retention schedules, and
          international transfers to their own records of processing activities.
        </p>
        <h2>1. Who this policy covers</h2>
        <p>
          This Privacy Policy applies to visitors of our marketing websites, registered
          users of the IP Nova dashboard, API consumers, and business contacts who
          interact with sales, solutions, and support teams. If you use the Services on
          behalf of an organization, that organization&apos;s agreement with us may
          also govern certain processing activities, including additional security
          controls or custom data processing addenda.
        </p>
        <h2>2. Categories of information we collect</h2>
        <h3>2.1 Account and authentication data</h3>
        <p>
          When you create an account, we collect identifiers such as email address,
          authentication tokens, organization name where provided, billing identifiers,
          and profile attributes necessary to operate the Services—including account
          balance, transaction history, and support ticket content you submit. For
          certain high-risk SKUs tied to carrier-backed inventory, we may collect
          additional business verification data as part of commercially reasonable KYC
          obligations. KYC data is collected for fraud prevention and partner compliance,
          retained according to documented schedules, and accessed on a least-privilege
          basis by trained personnel.
        </p>
        <h3>2.2 Technical, security, and abuse-prevention logs</h3>
        <p>
          We collect server logs, timestamps, source IP addresses as seen by our edge,
          request metadata necessary to operate proxies (for example, host and path
          information required to establish tunnels), error diagnostics, rate-limit
          counters, and signals used to detect abusive traffic patterns. We do not use
          this section to justify omnibus surveillance: fields are limited to what is
          needed to secure the platform, bill usage, and investigate incidents. Where
          customers require minimized logging, enterprise agreements may define stricter
          retention or redaction—subject to feasibility and law.
        </p>
        <h3>2.3 Payment data</h3>
        <p>
          Payment processing is performed by third-party payment partners. We do not
          store full payment card numbers on IP Nova infrastructure when payments are
          processed by those partners. We may store limited payment metadata required for
          reconciliation, invoicing, fraud prevention, and audit trails (such as partial
          identifiers, amounts, currencies, and transaction statuses).
        </p>
        <h2>3. How we use information</h2>
        <ul>
          <li>Provide, maintain, secure, and improve the Services</li>
          <li>Authenticate users and prevent unauthorized access</li>
          <li>Process transactions, credits, refunds, and support requests</li>
          <li>Detect, investigate, and mitigate abuse that could harm subnet reputation</li>
          <li>Comply with law and enforce our Terms of Service</li>
          <li>Analyze aggregate usage to improve performance and reliability</li>
        </ul>
        <h2>4. Ethical IP sourcing and data stewardship alignment</h2>
        <p>
          Residential and mobile programs depend on ethically sourced partner inventory
          with informed consent and contractual use restrictions. While this policy
          primarily addresses customer and visitor personal data, enterprise buyers
          frequently ask how sourcing practices intersect with privacy commitments. IP
          Nova maintains documentation that describes consent mechanisms at a high level,
          partner diligence cadence, and technical controls used to detect violations that
          could impact data subjects and customers alike. We do not treat sourcing as a
          marketing footnote; it is part of the trust boundary for the entire network.
        </p>
        <h2>5. Sharing and disclosure</h2>
        <p>
          We may share information with subprocessors that provide infrastructure,
          analytics, payment processing, customer communications, and security monitoring,
          subject to confidentiality and security obligations. We may disclose information
          if required by law, regulation, legal process, or to protect the rights,
          property, or safety of IP Nova, our customers, or the public. We do not sell
          personal information as traditionally defined in U.S. state privacy laws, and
          we do not monetize customer proxy traffic content for unrelated advertising
          purposes.
        </p>
        <h2>6. International transfers</h2>
        <p>
          We may process information in countries other than your country of residence.
          Where required, we implement appropriate safeguards consistent with applicable
          law, including contractual clauses and organizational security measures. Global
          infrastructure is necessary to deliver low-latency HTTP/HTTPS/SOCKS5 routing,
          but it increases the importance of transparent subprocessors lists and
          transfer impact assessments for regulated buyers.
        </p>
        <h2>7. Retention</h2>
        <p>
          We retain information for as long as necessary to provide the Services and
          fulfill the purposes described in this policy, unless a longer retention period
          is required or permitted by law. Retention schedules vary by data category:
          security logs may be retained longer than transient request diagnostics;
          marketing contacts may be retained until objection; billing records may be
          retained for accounting and tax compliance. Enterprise customers may negotiate
          specific retention caps where technically feasible.
        </p>
        <h2>8. Security</h2>
        <p>
          IP Nova implements administrative, technical, and organizational measures
          designed to protect information against unauthorized access, alteration,
          disclosure, or destruction. Measures include access controls, encryption in
          transit for sensitive channels, monitoring for anomalous activity, and incident
          response procedures. No method of transmission over the Internet is completely
          secure; we encourage customers to enable strong authentication, rotate API
          keys, and scope credentials per environment.
        </p>
        <h2>9. Your rights</h2>
        <p>
          Depending on your jurisdiction, you may have rights to access, correct, delete,
          or restrict certain processing of your personal information, or to object to
          certain processing. To exercise rights, contact{" "}
          <a href="mailto:privacy@ipnova.online">privacy@ipnova.online</a>. We may need to
          verify your identity before fulfilling requests. Organizations using the
          Services may have additional internal processes for end-user data routed through
          proxies; customers remain responsible for lawful bases and notices to their own
          users where applicable.
        </p>
        <h2>10. Children</h2>
        <p>
          The Services are not directed to individuals under 16, and we do not knowingly
          collect personal information from children.
        </p>
        <h2>11. Changes</h2>
        <p>
          We may update this Privacy Policy from time to time. Material changes will be
          communicated through the Services or by other appropriate means. Continued use
          after the effective date constitutes acceptance of the updated policy where
          permitted by law.
        </p>
        <h2>12. Contact</h2>
        <p>
          Questions about this Privacy Policy:{" "}
          <a href="mailto:privacy@ipnova.online">privacy@ipnova.online</a>
        </p>
      </article>
    </div>
  );
}
