import { createFileRoute, Link } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { PageHero, Section } from "@/components/site/Section";
import { useCategories, usePricingRealtime, useServices } from "@/hooks/use-pricing";
import { displayPrice } from "@/lib/pricing";

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pricing,
});

function Pricing() {
  usePricingRealtime();
  const { data: categories = [], isLoading: catLoading } = useCategories();
  const { data: services = [], isLoading: svcLoading } = useServices();

  const loading = catLoading || svcLoading;
  const groups = categories
    .map((c) => ({ category: c, rows: services.filter((s) => s.category_id === c.id) }))
    .filter((g) => g.rows.length > 0);

  return (
    <>
      <PageHero
        eyebrow="Rate card"
        title="Pricing"
        description="Live rates straight from our shop counter system. Final pricing depends on size, GSM, finishing and quantity."
      />

      <Section>
        <div className="glass mb-10 flex items-start gap-3 p-5 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          <p>
            Prices exclude GST and are updated by us as paper and material costs change. Bulk slabs
            apply automatically. Urgent same-hour jobs may carry a rush charge.
          </p>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading current rates…</p>
        ) : groups.length === 0 ? (
          <p className="text-muted-foreground">
            Our rate card is being updated. Please contact us for a price.
          </p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {groups.map(({ category, rows }) => (
              <div key={category.id} className="glass glass-hover animate-rise overflow-hidden">
                <div className="border-b border-border px-6 py-5">
                  <h2 className="text-lg font-bold">{category.name}</h2>
                  {category.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
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
                    {rows
                      .filter((row) => row.price_visibility !== "hide")
                      .map((row) => (
                        <tr key={row.id} className="border-b border-border/60 last:border-0">
                          <td className="px-6 py-3.5 font-semibold">{row.name}</td>
                          <td className="px-3 py-3.5 text-muted-foreground">{row.unit}</td>
                          <td className="px-6 py-3.5 text-right font-display font-bold text-primary">
                            {displayPrice(row)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}

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
