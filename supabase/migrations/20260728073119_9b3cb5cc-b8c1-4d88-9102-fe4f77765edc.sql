
-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin','staff','user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "admins read roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- shared updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- CATEGORIES
CREATE TABLE public.price_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  icon text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.price_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.price_categories TO authenticated;
GRANT ALL ON public.price_categories TO service_role;
ALTER TABLE public.price_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active categories" ON public.price_categories FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "admins manage categories" ON public.price_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_price_categories_updated BEFORE UPDATE ON public.price_categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- SERVICES
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.price_categories(id) ON DELETE SET NULL,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  image_url text,
  unit text NOT NULL DEFAULT 'per piece',
  price_type text NOT NULL DEFAULT 'fixed',
  base_price numeric(12,2),
  min_price numeric(12,2),
  max_price numeric(12,2),
  formula text,
  price_visibility text NOT NULL DEFAULT 'show',
  est_time text,
  tags text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  is_popular boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active services" ON public.services FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "admins manage services" ON public.services FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_services_updated BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- SERVICE OPTIONS
CREATE TABLE public.service_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  group_name text NOT NULL,
  label text NOT NULL,
  extra_cost numeric(12,2) NOT NULL DEFAULT 0,
  is_percent boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.service_options TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_options TO authenticated;
GRANT ALL ON public.service_options TO service_role;
ALTER TABLE public.service_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active options" ON public.service_options FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "admins manage options" ON public.service_options FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_service_options_updated BEFORE UPDATE ON public.service_options FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- BULK DISCOUNT SLABS
CREATE TABLE public.bulk_discount_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES public.services(id) ON DELETE CASCADE,
  label text NOT NULL,
  min_qty int NOT NULL DEFAULT 1,
  max_qty int,
  rate numeric(12,2),
  discount_percent numeric(5,2),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.bulk_discount_tiers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bulk_discount_tiers TO authenticated;
GRANT ALL ON public.bulk_discount_tiers TO service_role;
ALTER TABLE public.bulk_discount_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active tiers" ON public.bulk_discount_tiers FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "admins manage tiers" ON public.bulk_discount_tiers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_tiers_updated BEFORE UPDATE ON public.bulk_discount_tiers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- URGENT / SURCHARGES
CREATE TABLE public.surcharges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  label text NOT NULL,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  is_percent boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.surcharges TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.surcharges TO authenticated;
GRANT ALL ON public.surcharges TO service_role;
ALTER TABLE public.surcharges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active surcharges" ON public.surcharges FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "admins manage surcharges" ON public.surcharges FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_surcharges_updated BEFORE UPDATE ON public.surcharges FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- OFFERS & COUPONS
CREATE TABLE public.offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE,
  title text NOT NULL,
  description text,
  offer_type text NOT NULL DEFAULT 'percentage',
  audience text NOT NULL DEFAULT 'all',
  value numeric(12,2) NOT NULL DEFAULT 0,
  buy_qty int,
  get_qty int,
  min_order_amount numeric(12,2) NOT NULL DEFAULT 0,
  max_uses int,
  used_count int NOT NULL DEFAULT 0,
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.offers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.offers TO authenticated;
GRANT ALL ON public.offers TO service_role;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active offers" ON public.offers FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "admins manage offers" ON public.offers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_offers_updated BEFORE UPDATE ON public.offers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.services;
ALTER PUBLICATION supabase_realtime ADD TABLE public.price_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_options;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bulk_discount_tiers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.surcharges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.offers;

-- SEED CATEGORIES
INSERT INTO public.price_categories (slug, name, description, icon, sort_order) VALUES
 ('printing','Printing & Copying','Everyday document work with sharp output and same-day turnaround.','Printer',1),
 ('photo','Photo & Frames','Studio-quality photo output, frames and canvas.','Camera',2),
 ('apparel','Apparel & Gifts','Custom garment and gift printing.','Shirt',3),
 ('large-format','Large Format & Branding','Outdoor and indoor branding.','Megaphone',4),
 ('cards','Cards & Stationery','Premium card stock, finishes and typesetting.','CreditCard',5),
 ('stamps','Stamps & Seals','Precision-cut stamps and seals.','Stamp',6),
 ('online-services','Online & Government Services','Form filling and application assistance.','Globe',7);

