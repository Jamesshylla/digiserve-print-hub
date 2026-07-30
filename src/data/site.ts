export const business = {
  name: "DIGISERVE SOLUTION",
  tagline: "Digital Print Shop & Online Service Center",
  phone: "9366613857",
  phoneIntl: "+919366613857",
  whatsapp: "919366613857",
  email: "digiservesolution@gmail.com",
  address: "Ummulong Main Road, Meghalaya, India",
  hours: "Monday – Saturday · 9:00 AM – 6:00 PM",
  mapsQuery: "Ummulong+Main+Road+Meghalaya+India",
  pickupOnly: true,
};

/** UPI / Google Pay collection details shown on the payment page. */
export const upi = {
  id: "jamesshylla01-1@oksbi",
  payeeName: "JAMES SHYLLA",
  qrImage: upiQr,
};


export const mapsEmbed = `https://www.google.com/maps?q=${business.mapsQuery}&output=embed`;
export const mapsDirections = `https://www.google.com/maps/dir/?api=1&destination=${business.mapsQuery}`;
export const whatsappLink = `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(
  "Hello DIGISERVE SOLUTION, I'd like to enquire about your printing services.",
)}`;

export type ServiceGroup = {
  slug: string;
  title: string;
  blurb: string;
  icon: string;
  items: string[];
};

export const serviceGroups: ServiceGroup[] = [
  {
    slug: "printing",
    title: "Printing & Copying",
    blurb: "Everyday document work with sharp output and same-day turnaround.",
    icon: "Printer",
    items: [
      "Black & White Printing",
      "Colour Printing",
      "Photocopy / Xerox",
      "Resume Printing",
      "Certificates",
      "Lamination",
      "Spiral Binding",
      "Document Scanning",
    ],
  },
  {
    slug: "photo",
    title: "Photo & Frames",
    blurb: "Studio-quality photo output, frames and canvas for every occasion.",
    icon: "Camera",
    items: [
      "Passport Size Photo",
      "Photo Printing",
      "Photo Frame",
      "Canvas Printing",
      "ID Cards",
      "Calendars",
    ],
  },
  {
    slug: "apparel",
    title: "Apparel & Gifts",
    blurb: "Custom garment and gift printing for teams, events and celebrations.",
    icon: "Shirt",
    items: [
      "T-Shirt Printing",
      "Jersey Printing",
      "Hoodie Printing",
      "Sweatshirt Printing",
      "Mug Printing",
      "Magic Mug",
      "Custom Gifts",
    ],
  },
  {
    slug: "large-format",
    title: "Large Format & Branding",
    blurb: "Outdoor and indoor branding that stays crisp at any size.",
    icon: "Megaphone",
    items: [
      "Flex Banner",
      "Vinyl Printing",
      "Sticker Printing",
      "Labels",
      "Posters",
      "Brochures & Flyers",
    ],
  },
  {
    slug: "cards",
    title: "Cards & Stationery",
    blurb: "Premium card stock, finishes and typesetting done in-house.",
    icon: "CreditCard",
    items: [
      "Business Cards",
      "Visiting Cards",
      "Invitation Cards",
      "Wedding Cards",
      "Birthday Cards",
    ],
  },
  {
    slug: "stamps",
    title: "Stamps & Seals",
    blurb: "Precision-cut stamps ready for offices, schools and businesses.",
    icon: "Stamp",
    items: ["Rubber Stamp", "Self Ink Stamp", "Pre Ink Stamp", "Company Seal"],
  },
  {
    slug: "online-services",
    title: "Online & Government Services",
    blurb: "Form filling and application assistance with careful document checks.",
    icon: "Globe",
    items: [
      "Online Applications",
      "Government Forms",
      "PAN Card Assistance",
      "Aadhaar Update Assistance",
      "Exam Form Filling",
      "Job Applications",
      "College Admission",
      "Internet Services",
    ],
  },
];

export const faqs = [
  {
    q: "Do you deliver to my address?",
    a: "No. DIGISERVE SOLUTION is pickup-only. Every order is collected from our shop on Ummulong Main Road during business hours, so you can check the print quality before you leave.",
  },
  {
    q: "How do I send my files?",
    a: "Bring them on a pen drive, share them over WhatsApp, or email them. Our upload portal accepts JPG, PNG, WEBP, PDF, DOC, DOCX, PSD, AI, SVG, ZIP and RAR files up to 500MB.",
  },
  {
    q: "How long does an order take?",
    a: "Documents, photocopies and passport photos are usually ready within the hour. Apparel, banners, stamps and wedding cards typically take 1–3 working days depending on volume.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Cash at the counter and UPI — Google Pay, PhonePe, Paytm, BHIM or any UPI app. Scan the QR code on our payment page and share the reference number with your order.",
  },
  {
    q: "Can you help with government forms?",
    a: "Yes. We assist with PAN card applications, Aadhaar updates, exam forms, job applications and college admissions. Bring the required documents and we'll verify them before submission.",
  },
  {
    q: "Do you offer bulk discounts?",
    a: "Yes. Slab pricing applies automatically on high-volume printing, jerseys, invitation cards and banners. Contact us with your quantity for an exact quote.",
  },
  {
    q: "Can I book a time slot?",
    a: "Yes. Appointments are available for passport photos, document services, stamp orders, consultations and large printing jobs. Call or WhatsApp us to reserve a slot.",
  },
  {
    q: "Is GST included in your prices?",
    a: "Listed prices are indicative and exclude GST. A GST-ready invoice can be issued on request at the time of billing.",
  },
];

export const reviews = [
  {
    name: "Banri Kharkongor",
    role: "College Student",
    rating: 5,
    text: "Got my project printed and spiral bound in under 30 minutes. Clean output and very fair pricing.",
  },
  {
    name: "Deiwan Nongrum",
    role: "Shop Owner",
    rating: 5,
    text: "Ordered 200 visiting cards and a company seal. The finish was better than what I got in Shillong.",
  },
  {
    name: "Ibansuk Lyngdoh",
    role: "Football Club Manager",
    rating: 5,
    text: "18 team jerseys printed with names and numbers. Colours held up perfectly after washing.",
  },
  {
    name: "Rita Marbaniang",
    role: "Teacher",
    rating: 4,
    text: "They helped me fill an online exam form and printed the acknowledgement right away. Very patient staff.",
  },
];

export const stats = [
  { value: "12K+", label: "Print jobs delivered" },
  { value: "40+", label: "Services under one roof" },
  { value: "60 min", label: "Typical document turnaround" },
  { value: "4.9/5", label: "Average customer rating" },
];

export const orderSteps = [
  {
    title: "Share your files",
    text: "Send artwork over WhatsApp, email or bring it in on a drive. We check resolution and bleed before printing.",
  },
  {
    title: "Confirm the quote",
    text: "We calculate size, GSM, quantity, finishing and urgency, then confirm the final price with you.",
  },
  {
    title: "Pay by UPI or cash",
    text: "Scan our UPI QR code from any payment app, or settle at the counter when you collect.",
  },
  {
    title: "Pick up in store",
    text: "You get a message when your order is ready. Collect it from Ummulong Main Road — no delivery, no courier delays.",
  },
];
