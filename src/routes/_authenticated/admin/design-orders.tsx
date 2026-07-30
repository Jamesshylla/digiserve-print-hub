import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Section } from "@/components/site/Section";
import { supabase } from "@/integrations/supabase/client";
import { formatInr } from "@/lib/pricing";

export const Route = createFileRoute("/_authenticated/admin/design-orders")({
  head: () => ({
    meta: [
      { title: "Design Orders — Admin | DIGISERVE SOLUTION" },
      { name: "description", content: "Manage 3D designer garment orders." },
      { property: "og:title", content: "Design Orders — Admin" },
      { property: "og:description", content: "Manage 3D designer garment orders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DesignOrders,
});

const STATUSES = ["pending", "paid", "printing", "ready", "collected", "cancelled"];

function DesignOrders() {
  const [previews, setPreviews] = useState<Record<string, string>>({});

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ["t-shirt-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("t_shirt_orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const openPreview = async (id: string, path: string | null) => {
    if (!path) return;
    const { data, error } = await supabase.storage
      .from("design-uploads")
      .createSignedUrl(path, 60 * 10);
    if (error || !data) {
      toast.error("Could not load the design preview.");
      return;
    }
    setPreviews((p) => ({ ...p, [id]: data.signedUrl }));
  };

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("t_shirt_orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Status updated");
      void refetch();
    }
  };

  return (
    <Section>
      <h1 className="font-display text-3xl font-extrabold">Design orders</h1>
      <p className="mt-2 text-muted-foreground">
        Every garment submitted through the live 3D designer, with artwork previews.
      </p>

      {isLoading ? (
        <p className="mt-8 flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading orders…
        </p>
      ) : orders.length === 0 ? (
        <p className="mt-8 text-muted-foreground">No design orders yet.</p>
      ) : (
        <div className="mt-8 grid gap-4">
          {orders.map((o) => (
            <div key={o.id} className="glass grid gap-4 p-5 md:grid-cols-[auto_1fr]">
              <div className="flex gap-2">
                {(["front", "back"] as const).map((sideKey) => {
                  const path =
                    sideKey === "front" ? o.front_preview_path : o.back_preview_path;
                  const key = `${o.id}-${sideKey}`;
                  if (!path) return null;
                  return previews[key] ? (
                    <img
                      key={key}
                      src={previews[key]}
                      alt={`${sideKey} design for order ${o.order_code}`}
                      className="size-28 rounded-lg border border-border object-cover"
                    />
                  ) : (
                    <button
                      key={key}
                      type="button"
                      className="btn-ghost-neon size-28"
                      onClick={() => void openPreview(key, path)}
                    >
                      Show {sideKey}
                    </button>
                  );
                })}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-display font-bold neon-text">{o.order_code}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(o.created_at).toLocaleString()}
                  </span>
                  <select
                    value={o.status}
                    onChange={(e) => void setStatus(o.id, e.target.value)}
                    className="input-line max-w-40"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="mt-2 text-sm">
                  <span className="font-semibold">{o.customer_name}</span> · {o.customer_phone}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {o.garment_name} · size {o.size} · qty {o.quantity} · colour {o.garment_color} ·{" "}
                  <span className="font-semibold text-foreground">{formatInr(Number(o.amount))}</span>
                  {o.coupon_code ? ` · coupon ${o.coupon_code}` : ""}
                </p>
                {o.notes && <p className="mt-2 text-sm text-muted-foreground">“{o.notes}”</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
