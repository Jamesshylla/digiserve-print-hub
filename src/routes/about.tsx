import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Clock, Store, Users } from "lucide-react";
import { PageHero, Section, SectionHeading } from "@/components/site/Section";
import { business, stats } from "@/data/site";

const title = "About Us — DIGISERVE SOLUTION, Ummulong Meghalaya";
const description =
  "DIGISERVE SOLUTION is a digital print shop and online service center on Ummulong Main Road, Meghalaya, serving students, businesses and families with pickup-only printing.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: About,
});

const values = [
  {
    icon: Award,
    title: "Quality before pickup",
    text: "Every job is inspected on the counter before it is handed over. If the colour or cut is off, we reprint it.",
  },
  {
    icon: Clock,
    title: "Respect for your time",
    text: "Documents and photos are usually done within the hour. We tell you a realistic time, not an optimistic one.",
  },
  {
    icon: Store,
    title: "Pickup only, on purpose",
    text: "No courier means no damaged prints and no delivery charges. You see the output before you pay in full.",
  },
  {
    icon: Users,
    title: "Help with the paperwork",
    text: "Government forms, exam applications and admissions are checked line by line before submission.",
  },
];

function About() {
  return (
    <>
      <PageHero
        eyebrow="Who we are"
        title="About DIGISERVE SOLUTION"
        description="A local digital print shop and online service center built for Ummulong — fast document work, serious print quality and honest pricing."
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div className="animate-rise space-y-5 text-muted-foreground md:text-lg">
            <p>
              DIGISERVE SOLUTION started with a simple observation: people in and around Ummulong
              were travelling far for work that should be available on the main road — a passport
              photo, a set of visiting cards, a team jersey, an online form submission.
            </p>
            <p>
              Today we run a full digital print floor covering document printing, photo work,
              apparel and gift printing, large format branding, stationery, stamps and seals, plus
              assistance with government and online applications.
            </p>
            <p>
              We deliberately stay pickup-only. It keeps prices lower, avoids damaged prints in
              transit, and lets you approve the finish in person before the job is closed.
            </p>
            <div className="glass mt-8 p-6">
              <h2 className="font-display text-sm font-bold uppercase tracking-widest text-primary">
                Visit us
              </h2>
              <p className="mt-3">{business.address}</p>
              <p className="mt-1">{business.hours}</p>
              <Link to="/contact" className="btn-neon mt-5">
                Contact details
              </Link>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {values.map((v) => (
              <article key={v.title} className="glass glass-hover animate-rise p-6">
                <span className="flex size-11 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
                  <v.icon className="size-5 text-primary" />
                </span>
                <h3 className="mt-5 font-bold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.text}</p>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <SectionHeading eyebrow="By the numbers" title={<>Trusted by the neighbourhood</>} />
        <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="glass animate-rise p-6 text-center">
              <p className="font-display text-3xl font-extrabold neon-text">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
