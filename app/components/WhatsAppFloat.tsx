import { whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "./icons";

/** Bouton WhatsApp flottant, visible en permanence en bas à droite. */
export default function WhatsAppFloat() {
  return (
    <a
      href={whatsappLink(
        "Bonjour Gk-king-service, je souhaite avoir des informations sur vos prestations.",
      )}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Discuter sur WhatsApp"
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-full bg-[#25D366] p-4 text-white shadow-lg shadow-black/25 transition-transform hover:scale-105"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30" />
      <WhatsAppIcon className="relative h-6 w-6" />
      <span className="relative hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-300 group-hover:max-w-[10rem] sm:block sm:group-hover:pr-1">
        Écrivez-nous
      </span>
    </a>
  );
}
