import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Section } from "@/components/site/Section";
import { ServiceDialog, field } from "@/components/admin/ServiceDialog";
import {
  useBulkTiers,
  useCategories,
  useIsAdmin,
  useOffers,
  usePricingRealtime,
  useServiceOptions,
  useServices,
  useSurcharges,
} from "@/hooks/use-pricing";
import {
  OFFER_AUDIENCES,
  OFFER_TYPES,
  displayPrice,
  priceTypeLabel,
  type Service,
} from "@/lib/pricing";

export const Route = createFileRoute("/_authenticated/admin/pricing")({
  head: () => ({
    meta: [{ title: "Pricing Manager | DIGISERVE SOLUTION" }, { name: "robots", content: "noindex" }],
  }),
  component: PricingManager,
});

const TABS = ["Services", "Categories", "Offers & Coupons", "Urgent Charges"] as const;

function PricingManager() {
  usePricingRealtime();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: isAdmin, isLoading: adminLoading, refetch: refetchAdmin } = useIsAdmin();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Services");
  const [editing, setEditing] = useState<Service | null | undefined>(undefined);

  const services = useServices(true);
  const categories = useCategories(true);
  const options = useServiceOptions();
  const tiers = useBulkTiers();
  const offers = useOffers(true);
  const surcharges = useSurcharges(true);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["pricing"] });

  if (adminLoading) {
    return <Section>Loading…</Section>;
  }

  if (!isAdmin) {
    return (
      <Section className="max-w-lg">
        <div className="glass p-8 text-center">
          <h1 className="text-2xl font-bold">Admin access required</h1>
          <p className="mt-3 text-muted-foreground">
            Only the business owner can manage prices. If this is your shop and no owner account
            exists yet, claim it now.
          </p>
          <button
            className="btn-neon mt-6"
            onClick={async () => {
              await supabase.rpc("claim_first_admin");
              await refetchAdmin();
            }}
          >
            Claim owner account
          </button>
          <button
            className="btn-ghost-neon mt-3"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/auth", replace: true });
            }}
          >
            Sign out
          </button>
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="chip">Admin</span>
          <h1 className="mt-3 text-3xl font-extrabold">Pricing Manager</h1>
          <p className="mt-2 text-muted-foreground">
            Every price on the website comes from here. Changes appear instantly on all pages.
          </p>
        </div>
        <button
          className="btn-ghost-neon"
          onClick={async () => {
            await queryClient.cancelQueries();
            queryClient.clear();
            await supabase.auth.signOut();
            navigate({ to: "/auth", replace: true });
          }}
        >
          Sign out
        </button>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              tab === t
                ? "rounded-md bg-primary/15 px-4 py-2 text-sm font-semibold text-primary"
                : "rounded-md px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-primary"
            }
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Services" && (
        <div className="mt-6">
          <button className="btn-neon" onClick={() => setEditing(null)}>
            Add service
          </button>
          <div className="glass mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Flags</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {(services.data ?? []).map((s) => (
                  <tr key={s.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3">
                      <span className="font-semibold">{s.name}</span>
                      <span className="block text-xs text-muted-foreground">{s.unit}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {priceTypeLabel(s.price_type)}
                    </td>
                    <td className="px-4 py-3 font-display font-bold text-primary">
                      {displayPrice(s) ?? "Hidden"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {[
                        s.is_active ? "Enabled" : "Disabled",
                        s.is_featured ? "Featured" : null,
                        s.is_popular ? "Popular" : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        className="text-xs font-semibold text-primary"
                        onClick={() => setEditing(s)}
                      >
                        Edit
                      </button>
                      <button
                        className="ml-3 text-xs font-semibold text-muted-foreground"
                        onClick={async () => {
                          await supabase
                            .from("services")
                            .update({ is_active: !s.is_active })
                            .eq("id", s.id);
                          refresh();
                        }}
                      >
                        {s.is_active ? "Disable" : "Enable"}
                      </button>
                      <button
                        className="ml-3 text-xs font-semibold text-destructive"
                        onClick={async () => {
                          if (!confirm(`Delete "${s.name}"?`)) return;
                          await supabase.from("services").delete().eq("id", s.id);
                          refresh();
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Categories" && (
        <CategoriesTab categories={categories.data ?? []} onChanged={refresh} />
      )}
      {tab === "Offers & Coupons" && <OffersTab offers={offers.data ?? []} onChanged={refresh} />}
      {tab === "Urgent Charges" && (
        <SurchargesTab surcharges={surcharges.data ?? []} onChanged={refresh} />
      )}

      {editing !== undefined && (
        <ServiceDialog
          service={editing}
          categories={categories.data ?? []}
          options={options.data ?? []}
          tiers={tiers.data ?? []}
          onClose={() => setEditing(undefined)}
          onSaved={() => {
            refresh();
            setEditing(undefined);
          }}
        />
      )}
    </Section>
  );
}

function CategoriesTab({
  categories,
  onChanged,
}: {
  categories: { id: string; name: string; slug: string; is_active: boolean }[];
  onChanged: () => void;
}) {
  const [name, setName] = useState("");
  return (
    <div className="mt-6 grid gap-4">
      <div className="flex gap-2">
        <input
          className={field}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
        />
        <button
          className="btn-neon shrink-0"
          onClick={async () => {
            if (!name.trim()) return;
            await supabase.from("price_categories").insert({
              name,
              slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            });
            setName("");
            onChanged();
          }}
        >
          Add category
        </button>
      </div>
      <div className="glass divide-y divide-border">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center gap-3 px-5 py-3 text-sm">
            <input
              className={`${field} max-w-xs`}
              defaultValue={c.name}
              onBlur={async (e) => {
                if (e.target.value !== c.name) {
                  await supabase
                    .from("price_categories")
                    .update({ name: e.target.value })
                    .eq("id", c.id);
                  onChanged();
                }
              }}
            />
            <span className="flex-1 text-muted-foreground">{c.slug}</span>
            <button
              className="text-xs font-semibold text-muted-foreground"
              onClick={async () => {
                await supabase
                  .from("price_categories")
                  .update({ is_active: !c.is_active })
                  .eq("id", c.id);
                onChanged();
              }}
            >
              {c.is_active ? "Disable" : "Enable"}
            </button>
            <button
              className="text-xs font-semibold text-destructive"
              onClick={async () => {
                if (!confirm(`Delete category "${c.name}"?`)) return;
                await supabase.from("price_categories").delete().eq("id", c.id);
                onChanged();
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function OffersTab({
  offers,
  onChanged,
}: {
  offers: {
    id: string;
    title: string;
    code: string | null;
    offer_type: string;
    audience: string;
    value: number;
    min_order_amount: number;
    max_uses: number | null;
    used_count: number;
    expires_at: string | null;
    is_active: boolean;
  }[];
  onChanged: () => void;
}) {
  const [draft, setDraft] = useState({
    title: "",
    code: "",
    offer_type: "percentage",
    audience: "all",
    value: "10",
    min_order_amount: "0",
    max_uses: "",
    expires_at: "",
  });

  return (
    <div className="mt-6 grid gap-5">
      <div className="glass grid gap-3 p-5 sm:grid-cols-4">
        <input
          className={field}
          placeholder="Offer title"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        />
        <input
          className={field}
          placeholder="Coupon code (optional)"
          value={draft.code}
          onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
        />
        <select
          className={field}
          value={draft.offer_type}
          onChange={(e) => setDraft({ ...draft, offer_type: e.target.value })}
        >
          {OFFER_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          className={field}
          value={draft.audience}
          onChange={(e) => setDraft({ ...draft, audience: e.target.value })}
        >
          {OFFER_AUDIENCES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <input
          className={field}
          type="number"
          placeholder="Value"
          value={draft.value}
          onChange={(e) => setDraft({ ...draft, value: e.target.value })}
        />
        <input
          className={field}
          type="number"
          placeholder="Min order ₹"
          value={draft.min_order_amount}
          onChange={(e) => setDraft({ ...draft, min_order_amount: e.target.value })}
        />
        <input
          className={field}
          type="number"
          placeholder="Max uses"
          value={draft.max_uses}
          onChange={(e) => setDraft({ ...draft, max_uses: e.target.value })}
        />
        <input
          className={field}
          type="date"
          value={draft.expires_at}
          onChange={(e) => setDraft({ ...draft, expires_at: e.target.value })}
        />
        <button
          className="btn-neon sm:col-span-4"
          onClick={async () => {
            if (!draft.title.trim()) return;
            await supabase.from("offers").insert({
              title: draft.title,
              code: draft.code || null,
              offer_type: draft.offer_type,
              audience: draft.audience,
              value: Number(draft.value) || 0,
              min_order_amount: Number(draft.min_order_amount) || 0,
              max_uses: draft.max_uses === "" ? null : Number(draft.max_uses),
              expires_at: draft.expires_at ? new Date(draft.expires_at).toISOString() : null,
            });
            setDraft({ ...draft, title: "", code: "" });
            onChanged();
          }}
        >
          Create offer
        </button>
      </div>

      <div className="glass divide-y divide-border">
        {offers.map((o) => (
          <div key={o.id} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm">
            <span className="font-semibold">{o.title}</span>
            {o.code && <span className="chip">{o.code}</span>}
            <span className="text-primary">
              {o.offer_type === "flat" ? `₹${o.value}` : `${o.value}%`}
            </span>
            <span className="text-muted-foreground">{o.audience}</span>
            <span className="text-xs text-muted-foreground">
              min ₹{o.min_order_amount} · used {o.used_count}
              {o.max_uses ? `/${o.max_uses}` : ""}
              {o.expires_at ? ` · till ${new Date(o.expires_at).toLocaleDateString()}` : ""}
            </span>
            <span className="ml-auto flex gap-3">
              <button
                className="text-xs font-semibold text-muted-foreground"
                onClick={async () => {
                  await supabase.from("offers").update({ is_active: !o.is_active }).eq("id", o.id);
                  onChanged();
                }}
              >
                {o.is_active ? "Disable" : "Enable"}
              </button>
              <button
                className="text-xs font-semibold text-destructive"
                onClick={async () => {
                  await supabase.from("offers").delete().eq("id", o.id);
                  onChanged();
                }}
              >
                Delete
              </button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SurchargesTab({
  surcharges,
  onChanged,
}: {
  surcharges: {
    id: string;
    label: string;
    amount: number;
    is_percent: boolean;
    is_active: boolean;
  }[];
  onChanged: () => void;
}) {
  return (
    <div className="glass mt-6 divide-y divide-border">
      {surcharges.map((s) => (
        <div key={s.id} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm">
          <span className="w-44 font-semibold">{s.label}</span>
          <input
            className={`${field} max-w-28`}
            type="number"
            defaultValue={s.amount}
            onBlur={async (e) => {
              await supabase
                .from("surcharges")
                .update({ amount: Number(e.target.value) || 0 })
                .eq("id", s.id);
              onChanged();
            }}
          />
          <label className="flex items-center gap-2 text-muted-foreground">
            <input
              type="checkbox"
              checked={s.is_percent}
              onChange={async (e) => {
                await supabase
                  .from("surcharges")
                  .update({ is_percent: e.target.checked })
                  .eq("id", s.id);
                onChanged();
              }}
            />
            Percentage
          </label>
          <label className="ml-auto flex items-center gap-2 font-semibold">
            <input
              type="checkbox"
              checked={s.is_active}
              onChange={async (e) => {
                await supabase
                  .from("surcharges")
                  .update({ is_active: e.target.checked })
                  .eq("id", s.id);
                onChanged();
              }}
            />
            Enabled
          </label>
        </div>
      ))}
    </div>
  );
}
