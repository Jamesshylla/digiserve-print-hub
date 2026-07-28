import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

const title = "Privacy Policy | DIGISERVE SOLUTION";
const description =
  "How DIGISERVE SOLUTION collects, uses, stores and protects your personal information and uploaded files for printing and online service assistance.";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      description="What we collect, why we collect it and how long we keep it."
      updated="July 2026"
      sections={[
        {
          heading: "Information we collect",
          body: [
            "Contact details you give us: name, phone number, email address and, where relevant, your order or appointment history.",
            "Files and documents you submit for printing, scanning or online application assistance.",
            "Basic technical data from this website such as pages visited, used only to improve the site.",
          ],
        },
        {
          heading: "How we use your information",
          body: [
            "To prepare quotations, produce your order, notify you when it is ready for pickup and issue invoices.",
            "To assist with government and online applications where you have explicitly asked us to do so.",
            "To respond to enquiries you send by phone, WhatsApp, email or the contact form on this site.",
          ],
        },
        {
          heading: "Sensitive documents",
          body: [
            "Identity documents such as PAN, Aadhaar and exam forms are handled only for the purpose you provide them and are never shared with third parties for marketing.",
            "Files submitted for printing are deleted from our systems after a reasonable retention period unless you ask us to keep them for reorders.",
          ],
        },
        {
          heading: "Sharing",
          body: [
            "We do not sell your personal information. Data is shared only where required to complete your request — for example submitting a government application on your instruction — or where required by law.",
          ],
        },
        {
          heading: "Security",
          body: [
            "Access to customer files is restricted to authorised staff. Physical documents left with us are stored securely at the counter and returned or destroyed after your job is complete.",
          ],
        },
        {
          heading: "Your rights",
          body: [
            "You may ask us what information we hold about you, request corrections, or ask us to delete your files. Contact us at 9366613857 or visit the shop during business hours.",
          ],
        },
      ]}
    />
  );
}
