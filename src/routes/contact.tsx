import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { PageHero, Section } from "@/components/site/Section";
import { business, mapsDirections, mapsEmbed, whatsappLink } from "@/data/site";

const title = "Contact Us — DIGISERVE SOLUTION, Ummulong Main Road";
const description =
  "Call, WhatsApp, email or visit DIGISERVE SOLUTION on Ummulong Main Road, Meghalaya. Open Monday to Saturday, 9:00 AM to 6:00 PM. Pickup only.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80, "Name is too long"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{7,15}$/, "Enter a valid phone number"),
  service: z.string().trim().min(2, "Tell us which service you need").max(80),
  message: z.string().trim().min(10, "Please add a few details").max(1000, "Message is too long"),
});

type Errors = Partial<Record<keyof z.infer<typeof schema>, string>>;

const fieldClass =
  "w-full rounded-lg border border-input bg-surface/60 px-4 py-3 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/70 focus:ring-2 focus:ring-ring";

function Contact() {
  const [errors, setErrors] = useState<Errors>({});

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const result = schema.safeParse(data);
    if (!result.success) {
      const next: Errors = {};
      for (const issue of result.error.issues) {
        next[issue.path[0] as keyof Errors] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    const v = result.data;
    const text = `New enquiry for DIGISERVE SOLUTION%0A%0AName: ${encodeURIComponent(
      v.name,
    )}%0APhone: ${encodeURIComponent(v.phone)}%0AService: ${encodeURIComponent(
      v.service,
    )}%0ADetails: ${encodeURIComponent(v.message)}`;
    window.open(`https://wa.me/${business.whatsapp}?text=${text}`, "_blank", "noopener");
  }

  return (
    <>
      <PageHero
        eyebrow="Get in touch"
        title="Contact Us"
        description="Send your files, ask for a quote or reserve a slot for passport photos and document services."
      />

      <Section>
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-5">
            <div className="glass p-6">
              <h2 className="text-lg font-bold">Shop details</h2>
              <ul className="mt-5 space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{business.address}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{business.hours}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
                  <a
                    href={`tel:${business.phoneIntl}`}
                    className="text-muted-foreground hover:text-primary"
                  >
                    {business.phone}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
                  <a
                    href={`mailto:${business.email}`}
                    className="break-all text-muted-foreground hover:text-primary"
                  >
                    {business.email}
                  </a>
                </li>
              </ul>
              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                <a href={whatsappLink} target="_blank" rel="noreferrer" className="btn-neon">
                  <MessageCircle className="size-4" /> WhatsApp
                </a>
                <a href={mapsDirections} target="_blank" rel="noreferrer" className="btn-ghost-neon">
                  <Navigation className="size-4" /> Directions
                </a>
              </div>
            </div>

            <div className="glass overflow-hidden">
              <iframe
                title="DIGISERVE SOLUTION on Google Maps"
                src={mapsEmbed}
                loading="lazy"
                className="h-72 w-full"
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="glass p-6 md:p-8">
            <h2 className="text-lg font-bold">Send an enquiry</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Fill this in and we'll open WhatsApp with your details ready to send.
            </p>

            <div className="mt-6 grid gap-5">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-semibold">
                  Your name
                </label>
                <input id="name" name="name" maxLength={80} className={fieldClass} placeholder="Full name" />
                {errors.name && <p className="mt-1.5 text-sm text-destructive">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold">
                  Phone number
                </label>
                <input
                  id="phone"
                  name="phone"
                  inputMode="tel"
                  maxLength={15}
                  className={fieldClass}
                  placeholder="10-digit mobile number"
                />
                {errors.phone && <p className="mt-1.5 text-sm text-destructive">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="service" className="mb-1.5 block text-sm font-semibold">
                  Service needed
                </label>
                <input
                  id="service"
                  name="service"
                  maxLength={80}
                  className={fieldClass}
                  placeholder="e.g. Passport photo, T-shirt printing"
                />
                {errors.service && (
                  <p className="mt-1.5 text-sm text-destructive">{errors.service}</p>
                )}
              </div>

              <div>
                <label htmlFor="message" className="mb-1.5 block text-sm font-semibold">
                  Details
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  maxLength={1000}
                  className={fieldClass}
                  placeholder="Quantity, size, material, deadline…"
                />
                {errors.message && (
                  <p className="mt-1.5 text-sm text-destructive">{errors.message}</p>
                )}
              </div>

              <button type="submit" className="btn-neon w-full">
                Send via WhatsApp
              </button>
              <p className="text-xs text-muted-foreground">
                We reply during business hours. All orders are collected in store — we do not offer
                home delivery.
              </p>
            </div>
          </form>
        </div>
      </Section>
    </>
  );
}
