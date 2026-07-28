import { Link } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle, Phone, Zap } from "lucide-react";
import { business, whatsappLink } from "@/data/site";

const columns = [
  {
    title: "Explore",
    links: [
      { to: "/services", label: "Services" },
      { to: "/products", label: "Products" },
      { to: "/pricing", label: "Pricing" },
      { to: "/gallery", label: "Gallery" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About Us" },
      { to: "/contact", label: "Contact Us" },
      { to: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Policies",
    links: [
      { to: "/terms", label: "Terms & Conditions" },
      { to: "/privacy", label: "Privacy Policy" },
      { to: "/refund", label: "Refund Policy" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-border/70 bg-surface/40">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-lg border border-primary/40 bg-primary/10">
                <Zap className="size-4 text-primary" />
              </span>
              <span className="font-display text-base font-extrabold tracking-[0.16em]">
                DIGISERVE <span className="neon-text">SOLUTION</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-muted-foreground">
              {business.tagline} in Ummulong, Meghalaya. Printing, apparel, branding, stamps and
              online government service assistance — all pickup only, all done in-house.
            </p>
            <div className="mt-5 space-y-2.5 text-sm">
              <p className="flex items-start gap-2.5 text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                {business.address}
              </p>
              <p className="flex items-start gap-2.5 text-muted-foreground">
                <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
                {business.hours}
              </p>
              <a
                href={`tel:${business.phoneIntl}`}
                className="flex items-center gap-2.5 text-muted-foreground transition-colors hover:text-primary"
              >
                <Phone className="size-4 shrink-0 text-primary" />
                {business.phone}
              </a>
              <a
                href={`mailto:${business.email}`}
                className="flex items-center gap-2.5 text-muted-foreground transition-colors hover:text-primary"
              >
                <Mail className="size-4 shrink-0 text-primary" />
                {business.email}
              </a>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 text-muted-foreground transition-colors hover:text-primary"
              >
                <MessageCircle className="size-4 shrink-0 text-primary" />
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border/70 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {business.name}. All rights reserved.
          </p>
          <p className="chip">Pickup only · No home delivery</p>
        </div>
      </div>
    </footer>
  );
}