-- SEED SERVICES (existing published rates)
INSERT INTO public.services (category_id, slug, name, unit, price_type, base_price, est_time, is_popular, sort_order)
SELECT c.id, v.slug, v.name, v.unit, v.price_type, v.base_price, v.est_time, v.is_popular, v.sort_order
FROM (VALUES
 ('printing','bw-print','Black & White Print','per page','per_page',3,'Within 1 hour',true,1),
 ('printing','colour-print','Colour Print','per page','per_page',10,'Within 1 hour',true,2),
 ('printing','photocopy','Photocopy / Xerox','per page','per_copy',2,'Instant',true,3),
 ('printing','scanning','Document Scanning','per page','per_page',5,'Within 1 hour',false,4),
 ('printing','lamination-a4','Lamination (A4)','per sheet','per_piece',30,'15 minutes',false,5),
 ('printing','spiral-binding','Spiral Binding','per book','per_book',50,'30 minutes',false,6),
 ('photo','passport-photo','Passport Size Photo','8 copies','fixed',80,'20 minutes',true,1),
 ('photo','photo-print-4x6','Photo Print 4x6','per print','per_photo',25,'Within 1 hour',false,2),
 ('photo','photo-frame-a4','Photo Frame A4','per frame','per_frame',350,'1 day',false,3),
 ('photo','canvas-12x18','Canvas Print 12x18','per piece','per_piece',950,'2 days',false,4),
 ('apparel','tshirt-printing','T-Shirt Printing','per piece','per_piece',350,'1-2 days',true,1),
 ('apparel','sports-jersey','Sports Jersey','per piece','per_piece',450,'2-3 days',false,2),
 ('apparel','hoodie','Hoodie / Sweatshirt','per piece','per_piece',850,'2-3 days',false,3),
 ('apparel','ceramic-mug','Ceramic Mug','per mug','per_item',250,'1 day',false,4),
 ('apparel','magic-mug','Magic Mug','per mug','per_item',350,'1 day',false,5),
 ('large-format','flex-banner','Flex Banner','per sq. ft.','per_sqft',18,'1 day',true,1),
 ('large-format','vinyl-printing','Vinyl Printing','per sq. ft.','per_sqft',35,'1 day',false,2),
 ('cards','business-cards','Business Cards','per 100','fixed',300,'1-2 days',true,1),
 ('cards','wedding-cards','Wedding Cards','per 100','fixed',1200,'2-3 days',false,2),
 ('stamps','rubber-stamp','Rubber Stamp','per stamp','per_item',200,'1 day',false,1),
 ('stamps','self-ink-stamp','Self Ink Stamp','per stamp','per_item',450,'1-2 days',false,2)
) AS v(cat, slug, name, unit, price_type, base_price, est_time, is_popular, sort_order)
JOIN public.price_categories c ON c.slug = v.cat;

INSERT INTO public.services (category_id, slug, name, unit, price_type, price_visibility, est_time, sort_order)
SELECT c.id, v.slug, v.name, 'per application', 'contact', 'contact', 'Same day', v.sort_order
FROM (VALUES
 ('online-services','pan-card','PAN Card Assistance',1),
 ('online-services','aadhaar-update','Aadhaar Update Assistance',2),
 ('online-services','exam-forms','Exam Form Filling',3),
 ('online-services','job-applications','Job Applications',4)
) AS v(cat, slug, name, sort_order)
JOIN public.price_categories c ON c.slug = v.cat;

-- SEED SURCHARGES
INSERT INTO public.surcharges (code, label, amount, is_percent, is_active) VALUES
 ('urgent','Urgent Charge',20,true,false),
 ('same_day','Same Day Charge',15,true,false),
 ('express','Express Charge',30,true,false),
 ('weekend','Weekend Charge',10,true,false),
 ('night','Night Charge',15,true,false),
 ('holiday','Holiday Charge',20,true,false);
