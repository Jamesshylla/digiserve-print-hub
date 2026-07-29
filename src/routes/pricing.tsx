import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Info, Send } from "lucide-react";
import { PageHero, Section } from "@/components/site/Section";
import { business } from "@/data/site";
import { useCategories, usePricingRealtime, useServices } from "@/hooks/use-pricing";

const title = "Request a Quote — Custom Print Pricing | DIGISERVE SOLUTION";
const description =
  "Tell us what you need printed and get an exact same-day quote from DIGISERVE SOLUTION, Ummulong, Meghalaya. Bulk slab rates and coupon discounts applied automatically.";

export const Route = createFileRoute("/pricing")({
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
  component: Pricing,
});

function Pricing() {
  usePricingRealtime();
  const { data: categories = [] } = useCategories();
  const { data: services = [] } = useServices();

  const [service, setService] = useState("");
  const [qty, setQty] = useState("1");
  const [details, setDetails] = useState("");

  const quoteLink = `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(
    `Quote request\nService: ${service || "(not selected)"}\nQuantity: ${qty}\nDetails: ${details || "-"}`,
  )}`;

  const groups = categories
    .map((c) => ({ category: c, rows: services.filter((s) => s.category_id === c.id) }))
    .filter((g) => g.rows.length > 0);

  return (
    <>
      <PageHero
        eyebrow="Custom quotes"
        title="Request a Price"
        description="Every job is priced on size, material, GSM, finishing and quantity — so we quote it properly instead of publishing a fixed list."
      />

      <Section>
        <div className="glass mb-10 flex items-start gap-3 p-5 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          <p>
            Send us your requirement and we'll reply with an exact price the same day. Bulk slab
            rates, festival offers and coupon codes are applied automatically at payment.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div className="glass animate-rise p-7">
            <h2 className="text-xl font-bold">Tell us what you need</h2>

            <label className="mt-6 block text-sm font-semibold" htmlFor="q-service">
              Service
            </label>
            <select
              id="q-service"
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="mt-2 w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm"
            >
              <option value="">Select a service…</option>
              {groups.map(({ category, rows }) => (
                <optgroup key={category.id} label={category.name}>
                  {rows.map((row) => (
                    <option key={row.id} value={row.name}>
                      {row.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            <label className="mt-5 block text-sm font-semibold" htmlFor="q-qty">
              Quantity / size
            </label>
            <input
              id="q-qty"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="e.g. 200 copies, or 6 ft × 4 ft"
              className="mt-2 w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm"
            />

            <label className="mt-5 block text-sm font-semibold" htmlFor="q-details">
              Details
            </label>
            <textarea
              id="q-details"
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Paper, GSM, material, finishing, deadline…"
              className="mt-2 w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm"
            />

            <a href={quoteLink} target="_blank" rel="noreferrer" className="btn-neon mt-6 w-full justify-center">
              <Send className="size-4" /> Send quote request
            </a>
          </div>

          <div className="glass animate-rise p-7">
            <h2 className="text-xl font-bold">What we price</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Everything below is quoted on request — ask for any item and we'll confirm the rate.
            </p>
            <div className="mt-5 grid gap-5">
              {groups.map(({ category, rows }) => (
                <div key={category.id}>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary">
                    {category.name}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {rows.map((r) => r.name).join(" · ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass mt-12 p-8 text-center">
          <h2 className="text-2xl font-bold">Already have a confirmed amount?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Pay instantly by Google Pay or any UPI app — bulk slabs and coupons applied at checkout.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/payment" className="btn-neon">
              Pay with GPay / UPI
            </Link>
            <Link to="/contact" className="btn-ghost-neon">
              Contact us
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
