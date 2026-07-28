import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero, Section } from "@/components/site/Section";
import { galleryCategories, galleryItems } from "@/data/gallery";
import { cn } from "@/lib/utils";

const title = "Gallery — Sample Design Mockups | DIGISERVE SOLUTION";
const description =
  "Professional sample mockups of printed products from DIGISERVE SOLUTION: passport photos, business cards, jerseys, mugs, canvas frames, banners and company seals.";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Gallery,
});

function Gallery() {
  const [active, setActive] = useState("All");
  const items =
    active === "All" ? galleryItems : galleryItems.filter((i) => i.category === active);

  return (
    <>
      <PageHero
        eyebrow="Our work"
        title="Gallery"
        description="Every image is a professional mockup watermarked Sample Design. Your own artwork or photos take their place on the real print."
      />

      <Section>
        <div className="flex flex-wrap justify-center gap-2">
          {galleryCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActive(cat)}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors",
                active === cat
                  ? "border-primary/60 bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:text-primary",
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <figure key={item.id} className="glass glass-hover animate-rise group overflow-hidden">
              <div className="relative overflow-hidden">
                <img
                  src={item.image}
                  alt={item.alt}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-3 top-3 chip bg-background/70">Sample Design</span>
              </div>
              <figcaption className="p-5">
                <p className="text-xs uppercase tracking-widest text-primary">{item.category}</p>
                <h2 className="mt-1 font-bold">{item.title}</h2>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>
    </>
  );
}
