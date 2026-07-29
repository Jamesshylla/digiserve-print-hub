import {
  applyOffer,
  offerIsLive,
  tierRateFor,
  type BulkTier,
  type Offer,
  type Service,
  type Surcharge,
} from "./pricing";

export type QuoteInput = {
  service: Service;
  qty: number;
  tiers: BulkTier[];
  offers: Offer[];
  surcharges: Surcharge[];
  activeSurchargeCodes: string[];
  couponCode?: string;
};

export type QuoteLine = { label: string; amount: number };

export type QuoteResult = {
  ok: boolean;
  message?: string;
  unitRate: number;
  effectiveRate: number;
  chargeableQty: number;
  tierLabel: string | null;
  subtotal: number;
  discount: number;
  discountLabel: string | null;
  couponError: string | null;
  surchargeLines: QuoteLine[];
  total: number;
};

/** Buy X get Y — free units are removed from the chargeable quantity. */
function freeUnits(offer: Offer, qty: number): number {
  const buy = offer.buy_qty ?? 0;
  const get = offer.get_qty ?? 0;
  if (buy <= 0 || get <= 0) return 0;
  return Math.floor(qty / (buy + get)) * get;
}

export function findCoupon(offers: Offer[], code: string): Offer | undefined {
  const wanted = code.trim().toUpperCase();
  if (!wanted) return undefined;
  return offers.find((o) => (o.code ?? "").trim().toUpperCase() === wanted);
}

/** Single source of truth for what a customer actually pays. */
export function buildQuote(input: QuoteInput): QuoteResult {
  const { service, tiers, offers, surcharges, activeSurchargeCodes } = input;
  const qty = Math.max(1, Math.floor(input.qty || 1));

  const base = Number(service.base_price ?? service.min_price ?? 0);
  const priceless =
    service.price_type === "contact" ||
    service.price_visibility === "contact" ||
    service.price_visibility === "quote" ||
    !base;

  const empty: QuoteResult = {
    ok: false,
    message: "Contact for Price",
    unitRate: 0,
    effectiveRate: 0,
    chargeableQty: qty,
    tierLabel: null,
    subtotal: 0,
    discount: 0,
    discountLabel: null,
    couponError: null,
    surchargeLines: [],
    total: 0,
  };
  if (priceless) return empty;

  const serviceTiers = tiers.filter((t) => t.service_id === service.id && t.is_active);
  const { rate, tier } = tierRateFor(serviceTiers, qty, base);

  let chargeableQty = qty;
  let discount = 0;
  let discountLabel: string | null = null;
  let couponError: string | null = null;

  const rawSubtotal = rate * chargeableQty;

  if (input.couponCode?.trim()) {
    const coupon = findCoupon(offers, input.couponCode);
    if (!coupon) {
      couponError = "Coupon code not recognised.";
    } else if (!offerIsLive(coupon)) {
      couponError =
        coupon.max_uses !== null && coupon.used_count >= coupon.max_uses
          ? "This coupon has reached its usage limit."
          : "This coupon has expired or is not active.";
    } else if (rawSubtotal < Number(coupon.min_order_amount ?? 0)) {
      couponError = `Minimum order of ₹${coupon.min_order_amount} required for this coupon.`;
    } else if (coupon.offer_type === "buy_x_get_y") {
      const free = freeUnits(coupon, qty);
      if (free <= 0) {
        couponError = `Add more quantity to unlock ${coupon.title}.`;
      } else {
        chargeableQty = qty - free;
        discountLabel = `${coupon.title} (${free} free)`;
      }
    } else if (coupon.offer_type === "free_service") {
      discount = rawSubtotal;
      discountLabel = coupon.title;
    } else {
      discount = applyOffer(rawSubtotal, coupon);
      if (discount <= 0) couponError = "This coupon does not apply to this order.";
      else discountLabel = coupon.title;
    }
  }

  const subtotal = rate * chargeableQty;
  const afterDiscount = Math.max(0, subtotal - discount);

  const surchargeLines: QuoteLine[] = surcharges
    .filter((s) => s.is_active && activeSurchargeCodes.includes(s.code))
    .map((s) => ({
      label: s.label,
      amount: s.is_percent
        ? (afterDiscount * Number(s.amount)) / 100
        : Number(s.amount),
    }));

  const total = surchargeLines.reduce((sum, l) => sum + l.amount, afterDiscount);

  return {
    ok: true,
    unitRate: base,
    effectiveRate: rate,
    chargeableQty,
    tierLabel: tier?.label ?? null,
    subtotal,
    discount,
    discountLabel,
    couponError,
    surchargeLines,
    total: Math.round(total * 100) / 100,
  };
}

export function generateOrderId(now = new Date()): string {
  const stamp = `${now.getFullYear()}`.slice(2) +
    `${now.getMonth() + 1}`.padStart(2, "0") +
    `${now.getDate()}`.padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `DS-${stamp}-${rand}`;
}

export function upiPayLink(params: {
  upiId: string;
  payeeName: string;
  amount: number;
  orderId: string;
}): string {
  const q = new URLSearchParams({
    pa: params.upiId,
    pn: params.payeeName,
    am: params.amount.toFixed(2),
    cu: "INR",
    tn: `Order ${params.orderId}`,
  });
  return `upi://pay?${q.toString()}`;
}
