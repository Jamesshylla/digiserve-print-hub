import { createFileRoute, Link } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { PageHero, Section } from "@/components/site/Section";
import { priceTables } from "@/data/site";

const title = "Pricing — Transparent Print Rates | DIGISERVE SOLUTION";
const description =
  "Clear, up-front pricing for printing, photocopying, passport photos, t-shirts, mugs, banners, business cards and rubber stamps at DIGISERVE SOLUTION, Ummulong, Meghalaya.";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Pricing,
});

function Pricing() {
  return (
    <>
      <PageHero
        eyebrow="Rate card"
        title="Pricing"
        description="Indicative rates so you can plan your budget before you walk in. Final pricing depends on size, GSM, finishing and quantity."
      />

      <Section>
        <div className="glass mb-10 flex items-start gap-3 p-5 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          <p>
            Prices exclude GST and are subject to change with paper and material costs. Bulk slabs
            apply automatically. Urgent same-hour jobs may carry a rush charge.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {priceTables.map((table) => (
            <div key={table.title} className="glass glass-hover animate-rise overflow-hidden">
              <div className="border-b border-border px-6 py-5">
                <h2 className="text-lg font-bold">{table.title}</h2>
                {table.note && (
                  <p className="mt-1 text-sm text-muted-foreground">{table.note}</p>
                )}
              </div>
              <table className="w-full text-left text-sm">
                <thead className="sr-only">
                  <tr>
                    <th>Item</th>
                    <th>Unit</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row) => (
                    <tr key={row.item} className="border-b border-border/60 last:border-0">
                      <td className="px-6 py-3.5 font-semibold">{row.item}</td>
                      <td className="px-3 py-3.5 text-muted-foreground">{row.unit}</td>
                      <td className="px-6 py-3.5 text-right font-display font-bold text-primary">
                        {row.price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        <div className="glass mt-12 p-8 text-center">
          <h2 className="text-2xl font-bold">Bulk or custom job?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Send us the size, quantity and material and we'll send an exact quote the same day.
          </p>
          <Link to="/contact" className="btn-neon mt-6">
            Request a quote
          </Link>
        </div>
      </Section>
    </>
  );
}
