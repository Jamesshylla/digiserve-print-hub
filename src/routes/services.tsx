import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PageHero, Section } from "@/components/site/Section";
import { serviceGroups, whatsappLink } from "@/data/site";

const title = "Services — Printing, Photo, Apparel & Online Forms | DIGISERVE SOLUTION";
const description =
  "Over 40 services: black & white and colour printing, passport photos, t-shirt and mug printing, flex banners, rubber stamps, PAN and Aadhaar assistance in Ummulong, Meghalaya.";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Services,
});

function Services() {
  return (
    <>
      <PageHero
        eyebrow="Our capabilities"
        title="Services"
        description="Seven specialities, one counter. Everything is produced in-house so we control the quality and the timeline."
      >
        <a href={whatsappLink} target="_blank" rel="noreferrer" className="btn-neon">
          Ask for a quote
        </a>
      </PageHero>

      <Section>
        <div className="grid gap-6 lg:grid-cols-2">
          {serviceGroups.map((group) => (
            <article key={group.slug} className="glass glass-hover animate-rise p-7">
              <h2 className="text-xl font-bold">{group.title}</h2>
              <p className="mt-2 text-muted-foreground">{group.blurb}</p>
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {group.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
