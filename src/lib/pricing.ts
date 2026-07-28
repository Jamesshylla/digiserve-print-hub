import type { Tables } from "@/integrations/supabase/types";

export type Service = Tables<"services">;
export type PriceCategory = Tables<"price_categories">;
export type ServiceOption = Tables<"service_options">;
export type BulkTier = Tables<"bulk_discount_tiers">;
export type Surcharge = Tables<"surcharges">;
export type Offer = Tables<"offers">;

export const PRICE_TYPES = [
  { value: "fixed", label: "Fixed Price" },
  { value: "range", label: "Price Range" },
  { value: "per_page", label: "Per Page" },
  { value: "per_piece", label: "Per Piece" },
  { value: "per_sqft", label: "Per Sq. Ft." },
  { value: "per_sqm", label: "Per Sq. Meter" },
  { value: "per_hour", label: "Per Hour" },
  { value: "per_item", label: "Per Item" },
  { value: "per_book", label: "Per Book" },
  { value: "per_copy", label: "Per Copy" },
  { value: "per_photo", label: "Per Photo" },
  { value: "per_frame", label: "Per Frame" },
  { value: "per_banner", label: "Per Banner" },
  { value: "per_meter", label: "Per Meter" },
  { value: "per_kg", label: "Per KG" },
  { value: "formula", label: "Custom Formula" },
  { value: "contact", label: "Contact for Price" },
] as const;

export const PRICE_VISIBILITY = [
  { value: "show", label: "Show Price" },
  { value: "hide", label: "Hide Price" },
  { value: "contact", label: "Contact for Price" },
  { value: "quote", label: "Request Quote" },
] as const;

export const OFFER_TYPES = [
  { value: "percentage", label: "Percentage Discount" },
  { value: "flat", label: "Flat Discount" },
  { value: "buy_x_get_y", label: "Buy X Get Y" },
  { value: "free_service", label: "Free Service" },
] as const;

export const OFFER_AUDIENCES = [
  { value: "all", label: "Everyone" },
  { value: "festival", label: "Festival Offer" },
  { value: "seasonal", label: "Seasonal" },
  { value: "student", label: "Student" },
  { value: "bulk", label: "Bulk" },
  { value: "corporate", label: "Corporate" },
] as const;

export const FORMULA_PRESETS = [
  { label: "Quantity × Rate", formula: "qty * rate" },
  { label: "Width × Height × Rate", formula: "width * height * rate" },
  { label: "Pages × Copies × Rate", formula: "pages * copies * rate" },
  { label: "Area × Material Rate", formula: "area * rate" },
] as const;

export const CONTACT_FOR_PRICE = "Contact for Price";

export function formatInr(value: number | null | undefined): string | null {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value)}`;
}

export function priceTypeLabel(type: string): string {
  return PRICE_TYPES.find((t) => t.value === type)?.label ?? type;
}

/**
 * Single source of truth for how a database price renders anywhere on the site.
 * Never invents a price: if no usable value exists it returns "Contact for Price".
 */
export function displayPrice(service: {
  price_type: string;
  price_visibility: string;
  base_price: number | null;
  min_price: number | null;
  max_price: number | null;
}): string | null {
  if (service.price_visibility === "hide") return null;
  if (service.price_visibility === "contact") return CONTACT_FOR_PRICE;
  if (service.price_visibility === "quote") return "Request Quote";
  if (service.price_type === "contact") return CONTACT_FOR_PRICE;

  if (service.price_type === "range") {
    const min = formatInr(service.min_price);
    const max = formatInr(service.max_price);
    if (min && max) return `${min} – ${max}`;
    if (min) return `From ${min}`;
    return CONTACT_FOR_PRICE;
  }

  const base = formatInr(service.base_price);
  return base ?? CONTACT_FOR_PRICE;
}

/** Safe arithmetic-only evaluator for admin-authored formulas. */
export function evaluateFormula(
  formula: string,
  vars: Record<string, number>,
): number | null {
  if (!formula.trim()) return null;
  const tokens = formula.match(/[a-zA-Z_][a-zA-Z0-9_]*|\d+(\.\d+)?|[()+\-*/%]|\s+/g);
  if (!tokens || tokens.join("") !== formula) return null;

  let expr = "";
  for (const token of tokens) {
    if (/^\s+$/.test(token)) continue;
    if (/^[a-zA-Z_]/.test(token)) {
      const value = vars[token];
      if (typeof value !== "number" || Number.isNaN(value)) return null;
      expr += `(${value})`;
    } else {
      expr += token;
    }
  }
  try {
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${expr});`)() as unknown;
    return typeof result === "number" && Number.isFinite(result) ? result : null;
  } catch {
    return null;
  }
}

export function tierRateFor(
  tiers: BulkTier[],
  qty: number,
  fallbackRate: number,
): { rate: number; tier: BulkTier | null } {
  const match = tiers.find(
    (t) => qty >= t.min_qty && (t.max_qty === null || qty <= t.max_qty),
  );
  if (!match) return { rate: fallbackRate, tier: null };
  if (match.rate !== null) return { rate: Number(match.rate), tier: match };
  if (match.discount_percent !== null) {
    return { rate: fallbackRate * (1 - Number(match.discount_percent) / 100), tier: match };
  }
  return { rate: fallbackRate, tier: match };
}

export function offerIsLive(offer: Offer, now = new Date()): boolean {
  if (!offer.is_active) return false;
  if (offer.starts_at && new Date(offer.starts_at) > now) return false;
  if (offer.expires_at && new Date(offer.expires_at) < now) return false;
  if (offer.max_uses !== null && offer.used_count >= offer.max_uses) return false;
  return true;
}

export function applyOffer(subtotal: number, offer: Offer): number {
  if (subtotal < Number(offer.min_order_amount ?? 0)) return 0;
  if (offer.offer_type === "percentage") return (subtotal * Number(offer.value)) / 100;
  if (offer.offer_type === "flat") return Math.min(subtotal, Number(offer.value));
  return 0;
}
