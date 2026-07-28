import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  FORMULA_PRESETS,
  PRICE_TYPES,
  PRICE_VISIBILITY,
  type BulkTier,
  type PriceCategory,
  type Service,
  type ServiceOption,
} from "@/lib/pricing";

export const field =
  "w-full rounded-md border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary";

type Draft = Partial<Service> & { name: string; slug: string };

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ServiceDialog({
  service,
  categories,
  options,
  tiers,
  onClose,
  onSaved,
}: {
  service: Service | null;
  categories: PriceCategory[];
  options: ServiceOption[];
  tiers: BulkTier[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(
    service ?? {
      name: "",
      slug: "",
      unit: "per piece",
      price_type: "fixed",
      price_visibility: "show",
      is_active: true,
      is_featured: false,
      is_popular: false,
      sort_order: 0,
      tags: [],
    },
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  async function uploadImage(file: File) {
    setBusy(true);
    try {
      const path = `${Date.now()}-${slugify(file.name)}`;
      const { error: upErr } = await supabase.storage
        .from("service-images")
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = await supabase.storage
        .from("service-images")
        .createSignedUrl(path, 60 * 60 * 24 * 365);
      if (data?.signedUrl) set({ image_url: data.signedUrl });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    setBusy(true);
    setError(null);
    const payload = {
      name: draft.name,
      slug: draft.slug || slugify(draft.name),
      category_id: draft.category_id ?? null,
      description: draft.description ?? null,
      image_url: draft.image_url ?? null,
      unit: draft.unit ?? "per piece",
      price_type: draft.price_type ?? "fixed",
      base_price: draft.base_price === undefined ? null : draft.base_price,
      min_price: draft.min_price ?? null,
      max_price: draft.max_price ?? null,
      formula: draft.formula ?? null,
      price_visibility: draft.price_visibility ?? "show",
      est_time: draft.est_time ?? null,
      tags: draft.tags ?? [],
      is_active: draft.is_active ?? true,
      is_featured: draft.is_featured ?? false,
      is_popular: draft.is_popular ?? false,
      sort_order: draft.sort_order ?? 0,
    };
    const { error: dbErr } = service
      ? await supabase.from("services").update(payload).eq("id", service.id)
      : await supabase.from("services").insert(payload);
    setBusy(false);
    if (dbErr) {
      setError(dbErr.message);
      return;
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-background/80 p-4 backdrop-blur-sm">
      <div className="glass mx-auto max-w-3xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{service ? "Edit service" : "Add service"}</h2>
          <button onClick={onClose} className="btn-ghost-neon">
            Close
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-semibold">
            Service name
            <input
              className={field}
              value={draft.name}
              onChange={(e) =>
                set({
                  name: e.target.value,
                  slug: service ? draft.slug : slugify(e.target.value),
                })
              }
            />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold">
            Slug
            <input
              className={field}
              value={draft.slug ?? ""}
              onChange={(e) => set({ slug: slugify(e.target.value) })}
            />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold">
            Category
            <select
              className={field}
              value={draft.category_id ?? ""}
              onChange={(e) => set({ category_id: e.target.value || null })}
            >
              <option value="">— none —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-semibold">
            Unit
            <input
              className={field}
              value={draft.unit ?? ""}
              placeholder="per page, per sq. ft., per 100…"
              onChange={(e) => set({ unit: e.target.value })}
            />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold">
            Price type
            <select
              className={field}
              value={draft.price_type ?? "fixed"}
              onChange={(e) => set({ price_type: e.target.value })}
            >
              {PRICE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-semibold">
            Price visibility
            <select
              className={field}
              value={draft.price_visibility ?? "show"}
              onChange={(e) => set({ price_visibility: e.target.value })}
            >
              {PRICE_VISIBILITY.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-semibold">
            Base price / rate (₹)
            <input
              type="number"
              step="0.01"
              className={field}
              value={draft.base_price ?? ""}
              onChange={(e) =>
                set({ base_price: e.target.value === "" ? null : Number(e.target.value) })
              }
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1.5 text-sm font-semibold">
              Min price (₹)
              <input
                type="number"
                step="0.01"
                className={field}
                value={draft.min_price ?? ""}
                onChange={(e) =>
                  set({ min_price: e.target.value === "" ? null : Number(e.target.value) })
                }
              />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold">
              Max price (₹)
              <input
                type="number"
                step="0.01"
                className={field}
                value={draft.max_price ?? ""}
                onChange={(e) =>
                  set({ max_price: e.target.value === "" ? null : Number(e.target.value) })
                }
              />
            </label>
          </div>
          <label className="grid gap-1.5 text-sm font-semibold sm:col-span-2">
            Custom formula
            <input
              className={field}
              placeholder="qty * rate"
              value={draft.formula ?? ""}
              onChange={(e) => set({ formula: e.target.value })}
            />
            <span className="flex flex-wrap gap-2 pt-1 font-normal">
              {FORMULA_PRESETS.map((p) => (
                <button
                  key={p.formula}
                  type="button"
                  onClick={() => set({ formula: p.formula, price_type: "formula" })}
                  className="chip"
                >
                  {p.label}
                </button>
              ))}
            </span>
            <span className="text-xs font-normal text-muted-foreground">
              Variables: qty, rate, width, height, pages, copies, area
            </span>
          </label>
          <label className="grid gap-1.5 text-sm font-semibold">
            Estimated completion time
            <input
              className={field}
              placeholder="Within 1 hour"
              value={draft.est_time ?? ""}
              onChange={(e) => set({ est_time: e.target.value })}
            />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold">
            Tags (comma separated)
            <input
              className={field}
              value={(draft.tags ?? []).join(", ")}
              onChange={(e) =>
                set({
                  tags: e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
            />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold sm:col-span-2">
            Description
            <textarea
              rows={3}
              className={field}
              value={draft.description ?? ""}
              onChange={(e) => set({ description: e.target.value })}
            />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold">
            Service image
            <input
              type="file"
              accept="image/*"
              className={field}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadImage(file);
              }}
            />
            {draft.image_url && (
              <img
                src={draft.image_url}
                alt={draft.name}
                className="mt-2 h-20 w-20 rounded-md object-cover"
              />
            )}
          </label>
          <label className="grid gap-1.5 text-sm font-semibold">
            Sort order
            <input
              type="number"
              className={field}
              value={draft.sort_order ?? 0}
              onChange={(e) => set({ sort_order: Number(e.target.value) })}
            />
          </label>
          <div className="flex flex-wrap gap-5 sm:col-span-2">
            {(
              [
                ["is_active", "Enabled"],
                ["is_featured", "Featured"],
                ["is_popular", "Popular"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={Boolean(draft[key])}
                  onChange={(e) => set({ [key]: e.target.checked } as Partial<Draft>)}
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {service && (
          <>
            <OptionsEditor serviceId={service.id} options={options} onChanged={onSaved} />
            <TiersEditor serviceId={service.id} tiers={tiers} onChanged={onSaved} />
          </>
        )}

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="btn-ghost-neon">
            Cancel
          </button>
          <button onClick={save} disabled={busy} className="btn-neon">
            {busy ? "Saving…" : "Save service"}
          </button>
        </div>
      </div>
    </div>
  );
}

function OptionsEditor({
  serviceId,
  options,
  onChanged,
}: {
  serviceId: string;
  options: ServiceOption[];
  onChanged: () => void;
}) {
  const rows = options.filter((o) => o.service_id === serviceId);
  const [group, setGroup] = useState("Paper Size");
  const [label, setLabel] = useState("");
  const [cost, setCost] = useState("0");
  const [isPercent, setIsPercent] = useState(false);

  async function add() {
    if (!label.trim()) return;
    await supabase.from("service_options").insert({
      service_id: serviceId,
      group_name: group,
      label,
      extra_cost: Number(cost) || 0,
      is_percent: isPercent,
    });
    setLabel("");
    onChanged();
  }

  return (
    <div className="mt-8 border-t border-border pt-6">
      <h3 className="font-bold">Service options</h3>
      <p className="text-sm text-muted-foreground">
        Paper size, GSM, material, frame type, t-shirt size/colour, lamination, binding and more —
        each with its own extra cost.
      </p>
      <div className="mt-4 grid gap-2">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center gap-3 text-sm">
            <span className="chip">{row.group_name}</span>
            <span className="flex-1 font-semibold">{row.label}</span>
            <span className="text-primary">
              +{row.is_percent ? `${row.extra_cost}%` : `₹${row.extra_cost}`}
            </span>
            <button
              className="text-xs text-destructive"
              onClick={async () => {
                await supabase.from("service_options").delete().eq("id", row.id);
                onChanged();
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-5">
        <input
          className={field}
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          placeholder="Group"
        />
        <input
          className={field}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Option"
        />
        <input
          className={field}
          type="number"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          placeholder="Extra cost"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isPercent}
            onChange={(e) => setIsPercent(e.target.checked)}
          />
          %
        </label>
        <button onClick={add} className="btn-ghost-neon justify-center">
          Add option
        </button>
      </div>
    </div>
  );
}

function TiersEditor({
  serviceId,
  tiers,
  onChanged,
}: {
  serviceId: string;
  tiers: BulkTier[];
  onChanged: () => void;
}) {
  const rows = tiers.filter((t) => t.service_id === serviceId);
  const [label, setLabel] = useState("");
  const [minQty, setMinQty] = useState("1");
  const [maxQty, setMaxQty] = useState("");
  const [rate, setRate] = useState("");

  async function add() {
    if (!label.trim()) return;
    await supabase.from("bulk_discount_tiers").insert({
      service_id: serviceId,
      label,
      min_qty: Number(minQty) || 1,
      max_qty: maxQty === "" ? null : Number(maxQty),
      rate: rate === "" ? null : Number(rate),
    });
    setLabel("");
    onChanged();
  }

  return (
    <div className="mt-8 border-t border-border pt-6">
      <h3 className="font-bold">Bulk discount slabs</h3>
      <p className="text-sm text-muted-foreground">
        Set a different rate for 1–10, 11–50, 51–100, 101–500 and 500+ copies.
      </p>
      <div className="mt-4 grid gap-2">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center gap-3 text-sm">
            <span className="flex-1 font-semibold">{row.label}</span>
            <span className="text-muted-foreground">
              {row.min_qty}–{row.max_qty ?? "∞"}
            </span>
            <span className="text-primary">₹{row.rate ?? "—"}</span>
            <button
              className="text-xs text-destructive"
              onClick={async () => {
                await supabase.from("bulk_discount_tiers").delete().eq("id", row.id);
                onChanged();
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-5">
        <input
          className={field}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="1–10 Copies"
        />
        <input
          className={field}
          type="number"
          value={minQty}
          onChange={(e) => setMinQty(e.target.value)}
          placeholder="Min qty"
        />
        <input
          className={field}
          type="number"
          value={maxQty}
          onChange={(e) => setMaxQty(e.target.value)}
          placeholder="Max qty"
        />
        <input
          className={field}
          type="number"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          placeholder="Rate ₹"
        />
        <button onClick={add} className="btn-ghost-neon justify-center">
          Add slab
        </button>
      </div>
    </div>
  );
}
