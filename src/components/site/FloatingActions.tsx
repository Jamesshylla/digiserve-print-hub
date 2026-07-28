import { MessageCircle, Phone } from "lucide-react";
import { business, whatsappLink } from "@/data/site";

export function FloatingActions() {
  return (
    <div className="fixed bottom-5 right-4 z-50 flex flex-col gap-3 md:bottom-8 md:right-8">
      <a
        href={whatsappLink}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with DIGISERVE SOLUTION on WhatsApp"
        className="flex size-12 items-center justify-center rounded-full bg-success text-success-foreground shadow-[var(--shadow-deep)] transition-transform hover:scale-110"
      >
        <MessageCircle className="size-5" />
      </a>
      <a
        href={`tel:${business.phoneIntl}`}
        aria-label={`Call DIGISERVE SOLUTION at ${business.phone}`}
        className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-neon)] transition-transform hover:scale-110"
      >
        <Phone className="size-5" />
      </a>
    </div>
  );
}
