import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

const title = "Terms & Conditions | DIGISERVE SOLUTION";
const description =
  "Terms and conditions for orders, artwork, turnaround times, payment and in-store pickup at DIGISERVE SOLUTION, Ummulong Main Road, Meghalaya.";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms & Conditions"
      description="The terms that apply when you place an order with DIGISERVE SOLUTION."
      updated="July 2026"
      sections={[
        {
          heading: "1. Orders and quotations",
          body: [
            "All quotations are valid for 7 days unless stated otherwise and are based on the specifications you provide — size, material, GSM, quantity, colour and finishing.",
            "An order is confirmed once specifications are agreed and any required advance payment is received. Changes after confirmation may affect price and delivery time.",
          ],
        },
        {
          heading: "2. Artwork and files",
          body: [
            "You are responsible for the accuracy of the artwork, text, spelling and images you supply. We recommend a minimum of 300 DPI for print files.",
            "You confirm that you own or are licensed to use all content submitted for printing, including logos, photographs and copyrighted designs. We may decline any job that appears unlawful, offensive or infringing.",
            "We may reprint at your cost if an error originates from the files you supplied and was approved by you.",
          ],
        },
        {
          heading: "3. Turnaround time",
          body: [
            "Estimated completion times are given in good faith and may vary with workload, machine availability and material supply. Urgent jobs may attract a rush charge.",
          ],
        },
        {
          heading: "4. Payment",
          body: [
            "We accept cash at the counter and UPI payments via Google Pay, PhonePe, Paytm, BHIM or any UPI application. Bulk and custom jobs may require an advance.",
            "Prices listed on this website are indicative and exclude GST unless stated. A GST invoice can be issued on request.",
          ],
        },
        {
          heading: "5. Pickup only",
          body: [
            "DIGISERVE SOLUTION operates on a pickup-only basis. We do not offer home delivery or courier dispatch. Completed orders must be collected from our shop during business hours.",
            "Orders not collected within 30 days of completion may be disposed of, and any payment made may be forfeited.",
          ],
        },
        {
          heading: "6. Colour variation",
          body: [
            "Screen colours differ from printed output. Minor variation in colour, trim and finishing is normal in printing and is not considered a defect.",
          ],
        },
        {
          heading: "7. Liability",
          body: [
            "Our liability for any order is limited to the value of that order. We are not liable for indirect losses such as lost profit or missed deadlines.",
          ],
        },
        {
          heading: "8. Contact",
          body: [
            "Questions about these terms can be directed to DIGISERVE SOLUTION, Ummulong Main Road, Meghalaya, India — phone 9366613857.",
          ],
        },
      ]}
    />
  );
}
