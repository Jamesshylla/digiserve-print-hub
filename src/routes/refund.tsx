import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

const title = "Refund Policy | DIGISERVE SOLUTION";
const description =
  "Refund, reprint and cancellation policy for custom printing orders and service fees at DIGISERVE SOLUTION, Ummulong Main Road, Meghalaya.";

export const Route = createFileRoute("/refund")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Refund,
});

function Refund() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Refund Policy"
      description="Because printing is made to order, this policy explains exactly when a refund or reprint applies."
      updated="July 2026"
      sections={[
        {
          heading: "Custom printed items",
          body: [
            "Printed products are produced specifically for you and cannot be resold. They are therefore not eligible for a change-of-mind refund once production has started.",
          ],
        },
        {
          heading: "When we reprint free of charge",
          body: [
            "If the fault is ours — wrong size, wrong quantity, misaligned trim, printing defects, poor colour caused by our process or damage before pickup — we will reprint the affected items at no cost.",
            "Report the issue within 48 hours of pickup and bring the item back to the shop so we can inspect it.",
          ],
        },
        {
          heading: "When a refund is not available",
          body: [
            "Errors in the artwork, text or spelling you supplied and approved.",
            "Low resolution or incorrectly sized files supplied by you after we advised against printing them.",
            "Minor colour variation between screen and print, which is normal in commercial printing.",
            "Orders not collected within 30 days of completion.",
          ],
        },
        {
          heading: "Cancellations",
          body: [
            "Orders cancelled before production begins are refunded in full. Once material has been cut, printed or pressed, the cost of consumed material and machine time is deducted from any refund.",
          ],
        },
        {
          heading: "Service and application fees",
          body: [
            "Fees for government form filling, PAN and Aadhaar assistance, exam forms and admissions cover our time and submission effort. They are non-refundable once the application has been submitted, regardless of the outcome decided by the concerned authority.",
          ],
        },
        {
          heading: "How refunds are issued",
          body: [
            "Approved refunds are returned by the original method — cash at the counter, or to the same UPI ID used for payment — normally within 5 to 7 working days.",
            "For any refund query, call 9366613857 or visit the shop with your order reference.",
          ],
        },
      ]}
    />
  );
}
