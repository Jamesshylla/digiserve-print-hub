import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { DesignOrderInput } from "./orders.schema";

function publicClient() {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(process.env.SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export async function insertDesignOrder(data: DesignOrderInput) {
  const supabase = publicClient();
  const { error } = await supabase.from("t_shirt_orders").insert({
    order_code: data.orderCode,
    customer_name: data.customerName,
    customer_phone: data.customerPhone,
    notes: data.notes || null,
    garment_slug: data.garmentSlug,
    garment_name: data.garmentName,
    garment_color: data.garmentColor,
    size: data.size,
    quantity: data.quantity,
    design: (data.design ?? {}) as never,
    front_preview_path: data.frontPreviewPath ?? null,
    back_preview_path: data.backPreviewPath ?? null,
    amount: data.amount,
    coupon_code: data.couponCode ?? null,
  });

  if (error) {
    console.error("design order insert failed", error.message);
    throw new Error("Could not save your design order. Please try again.");
  }
  return { ok: true as const, orderCode: data.orderCode };
}
