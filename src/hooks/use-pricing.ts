import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CONTACT_FOR_PRICE, displayPrice } from "@/lib/pricing";
import type {
  BulkTier,
  Offer,
  PriceCategory,
  Service,
  ServiceOption,
  Surcharge,
} from "@/lib/pricing";

const PRICING_TABLES = [
  "services",
  "price_categories",
  "service_options",
  "bulk_discount_tiers",
  "surcharges",
  "offers",
] as const;

/** Keeps every pricing screen in sync the moment an admin saves a change. */
export function usePricingRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase.channel("pricing-live");
    for (const table of PRICING_TABLES) {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, () => {
        queryClient.invalidateQueries({ queryKey: ["pricing"] });
      });
    }
    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

export function useCategories(includeInactive = false) {
  return useQuery({
    queryKey: ["pricing", "categories", includeInactive],
    queryFn: async () => {
      let query = supabase.from("price_categories").select("*").order("sort_order");
      if (!includeInactive) query = query.eq("is_active", true);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as PriceCategory[];
    },
  });
}

export function useServices(includeInactive = false) {
  return useQuery({
    queryKey: ["pricing", "services", includeInactive],
    queryFn: async () => {
      let query = supabase
        .from("services")
        .select("*")
        .order("sort_order")
        .order("name");
      if (!includeInactive) query = query.eq("is_active", true);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Service[];
    },
  });
}

export function useServiceOptions() {
  return useQuery({
    queryKey: ["pricing", "options"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_options")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as ServiceOption[];
    },
  });
}

export function useBulkTiers() {
  return useQuery({
    queryKey: ["pricing", "tiers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bulk_discount_tiers")
        .select("*")
        .order("min_qty");
      if (error) throw error;
      return (data ?? []) as BulkTier[];
    },
  });
}

export function useSurcharges(includeInactive = false) {
  return useQuery({
    queryKey: ["pricing", "surcharges", includeInactive],
    queryFn: async () => {
      let query = supabase.from("surcharges").select("*").order("label");
      if (!includeInactive) query = query.eq("is_active", true);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Surcharge[];
    },
  });
}

export function useOffers(includeInactive = false) {
  return useQuery({
    queryKey: ["pricing", "offers", includeInactive],
    queryFn: async () => {
      let query = supabase.from("offers").select("*").order("created_at", { ascending: false });
      if (!includeInactive) query = query.eq("is_active", true);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Offer[];
    },
  });
}

export function useIsAdmin() {
  return useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (error) return false;
      return Boolean(data);
    },
  });
}

/** Looks up a live database price by service slug — used by product cards. */
export function useServicePrice() {
  const { data: services = [], isLoading } = useServices();
  const bySlug = new Map(services.map((s) => [s.slug, s]));
  return {
    isLoading,
    priceFor: (slug: string): string => {
      const service = bySlug.get(slug);
      if (!service) return CONTACT_FOR_PRICE;
      return displayPrice(service) ?? CONTACT_FOR_PRICE;
    },
  };
}
