import { PageHero, Section } from "@/components/site/Section";

export type LegalSection = { heading: string; body: string[] };

export function LegalPage({
  eyebrow,
  title,
  description,
  updated,
  sections,
}: {
  eyebrow: string;
  title: string;
  description: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} description={description} />
      <Section>
        <div className="mx-auto max-w-3xl">
          <p className="chip">Last updated: {updated}</p>
          <div className="mt-8 space-y-8">
            {sections.map((s) => (
              <article key={s.heading} className="glass animate-rise p-6">
                <h2 className="text-lg font-bold">{s.heading}</h2>
                <div className="mt-3 space-y-3 text-muted-foreground">
                  {s.body.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
