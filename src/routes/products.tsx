import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PageHero, Section } from "@/components/site/Section";
import { galleryItems } from "@/data/gallery";
import { whatsappLink } from "@/data/site";

const title = "Products — Cards, Apparel, Mugs, Banners & Stamps | DIGISERVE SOLUTION";
const description =
  "Browse DIGISERVE SOLUTION products: business cards, passport photos, custom t-shirts, photo mugs, canvas frames, flex banners and rubber stamps with sample design mockups and starting prices.";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Products,
});

function Products() {
  return (
    <>
      <PageHero
        eyebrow="Catalogue"
        title="Products"
        description="Starting prices for our most requested items. All mockups shown are marked Sample Design — your artwork replaces them."
      />

      <Section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {galleryItems.map((item) => (
            <article key={item.id} className="glass glass-hover animate-rise flex flex-col overflow-hidden">
              <img
                src={item.image}
                alt={item.alt}
                loading="lazy"
                width={1024}
                height={1024}
                className="aspect-square w-full object-cover"
              />
              <div className="flex flex-1 flex-col p-6">
                <p className="text-xs uppercase tracking-widest text-primary">{item.category}</p>
                <h2 className="mt-1.5 text-lg font-bold">{item.title}</h2>
                <ul className="mt-4 flex-1 space-y-2">
                  {item.includes.map((inc) => (
                    <li key={inc} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      {inc}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4">
                  <span>
                    <span className="block text-xs uppercase tracking-widest text-muted-foreground">
                      From
                    </span>
                    <span className="font-display text-lg font-extrabold neon-text">
                      {item.from}
                    </span>
                  </span>
                  <a href={whatsappLink} target="_blank" rel="noreferrer" className="btn-neon">
                    Order
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="glass mt-12 p-8 text-center">
          <h2 className="text-2xl font-bold">Need something not listed?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            We also handle certificates, calendars, stickers, labels, brochures, wedding cards and
            custom gifts. Tell us what you need and we'll quote it.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/pricing" className="btn-ghost-neon">
              See price list
            </Link>
            <Link to="/contact" className="btn-neon">
              Contact us
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
