import apparel from "@/assets/gallery-apparel.jpg";
import cards from "@/assets/gallery-cards.jpg";
import mug from "@/assets/gallery-mug.jpg";
import frame from "@/assets/gallery-frame.jpg";
import stamp from "@/assets/gallery-stamp.jpg";
import banner from "@/assets/gallery-banner.jpg";
import passport from "@/assets/gallery-passport.jpg";

export type GalleryItem = {
  id: string;
  title: string;
  category: string;
  image: string;
  alt: string;
  from: string;
  includes: string[];
};

export const galleryItems: GalleryItem[] = [
  {
    id: "passport",
    title: "Passport Photos & ID Cards",
    category: "Photo",
    image: passport,
    alt: "Sample design mockup of a passport size photo sheet and printed ID card",
    from: "₹80",
    includes: ["35x45mm standard", "8 or 12 copies", "Instant ID card printing"],
  },
  {
    id: "cards",
    title: "Business & Visiting Cards",
    category: "Stationery",
    image: cards,
    alt: "Sample design mockup of premium printed business cards",
    from: "₹300 / 100",
    includes: ["300–350 GSM stock", "Matte, gloss or spot UV", "Free layout assistance"],
  },
  {
    id: "apparel",
    title: "T-Shirts, Jerseys & Hoodies",
    category: "Apparel",
    image: apparel,
    alt: "Sample design mockup of a custom printed t-shirt and hoodie",
    from: "₹350",
    includes: ["Team names & numbers", "DTF and vinyl transfer", "Bulk order discounts"],
  },
  {
    id: "mug",
    title: "Photo Mugs & Magic Mugs",
    category: "Gifts",
    image: mug,
    alt: "Sample design mockup of a custom photo mug and heat sensitive magic mug",
    from: "₹250",
    includes: ["Full wrap sublimation", "Heat reveal magic mugs", "Gift box available"],
  },
  {
    id: "frame",
    title: "Canvas Prints & Photo Frames",
    category: "Photo",
    image: frame,
    alt: "Sample design mockup of a canvas print and framed photograph on a wall",
    from: "₹350",
    includes: ["Gallery wrap canvas", "Wood & synthetic frames", "Custom sizes"],
  },
  {
    id: "banner",
    title: "Flex Banners & Vinyl",
    category: "Large Format",
    image: banner,
    alt: "Sample design mockup of a large flex banner and roll-up standee",
    from: "₹18 / sq. ft.",
    includes: ["Weather resistant flex", "Standee & backdrop", "Eyelets and framing"],
  },
  {
    id: "stamp",
    title: "Rubber Stamps & Company Seals",
    category: "Office",
    image: stamp,
    alt: "Sample design mockup of a rubber stamp, self ink stamp and company seal",
    from: "₹200",
    includes: ["Laser engraved dies", "Self-ink & pre-ink", "Round company seals"],
  },
];

export const galleryCategories = ["All", ...new Set(galleryItems.map((i) => i.category))];
