import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  MapPin,
  Sparkles,
  Star,
  Store,
  Zap,
} from "lucide-react";
import heroImage from "@/assets/hero-print.jpg";
import { Section, SectionHeading } from "@/components/site/Section";
import { business, mapsDirections, orderSteps, reviews, serviceGroups, stats, whatsappLink } from "@/data/site";
import { galleryItems } from "@/data/gallery";

const title = "DIGISERVE SOLUTION — Digital Print Shop in Ummulong, Meghalaya";
const description =
  "Printing, passport photos, t-shirts, banners, stamps and online government form assistance in Ummulong, Meghalaya. Pickup only, same-day document printing.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      <section className="relative overflow-hidden hero-surface">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-60" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <div className="animate-rise">
            <span className="chip">
              <Sparkles className="size-3.5" /> Ummulong · Meghalaya
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] md:text-6xl">
              Your entire <span className="neon-text text-glow">print & digital</span> service
              center, under one roof.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              {business.tagline}. From a single photocopy to 200 wedding cards, team jerseys, flex
              banners, rubber stamps and online government forms — designed, printed and finished
              in-house.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={whatsappLink} target="_blank" rel="noreferrer" className="btn-neon">
                Send your file <ArrowRight className="size-4" />
              </a>
              <Link to="/pricing" className="btn-ghost-neon">
                View pricing
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Clock className="size-4 text-primary" /> {business.hours}
              </span>
              <span className="flex items-center gap-2">
                <Store className="size-4 text-primary" /> Pickup only — no delivery
              </span>
            </div>
          </div>

          <div className="relative animate-fade-in">
            <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-3xl" />
            <img
              src={heroImage}
              alt="DIGISERVE SOLUTION digital printing lab with large format printers"
              width={1920}
              height={1088}
              className="relative w-full rounded-2xl border border-border object-cover shadow-[var(--shadow-deep)]"
            />
            <div className="glass absolute -bottom-6 left-4 hidden items-center gap-3 px-4 py-3 sm:flex">
              <BadgeCheck className="size-5 text-primary" />
              <div>
                <p className="font-display text-sm font-bold">Quality checked</p>
                <p className="text-xs text-muted-foreground">Every job reviewed before pickup</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="border-y border-border/70 bg-surface/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px px-4 sm:px-6 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="px-2 py-8 text-center">
              <p className="font-display text-3xl font-extrabold neon-text">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <Section>
        <SectionHeading
          eyebrow="Services"
          title={<>Everything a print shop should do — and more</>}
          description="Over 40 services grouped into seven specialities, all handled by our own team on Ummulong Main Road."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {serviceGroups.map((group) => (
            <article key={group.slug} className="glass glass-hover animate-rise p-6">
              <span className="flex size-11 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
                <Zap className="size-5 text-primary" />
              </span>
              <h3 className="mt-5 text-lg font-bold">{group.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{group.blurb}</p>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {group.items.slice(0, 5).map((item) => (
                  <li
                    key={item}
                    className="rounded-md border border-border bg-surface-2/60 px-2 py-1 text-xs text-muted-foreground"
                  >
                    {item}
                  </li>
                ))}
                {group.items.length > 5 && (
                  <li className="rounded-md px-2 py-1 text-xs font-semibold text-primary">
                    +{group.items.length - 5} more
                  </li>
                )}
              </ul>
            </article>
          ))}
          <Link
            to="/services"
            className="glass glass-hover flex animate-rise flex-col justify-between p-6"
          >
            <div>
              <h3 className="text-lg font-bold">See the full service list</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Printing, photo, apparel, branding, stationery, stamps and government services.
              </p>
            </div>
            <span className="mt-6 inline-flex items-center gap-2 font-display text-xs font-bold uppercase tracking-widest text-primary">
              Browse services <ArrowRight className="size-4" />
            </span>
          </Link>
        </div>
      </Section>

      <Section className="pt-0">
        <SectionHeading
          eyebrow="Products"
          title={<>Sample work from our print floor</>}
          description="Every mockup below is marked Sample Design. Bring your own artwork or let us design it for you."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {galleryItems.slice(0, 6).map((item) => (
            <article key={item.id} className="glass glass-hover animate-rise overflow-hidden">
              <img
                src={item.image}
                alt={item.alt}
                loading="lazy"
                width={1024}
                height={1024}
                className="aspect-square w-full object-cover"
              />
              <div className="flex items-center justify-between gap-3 p-5">
                <div>
                  <p className="text-xs uppercase tracking-widest text-primary">{item.category}</p>
                  <h3 className="mt-1 font-bold">{item.title}</h3>
                </div>
                <span className="shrink-0 font-display text-sm font-bold text-foreground">
                  {item.from}
                </span>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/gallery" className="btn-ghost-neon">
            View full gallery <ArrowRight className="size-4" />
          </Link>
        </div>
      </Section>

      <Section className="pt-0">
        <SectionHeading
          eyebrow="How it works"
          title={<>Four steps from file to pickup</>}
          description="No courier, no delivery charges, no waiting on a delivery partner."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {orderSteps.map((step, i) => (
            <div key={step.title} className="glass glass-hover animate-rise relative p-6">
              <span className="font-display text-4xl font-extrabold text-primary/25">
                0{i + 1}
              </span>
              <h3 className="mt-3 font-bold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <SectionHeading
          eyebrow="Reviews"
          title={<>What Ummulong says about us</>}
          description="Verified customers who collected their orders in store."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {reviews.map((r) => (
            <figure key={r.name} className="glass glass-hover animate-rise p-6">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={
                      i < r.rating ? "size-4 fill-primary text-primary" : "size-4 text-muted"
                    }
                  />
                ))}
                <span className="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-success">
                  <BadgeCheck className="size-3.5" /> Verified purchase
                </span>
              </div>
              <blockquote className="mt-4 text-muted-foreground">“{r.text}”</blockquote>
              <figcaption className="mt-4 font-display text-sm font-bold">
                {r.name}
                <span className="ml-2 font-sans text-xs font-medium text-muted-foreground">
                  {r.role}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <div className="glass relative overflow-hidden p-8 md:p-12">
          <div className="pointer-events-none absolute inset-0 grid-lines opacity-40" />
          <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="chip">
                <MapPin className="size-3.5" /> Visit the shop
              </span>
              <h2 className="mt-5 text-3xl font-extrabold md:text-4xl">
                Ready when you are — <span className="neon-text">collect in store</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                {business.address}. Open {business.hours}. Call ahead for urgent jobs and we'll keep
                a slot free on the machine.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href={`tel:${business.phoneIntl}`} className="btn-neon">
                  Call {business.phone}
                </a>
                <a href={mapsDirections} target="_blank" rel="noreferrer" className="btn-ghost-neon">
                  Get directions
                </a>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-border">
              <iframe
                title="DIGISERVE SOLUTION location on Google Maps"
                src={`https://www.google.com/maps?q=${business.mapsQuery}&output=embed`}
                loading="lazy"
                className="h-72 w-full"
              />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
