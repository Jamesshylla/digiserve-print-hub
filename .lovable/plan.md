# Live 3D T-Shirt Designer + Real UPI Details

## 1. Fix the payment details (quick win)

Your uploaded Google Pay QR shows the real details, so the placeholder gets replaced:

- UPI ID: `jamesshylla01-1@oksbi`
- Payee name: JAMES SHYLLA
- The QR image on `/payment` is swapped for your actual scanner image

GPay/PhonePe/Paytm deep links and the QR will then work for real payments.

## 2. Live 3D T-Shirt Designer (new page `/designer`)

A rotatable 3D garment the customer designs in the browser.

**What the customer can do**
- Pick garment: T-Shirt, Hoodie/Sweatshirt, Sports Jersey (pulled live from your pricing database, not hardcoded)
- Pick garment colour from a swatch row and size S–XXL
- Upload their own image (PNG/JPG/SVG, up to 10MB) and move / resize / rotate it on the shirt
- Add text lines with font choice, colour and size
- Switch between Front and Back — each side gets its own artwork
- Spin and zoom the 3D shirt with mouse or finger; the design updates live on the model
- Set quantity and see an instant quote using your existing live pricing engine (base price, bulk slabs, coupon, urgency charges)
- Hit **Order** → design is saved and they land on the UPI payment page with the amount and order ID pre-filled

**How the 3D works**

The garment is a 3D model rendered with WebGL. The front/back artwork is drawn on a hidden 2D canvas and painted onto the shirt as a live texture, so what they see spinning is what gets printed. Fabric colour is tinted on the model. On devices without WebGL support, a flat front/back mockup is shown instead so nobody hits a dead end.

## 3. Saving the order

New `t_shirt_orders` table storing: order ID, customer name/phone, garment, colour, size, quantity, front/back design JSON, rendered preview image URLs, quoted amount, and status (pending / paid / in_production / ready / collected).

- New private storage bucket `design-uploads` for customer artwork and the flattened front/back preview images
- Anyone can place an order (no login required) — orders are write-only for the public and readable only by you as admin
- You see every order in the admin area with the design previews, so you can print exactly what they designed

## 4. Admin view

New tab in the admin area: **T-Shirt Orders** — list of submitted designs with preview thumbnails, download links for the print-ready artwork, customer contact, amount and a status dropdown.

## 5. Navigation & SEO

- "Design Your Shirt" link in the header and a highlighted card on the Home and Products pages
- Own page title, description and social preview tags for `/designer`

## Technical notes

- 3D via `three` + `@react-three/fiber` + `@react-three/drei`, lazy-loaded behind `<ClientOnly>` so SSR and the build stay clean (the shirt model and OrbitControls only load in the browser).
- Design state (layers, transforms, fonts, colours) kept in a typed reducer; the same state renders both the 2D texture canvas and the export PNG via `toBlob`.
- Quote reuses `buildQuote` in `src/lib/quote.ts` and the `use-pricing` hooks — no new price logic, no hardcoded prices.
- Order submit goes through a `createServerFn` that validates input with Zod, uploads artwork to storage, writes the row, and returns the order ID; `/payment` accepts `?order=` and `?amount=` search params to prefill.
- Migration creates `t_shirt_orders` with GRANTs (`INSERT` for anon+authenticated, full access for admins via `has_role`), RLS enabled, and an `updated_at` trigger.
