import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Loader2, RotateCw, Trash2, Type } from "lucide-react";
import { toast } from "sonner";
import { PageHero, Section } from "@/components/site/Section";
import { supabase } from "@/integrations/supabase/client";
import {
  DESIGN_FONTS,
  GARMENT_COLORS,
  GARMENT_SIZES,
  MAX_UPLOAD_BYTES,
  canvasToBlob,
  makeLayerId,
  renderSide,
  type DesignLayer,
  type DesignState,
  type SideKey,
} from "@/lib/designer";
import { submitDesignOrder } from "@/lib/orders.functions";
import { formatInr } from "@/lib/pricing";
import { buildQuote, generateOrderId } from "@/lib/quote";
import {
  useBulkTiers,
  useOffers,
  usePricingRealtime,
  useServices,
  useSurcharges,
} from "@/hooks/use-pricing";

const ShirtScene = lazy(() => import("@/components/designer/ShirtScene"));

const title = "Live 3D T-Shirt Designer — Design & Order Online | DIGISERVE SOLUTION";
const description =
  "Design your own t-shirt, hoodie or jersey in 3D. Upload artwork, add text, pick colours, spin the shirt, get an instant price and order with UPI at DIGISERVE SOLUTION.";

export const Route = createFileRoute("/designer")({
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
  component: DesignerPage,
});

const GARMENT_SLUGS = ["tshirt-printing", "hoodie", "sports-jersey"];

