import { Link } from "@tanstack/react-router";
import { Menu, Phone, X, Zap } from "lucide-react";
import { useState } from "react";
import { business, whatsappLink } from "@/data/site";

const nav = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/products", label: "Products" },
  { to: "/pricing", label: "Pricing" },
  { to: "/designer", label: "3D Designer" },
  { to: "/gallery", label: "Gallery" },

  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
  { to: "/payment", label: "Pay" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="relative flex size-9 items-center justify-center rounded-lg border border-primary/40 bg-primary/10">
            <Zap className="size-4 text-primary" />
            <span className="absolute inset-0 animate-glow-pulse rounded-lg shadow-[var(--shadow-neon)]" />
          </span>
          <span className="leading-none">
            <span className="block font-display text-sm font-extrabold tracking-[0.18em] text-foreground">
              DIGISERVE
            </span>
            <span className="block text-[0.62rem] font-semibold tracking-[0.34em] text-primary">
              SOLUTION
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-primary bg-primary/10" }}
              className="rounded-md px-3 py-2 text-sm font-semibold tracking-wide text-muted-foreground transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <a href={`tel:${business.phoneIntl}`} className="btn-ghost-neon">
            <Phone className="size-4" />
            {business.phone}
          </a>
          <a href={whatsappLink} target="_blank" rel="noreferrer" className="btn-neon">
            Get a quote
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="rounded-md border border-border p-2 text-primary lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="animate-fade-in border-t border-border/70 bg-background/95 px-4 pb-5 pt-3 lg:hidden">
          <nav className="grid gap-1">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "text-primary bg-primary/10" }}
                className="rounded-md px-3 py-2.5 font-semibold text-muted-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 grid gap-2">
            <a href={`tel:${business.phoneIntl}`} className="btn-ghost-neon">
              <Phone className="size-4" /> Call {business.phone}
            </a>
            <a href={whatsappLink} target="_blank" rel="noreferrer" className="btn-neon">
              WhatsApp us
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
