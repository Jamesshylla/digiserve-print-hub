import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { PageHero, Section } from "@/components/site/Section";
import { faqs } from "@/data/site";

const title = "FAQ — Orders, Files, Payment & Pickup | DIGISERVE SOLUTION";
const description =
  "Answers about file formats, turnaround times, UPI payment, bulk discounts, government form assistance and pickup-only collection at DIGISERVE SOLUTION.";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: Faq;
});

function Faq() {
  return (
    <>
      <PageHero
        eyebrow="Help center"
        title="Frequently Asked Questions"
        description="The questions we get asked at the counter every week."
      />

      <Section>
        <div className="mx-auto max-w-3xl space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="glass glass-hover group animate-rise p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-base font-bold">
                {f.q}
                <ChevronDown className="size-5 shrink-0 text-primary transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>

        <div className="glass mx-auto mt-12 max-w-3xl p-8 text-center">
          <h2 className="text-2xl font-bold">Still have a question?</h2>
          <p className="mt-3 text-muted-foreground">
            Call or message us and we'll answer during business hours.
          </p>
          <Link to="/contact" className="btn-neon mt-6">
            Contact us
          </Link>
        </div>
      </Section>
    </>
  );
}