function DesignerPage() {
  usePricingRealtime();
  const navigate = useNavigate();
  const { data: services = [] } = useServices();
  const { data: tiers = [] } = useBulkTiers();
  const { data: offers = [] } = useOffers();
  const { data: surcharges = [] } = useSurcharges();

  const garments = services.filter((s) => GARMENT_SLUGS.includes(s.slug));
  const [garmentSlug, setGarmentSlug] = useState(GARMENT_SLUGS[0]);
  const garment = garments.find((g) => g.slug === garmentSlug) ?? garments[0];

  const [color, setColor] = useState<string>(GARMENT_COLORS[0].value);
  const [size, setSize] = useState<string>("M");
  const [qty, setQty] = useState(1);
  const [coupon, setCoupon] = useState("");
  const [side, setSide] = useState<SideKey>("front");
  const [design, setDesign] = useState<DesignState>({ front: [], back: [] });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [revision, setRevision] = useState(0);
  const [canvases, setCanvases] = useState<{
    front: HTMLCanvasElement;
    back: HTMLCanvasElement;
  } | null>(null);
  const [webgl, setWebgl] = useState(true);

  const artworkFiles = useRef(new Map<string, File>());
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const front = document.createElement("canvas");
    const back = document.createElement("canvas");
    setCanvases({ front, back });
    try {
      const probe = document.createElement("canvas");
      setWebgl(Boolean(probe.getContext("webgl2") || probe.getContext("webgl")));
    } catch {
      setWebgl(false);
    }
  }, []);

  useEffect(() => {
    if (!canvases) return;
    let cancelled = false;
    void (async () => {
      await renderSide(canvases.front, design.front, color);
      await renderSide(canvases.back, design.back, color);
      if (!cancelled) setRevision((r) => r + 1);
    })();
    return () => {
      cancelled = true;
    };
  }, [canvases, design, color]);

  const layers = design[side];
  const selected = layers.find((l) => l.id === selectedId) ?? null;

  const updateLayer = useCallback(
    (id: string, patch: Partial<DesignLayer>) => {
      setDesign((prev) => ({
        ...prev,
        [side]: prev[side].map((l) => (l.id === id ? ({ ...l, ...patch } as DesignLayer) : l)),
      }));
    },
    [side],
  );

  const removeLayer = (id: string) => {
    setDesign((prev) => ({ ...prev, [side]: prev[side].filter((l) => l.id !== id) }));
    setSelectedId(null);
  };

  const addText = () => {
    const layer: DesignLayer = {
      id: makeLayerId(),
      kind: "text",
      text: "YOUR TEXT",
      font: DESIGN_FONTS[0].value,
      color: "#22d3ee",
      size: 0.08,
      x: 0.5,
      y: 0.45,
      rotation: 0,
    };
    setDesign((prev) => ({ ...prev, [side]: [...prev[side], layer] }));
    setSelectedId(layer.id);
  };

  const onUpload = (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error("Please upload an image under 10MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result);
      const id = makeLayerId();
      artworkFiles.current.set(id, file);
      const layer: DesignLayer = {
        id,
        kind: "image",
        src,
        name: file.name,
        x: 0.5,
        y: 0.45,
        scale: 0.32,
        rotation: 0,
      };
      setDesign((prev) => ({ ...prev, [side]: [...prev[side], layer] }));
      setSelectedId(id);
    };
    reader.readAsDataURL(file);
  };

  const startDrag = (event: React.PointerEvent, layer: DesignLayer) => {
    event.preventDefault();
    setSelectedId(layer.id);
    const box = editorRef.current?.getBoundingClientRect();
    if (!box) return;
    const move = (e: PointerEvent) => {
      const x = Math.min(1, Math.max(0, (e.clientX - box.left) / box.width));
      const y = Math.min(1, Math.max(0, (e.clientY - box.top) / box.height));
      updateLayer(layer.id, { x, y });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const quote = useMemo(() => {
    if (!garment) return null;
    return buildQuote({
      service: garment,
      qty,
      tiers,
      offers,
      surcharges,
      activeSurchargeCodes: [],
      couponCode: coupon,
    });
  }, [garment, qty, tiers, offers, surcharges, coupon]);

  const amount = quote?.total ?? 0;

  const placeOrder = async () => {
    if (!garment || !canvases) return;
    if (name.trim().length < 2 || phone.trim().length < 6) {
      toast.error("Please add your name and phone number.");
      return;
    }
    if (design.front.length === 0 && design.back.length === 0) {
      toast.error("Add some artwork or text first.");
      return;
    }
    setSaving(true);
    const orderCode = generateOrderId();
    try {
      const paths: Record<string, string | null> = { front: null, back: null };
      for (const key of ["front", "back"] as SideKey[]) {
        if (design[key].length === 0) continue;
        const blob = await canvasToBlob(canvases[key]);
        const path = `${orderCode}/${key}-preview.png`;
        const { error } = await supabase.storage.from("design-uploads").upload(path, blob, {
          contentType: "image/png",
          upsert: false,
        });
        if (error) throw error;
        paths[key] = path;
      }

      for (const [id, file] of artworkFiles.current) {
        const inUse = [...design.front, ...design.back].some((l) => l.id === id);
        if (!inUse) continue;
        await supabase.storage
          .from("design-uploads")
          .upload(`${orderCode}/artwork-${id}-${file.name}`, file, { upsert: false });
      }

      const stripped: DesignState = {
        front: design.front.map((l) => (l.kind === "image" ? { ...l, src: "" } : l)),
        back: design.back.map((l) => (l.kind === "image" ? { ...l, src: "" } : l)),
      };

      await submitDesignOrder({
        data: {
          orderCode,
          customerName: name,
          customerPhone: phone,
          notes,
          garmentSlug: garment.slug,
          garmentName: garment.name,
          garmentColor: color,
          size,
          quantity: qty,
          design: stripped,
          frontPreviewPath: paths.front,
          backPreviewPath: paths.back,
          amount,
          couponCode: coupon.trim() || null,
        },
      });

      toast.success("Design saved — continue to payment.");
      void navigate({ to: "/payment", search: { order: orderCode, amount } });
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Could not save your design.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Live 3D designer"
        title="Design your own shirt"
        description="Upload your artwork, add text, choose your fabric colour and spin the shirt in 3D. The price updates live and you can order in one tap."
      />

      <Section>
        <div className="grid gap-6 xl:grid-cols-[1fr_1.05fr]">
          {/* 3D preview */}
          <div className="glass animate-rise overflow-hidden p-3">
            <div className="relative h-[26rem] w-full overflow-hidden rounded-xl bg-[#070b16] sm:h-[32rem]">
              {canvases && webgl ? (
                <ClientOnly fallback={<PreviewSkeleton />}>
                  <Suspense fallback={<PreviewSkeleton />}>
                    <ShirtScene
                      garmentColor={color}
                      frontCanvas={canvases.front}
                      backCanvas={canvases.back}
                      revision={revision}
                    />
                  </Suspense>
                </ClientOnly>
              ) : (
                <FlatPreview canvases={canvases} revision={revision} />
              )}
              <p className="pointer-events-none absolute bottom-3 left-0 right-0 text-center text-xs text-muted-foreground">
                {webgl ? "Drag to rotate · scroll to zoom" : "Flat preview (3D not supported here)"}
              </p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-sm font-semibold">Fabric colour</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {GARMENT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      aria-label={c.label}
                      onClick={() => setColor(c.value)}
                      style={{ background: c.value }}
                      className={`size-8 rounded-full border-2 transition ${
                        color === c.value ? "border-primary scale-110" : "border-border"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold">Size</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {GARMENT_SIZES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      className={size === s ? "btn-neon" : "btn-ghost-neon"}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="glass animate-rise p-6">
            <div className="flex flex-wrap items-center gap-2">
              {(["front", "back"] as SideKey[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSide(s);
                    setSelectedId(null);
                  }}
                  className={side === s ? "btn-neon" : "btn-ghost-neon"}
                >
                  {s === "front" ? "Front" : "Back"}
                </button>
              ))}
              <span className="ml-auto text-xs text-muted-foreground">
                Drag artwork to position it
              </span>
            </div>

            <div
              ref={editorRef}
              className="relative mt-4 aspect-square w-full overflow-hidden rounded-xl border border-border"
              style={{ background: color, containerType: "inline-size" }}
            >
              <div className="pointer-events-none absolute inset-[18%] rounded-md border border-dashed border-foreground/30" />
              {layers.map((layer) => (
                <div
                  key={layer.id}
                  onPointerDown={(e) => startDrag(e, layer)}
                  className={`absolute cursor-move select-none ${
                    selectedId === layer.id ? "outline outline-2 outline-primary" : ""
                  }`}
                  style={{
                    left: `${layer.x * 100}%`,
                    top: `${layer.y * 100}%`,
                    transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
                    width: layer.kind === "image" ? `${layer.scale * 100}%` : undefined,
                  }}
                >
                  {layer.kind === "image" ? (
                    <img src={layer.src} alt={layer.name} className="pointer-events-none w-full" />
                  ) : (
                    <span
                      className="pointer-events-none block whitespace-nowrap font-bold leading-none"
                      style={{
                        color: layer.color,
                        fontFamily: layer.font,
                        fontSize: `${layer.size * 100}cqw`,
                      }}
                    >
                      {layer.text}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <label className="btn-ghost-neon cursor-pointer">
                <ImagePlus className="size-4" /> Upload image
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    onUpload(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
              <button type="button" className="btn-ghost-neon" onClick={addText}>
                <Type className="size-4" /> Add text
              </button>
              {selected && (
                <button
                  type="button"
                  className="btn-ghost-neon"
                  onClick={() => removeLayer(selected.id)}
                >
                  <Trash2 className="size-4" /> Remove
                </button>
              )}
            </div>

            {selected && (
              <div className="mt-5 space-y-4 rounded-xl border border-border/70 p-4">
                {selected.kind === "text" ? (
                  <>
                    <Field label="Text">
                      <input
                        value={selected.text}
                        maxLength={40}
                        onChange={(e) => updateLayer(selected.id, { text: e.target.value })}
                        className="input-line"
                      />
                    </Field>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Font">
                        <select
                          value={selected.font}
                          onChange={(e) => updateLayer(selected.id, { font: e.target.value })}
                          className="input-line"
                        >
                          {DESIGN_FONTS.map((f) => (
                            <option key={f.value} value={f.value}>
                              {f.label}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Colour">
                        <input
                          type="color"
                          value={selected.color}
                          onChange={(e) => updateLayer(selected.id, { color: e.target.value })}
                          className="h-10 w-full rounded-lg border border-border bg-transparent"
                        />
                      </Field>
                    </div>
                    <Slider
                      label="Text size"
                      value={selected.size}
                      min={0.02}
                      max={0.2}
                      step={0.005}
                      onChange={(v) => updateLayer(selected.id, { size: v })}
                    />
                  </>
                ) : (
                  <Slider
                    label="Image size"
                    value={selected.scale}
                    min={0.05}
                    max={0.9}
                    step={0.01}
                    onChange={(v) => updateLayer(selected.id, { scale: v })}
                  />
                )}
                <Slider
                  label="Rotation"
                  value={selected.rotation}
                  min={-180}
                  max={180}
                  step={1}
                  onChange={(v) => updateLayer(selected.id, { rotation: v })}
                  icon={<RotateCw className="size-3.5" />}
                />
              </div>
            )}
          </div>
        </div>

        {/* Quote + order */}
        <div className="glass animate-rise mt-6 grid gap-6 p-6 lg:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="text-xl font-bold">Instant quote</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Garment">
                <select
                  value={garment?.slug ?? ""}
                  onChange={(e) => setGarmentSlug(e.target.value)}
                  className="input-line"
                >
                  {garments.map((g) => (
                    <option key={g.id} value={g.slug}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Quantity">
                <input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                  className="input-line"
                />
              </Field>
              <Field label="Coupon code">
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  placeholder="Optional"
                  className="input-line uppercase"
                />
              </Field>
            </div>
            {quote?.couponError && (
              <p className="mt-2 text-sm text-destructive">{quote.couponError}</p>
            )}
            {quote?.discountLabel && (
              <p className="mt-2 text-sm text-primary">{quote.discountLabel} applied.</p>
            )}
            <dl className="mt-5 space-y-2 text-sm">
              <QuoteRow
                label="Rate"
                value={`${formatInr(quote?.effectiveRate ?? 0)} × ${quote?.chargeableQty ?? 0}`}
              />
              {quote?.tierLabel && <QuoteRow label="Bulk slab" value={quote.tierLabel} />}
              {(quote?.discount ?? 0) > 0 && (
                <QuoteRow label="Discount" value={`− ${formatInr(quote?.discount ?? 0)}`} />
              )}
              <div className="flex items-center justify-between border-t border-border pt-3 text-base font-bold">
                <span>Total</span>
                <span className="font-display neon-text">{formatInr(amount)}</span>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="text-xl font-bold">Your details</h2>
            <div className="mt-4 space-y-3">
              <Field label="Name">
                <input
                  value={name}
                  maxLength={100}
                  onChange={(e) => setName(e.target.value)}
                  className="input-line"
                />
              </Field>
              <Field label="Phone / WhatsApp">
                <input
                  value={phone}
                  maxLength={20}
                  inputMode="tel"
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-line"
                />
              </Field>
              <Field label="Notes (optional)">
                <textarea
                  value={notes}
                  maxLength={500}
                  rows={3}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-line"
                />
              </Field>
            </div>
            <button
              type="button"
              onClick={() => void placeOrder()}
              disabled={saving}
              className="btn-neon mt-5 w-full justify-center"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              {saving ? "Saving design…" : `Order & pay ${formatInr(amount)}`}
            </button>
            <p className="mt-3 text-xs text-muted-foreground">
              Pickup only from Ummulong Main Road. We check your artwork before printing and call
              you if anything needs a higher resolution.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}

function PreviewSkeleton() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      <Loader2 className="mr-2 size-4 animate-spin" /> Loading 3D preview…
    </div>
  );
}

function FlatPreview({
  canvases,
  revision,
}: {
  canvases: { front: HTMLCanvasElement; back: HTMLCanvasElement } | null;
  revision: number;
}) {
  const [urls, setUrls] = useState<{ front: string; back: string } | null>(null);
  useEffect(() => {
    if (!canvases) return;
    setUrls({
      front: canvases.front.toDataURL("image/png"),
      back: canvases.back.toDataURL("image/png"),
    });
  }, [canvases, revision]);
  if (!urls) return <PreviewSkeleton />;
  return (
    <div className="grid h-full grid-cols-2 gap-3 p-4">
      <img src={urls.front} alt="Front design preview" className="h-full w-full object-contain" />
      <img src={urls.back} alt="Back design preview" className="h-full w-full object-contain" />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <div className="mt-1.5 font-normal">{children}</div>
    </label>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  icon,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  icon?: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-semibold">
      <span className="flex items-center gap-1.5">
        {icon} {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-primary"
      />
    </label>
  );
}

function QuoteRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
