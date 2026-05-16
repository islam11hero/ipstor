type FaqItem = {
  question: string;
  answer: string;
};

type FaqDetailsSectionProps = {
  title: string;
  subtitle?: string;
  faqs: readonly FaqItem[];
  className?: string;
};

/**
 * Native `<details>` FAQ — full copy in the DOM for crawlers; styled for dark UI.
 */
export function FaqDetailsSection({
  title,
  subtitle,
  faqs,
  className = "",
}: FaqDetailsSectionProps) {
  return (
    <section
      className={`border-t border-white/[0.06] bg-[#050505] px-6 py-16 sm:py-20 lg:py-24 ${className}`}
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-3xl">
        <h2
          id="faq-heading"
          className="font-heading text-2xl font-semibold tracking-tight text-white sm:text-3xl"
        >
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-3 text-[15px] leading-relaxed text-zinc-500">{subtitle}</p>
        ) : null}
        <div className="mt-10 space-y-3">
          {faqs.map((item) => (
            <details
              key={item.question}
              className="group rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] open:border-emerald-500/25 open:bg-emerald-500/[0.04]"
            >
              <summary className="cursor-pointer list-none font-medium text-zinc-100 marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-start justify-between gap-3">
                  <span>{item.question}</span>
                  <span className="shrink-0 text-xs text-emerald-400/80 transition group-open:rotate-90">
                    →
                  </span>
                </span>
              </summary>
              <p className="mt-3 border-t border-white/[0.06] pt-3 text-sm leading-relaxed text-zinc-400">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
