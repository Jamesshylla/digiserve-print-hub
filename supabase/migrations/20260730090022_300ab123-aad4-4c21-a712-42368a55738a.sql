CREATE TABLE public.t_shirt_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_code text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  notes text,
  garment_slug text NOT NULL,
  garment_name text NOT NULL,
  garment_color text NOT NULL DEFAULT '#ffffff',
  size text NOT NULL DEFAULT 'M',
  quantity integer NOT NULL DEFAULT 1,
  design jsonb NOT NULL DEFAULT '{}'::jsonb,
  front_preview_path text,
  back_preview_path text,
  amount numeric NOT NULL DEFAULT 0,
  coupon_code text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT INSERT ON public.t_shirt_orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.t_shirt_orders TO authenticated;
GRANT ALL ON public.t_shirt_orders TO service_role;

ALTER TABLE public.t_shirt_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can submit a design order"
  ON public.t_shirt_orders FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "admins manage design orders"
  ON public.t_shirt_orders FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER t_shirt_orders_set_updated_at
  BEFORE UPDATE ON public.t_shirt_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();