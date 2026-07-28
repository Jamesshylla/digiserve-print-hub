import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PageHero, Section } from "@/components/site/Section";
import { whatsappLink } from "@/data/site";
import { useCategories, usePricingRealtime, useServices } from "@/hooks/use-pricing";
import { displayPrice } from "@/lib/pricing";

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Services,
});

function Services() {
  usePricingRealtime();
  const { data: categories = [], isLoading: catLoading } = useCategories();
  const { data: services = [], isLoading: svcLoading } = useServices();

  const groups = categories
    .map((c) => ({ category: c, items: services.filter((s) => s.category_id === c.id) }))
    .filter((g) => g.items.length > 0);

  return (
    <>
      <PageHero
        eyebrow="Our capabilities"
        title="Services"
        description="Everything is produced in-house so we control the quality, the price and the timeline."
      >
        <a href={whatsappLink} target="_blank" rel="noreferrer" className="btn-neon">
          Ask for a quote
        </a>
      </PageHero>

      <Section>
        {catLoading || svcLoading ? (
          <p className="text-muted-foreground">Loading services…</p>
        ) : groups.length === 0 ? (
          <p className="text-muted-foreground">
            Our service list is being updated. Please contact us on WhatsApp.
          </p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {groups.map(({ category, items }) => (
              <article key={category.id} className="glass glass-hover animate-rise p-7">
                <h2 className="text-xl font-bold">{category.name}</h2>
                {category.description && (
                  <p className="mt-2 text-muted-foreground">{category.description}</p>
                )}
                <ul className="mt-5 grid gap-2">
                  {items.map((item) => {
                    const price = displayPrice(item);
                    return (
                      <li key={item.id} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span className="flex-1 text-muted-foreground">{item.name}</span>
                        {price && (
                          <span className="shrink-0 font-display font-bold text-primary">
                            {price}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </article>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
