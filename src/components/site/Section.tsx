import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Section({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24", className)}>
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <div
      className={cn(
        "animate-rise",
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl",
      )}
    >
      {eyebrow && <span className="chip">{eyebrow}</span>}
      <h2 className="mt-4 text-3xl font-extrabold leading-tight md:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-muted-foreground md:text-lg">{description}</p>}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden border-b border-border/70 hero-surface">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-50" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
        <div className="max-w-3xl animate-rise">
          <span className="chip">{eyebrow}</span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] md:text-6xl">
            <span className="neon-text">{title}</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">{description}</p>
          {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
        </div>
      </div>
    </div>
  );
}
