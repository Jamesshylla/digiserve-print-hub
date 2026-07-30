import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, Copy, RefreshCw, Smartphone, XCircle } from "lucide-react";
import { PageHero, Section } from "@/components/site/Section";
import { business, upi, whatsappLink } from "@/data/site";
import {
  useBulkTiers,
  useOffers,
  usePricingRealtime,
  useServices,
  useSurcharges,
} from "@/hooks/use-pricing";
import { formatInr } from "@/lib/pricing";
import { buildQuote, generateOrderId, upiPayLink } from "@/lib/quote";

const title = "Pay by UPI / GPay — Secure Order Payment | DIGISERVE SOLUTION";
const description =
  "Pay your DIGISERVE SOLUTION print order instantly with Google Pay, PhonePe, Paytm or any UPI app. Bulk slab rates and coupon discounts are applied automatically before you pay.";

type PaymentSearch = { order?: string; amount?: number };

export const Route = createFileRoute("/payment")({
  validateSearch: (search: Record<string, unknown>): PaymentSearch => ({
    order: typeof search.order === "string" ? search.order : undefined,
    amount: Number(search.amount) > 0 ? Number(search.amount) : undefined,
  }),
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
  component: Payment,
});


type Status = "pending" | "paid" | "failed";

function Payment() {
  usePricingRealtime();
  const { data: services = [] } = useServices();
  const { data: tiers = [] } = useBulkTiers();
  const { data: offers = [] } = useOffers();
  const { data: surcharges = [] } = useSurcharges();

  const payable = services.filter(
    (s) => s.price_type !== "contact" && s.price_visibility === "show" && s.base_price,
  );

  const [serviceId, setServiceId] = useState("");
  const [qty, setQty] = useState(1);
  const [coupon, setCoupon] = useState("");
  const [codes, setCodes] = useState<string[]>([]);
  const [orderId, setOrderId] = useState(() => generateOrderId());
  const [status, setStatus] = useState<Status>("pending");
  const [reference, setReference] = useState("");

  const service = payable.find((s) => s.id === serviceId) ?? payable[0];

  const quote = useMemo(() => {
    if (!service) return null;
    return buildQuote({
      service,
      qty,
      tiers,
      offers,
      surcharges,
      activeSurchargeCodes: codes,
      couponCode: coupon,
    });
  }, [service, qty, tiers, offers, surcharges, codes, coupon]);

  const amount = quote?.total ?? 0;
  const payLink = upiPayLink({
    upiId: upi.id,
    payeeName: upi.payeeName,
    amount,
    orderId,
  });

  const confirmLink = `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(
    `Payment for order ${orderId}\nService: ${service?.name ?? "-"}\nQty: ${qty}\nAmount: ₹${amount.toFixed(2)}\nUPI reference: ${reference || "(paste here)"}`,
  )}`;

  return (
    <>
      <PageHero
        eyebrow="Secure checkout"
        title="Pay by UPI"
        description="Pick your job, apply a coupon and pay straight into our Google Pay UPI account. Bulk slab rates and offers are applied automatically."
      />

      <Section>
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="glass animate-rise p-7">
            <h2 className="text-xl font-bold">Order details</h2>

            <label className="mt-6 block text-sm font-semibold" htmlFor="pay-service">
              Service
            </label>
            <select
              id="pay-service"
              value={service?.id ?? ""}
              onChange={(e) => setServiceId(e.target.value)}
              className="mt-2 w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm"
            >
              {payable.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {formatInr(Number(s.base_price))} {s.unit}
                </option>
              ))}
            </select>

            <label className="mt-5 block text-sm font-semibold" htmlFor="pay-qty">
              Quantity
            </label>
            <input
              id="pay-qty"
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="mt-2 w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm"
            />

            <label className="mt-5 block text-sm font-semibold" htmlFor="pay-coupon">
              Coupon code
            </label>
            <input
              id="pay-coupon"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value.toUpperCase())}
              placeholder="e.g. STUDENT10"
              className="mt-2 w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm uppercase"
            />
            {quote?.couponError && (
              <p className="mt-2 text-sm text-destructive">{quote.couponError}</p>
            )}
            {quote?.discountLabel && (
              <p className="mt-2 text-sm text-primary">{quote.discountLabel} applied.</p>
            )}

            {surcharges.length > 0 && (
              <>
                <p className="mt-6 text-sm font-semibold">Urgency / timing charges</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {surcharges.map((s) => {
                    const on = codes.includes(s.code);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() =>
                          setCodes((prev) =>
                            on ? prev.filter((c) => c !== s.code) : [...prev, s.code],
                          )
                        }
                        className={on ? "btn-neon" : "btn-ghost-neon"}
                      >
                        {s.label} +{s.is_percent ? `${s.amount}%` : formatInr(Number(s.amount))}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div className="glass animate-rise p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Order ID</p>
                <p className="font-display text-lg font-extrabold neon-text">{orderId}</p>
              </div>
              <button
                type="button"
                className="btn-ghost-neon"
                onClick={() => {
                  setOrderId(generateOrderId());
                  setStatus("pending");
                  setReference("");
                }}
              >
                <RefreshCw className="size-4" /> New
              </button>
            </div>

            <dl className="mt-6 space-y-2 text-sm">
              <Row label="Rate" value={`${formatInr(quote?.effectiveRate ?? 0)} × ${quote?.chargeableQty ?? 0}`} />
              {quote?.tierLabel && <Row label="Bulk slab" value={quote.tierLabel} />}
              <Row label="Subtotal" value={formatInr(quote?.subtotal ?? 0) ?? "₹0"} />
              {(quote?.discount ?? 0) > 0 && (
                <Row label="Discount" value={`− ${formatInr(quote?.discount ?? 0)}`} />
              )}
              {quote?.surchargeLines.map((l) => (
                <Row key={l.label} label={l.label} value={`+ ${formatInr(l.amount)}`} />
              ))}
              <div className="flex items-center justify-between border-t border-border pt-3 text-base font-bold">
                <span>Total payable</span>
                <span className="font-display neon-text">{formatInr(amount)}</span>
              </div>
            </dl>

            <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-border/70 p-5">
              <img
                src={upi.qrImage}
                alt="DIGISERVE SOLUTION UPI payment QR code"
                loading="lazy"
                width={180}
                height={180}
                className="size-40 rounded-lg bg-white p-2"
              />
              <p className="text-sm text-muted-foreground">
                UPI ID: <span className="font-semibold text-foreground">{upi.id}</span>
              </p>
              <button
                type="button"
                className="btn-ghost-neon"
                onClick={() => navigator.clipboard?.writeText(upi.id)}
              >
                <Copy className="size-4" /> Copy UPI ID
              </button>
              <a href={payLink} className="btn-neon w-full justify-center">
                <Smartphone className="size-4" /> Pay {formatInr(amount)} with GPay / UPI
              </a>
              <p className="text-center text-xs text-muted-foreground">
                Opens Google Pay, PhonePe, Paytm or BHIM on your phone with the amount pre-filled.
                On desktop, scan the QR instead.
              </p>
            </div>

            <label className="mt-6 block text-sm font-semibold" htmlFor="pay-ref">
              UPI reference number
            </label>
            <input
              id="pay-ref"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="12-digit UTR from your payment app"
              className="mt-2 w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm"
            />

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest ${
                  status === "paid"
                    ? "border-primary/50 text-primary"
                    : status === "failed"
                      ? "border-destructive/50 text-destructive"
                      : "border-border text-muted-foreground"
                }`}
              >
                {status}
              </span>
              <button
                type="button"
                className="btn-ghost-neon"
                onClick={() => setStatus("paid")}
                disabled={!reference.trim()}
              >
                <CheckCircle2 className="size-4" /> Mark paid
              </button>
              <button type="button" className="btn-ghost-neon" onClick={() => setStatus("failed")}>
                <XCircle className="size-4" /> Payment failed
              </button>
            </div>

            <a
              href={confirmLink}
              target="_blank"
              rel="noreferrer"
              className="btn-neon mt-5 w-full justify-center"
            >
              Send payment confirmation
            </a>
          </div>
        </div>

        <div className="glass mt-12 p-8 text-center">
          <h2 className="text-2xl font-bold">Not sure of the amount?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Send us the size, quantity and material — we'll confirm the exact price before you pay.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href={whatsappLink} target="_blank" rel="noreferrer" className="btn-ghost-neon">
              Ask on WhatsApp
            </a>
            <Link to="/pricing" className="btn-neon">
              Request a quote
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
