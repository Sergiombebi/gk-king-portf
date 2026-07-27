import Image from "next/image";
import Link from "next/link";
import { mailLink, navLinks, site, whatsappLink } from "@/lib/site";
import {
  FacebookIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  TikTokIcon,
  WhatsAppIcon,
} from "./icons";
import { Container } from "./ui";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-white">
      <Container className="py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Marque */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2">
              <Image
                src="/icone.png"
                alt={site.name}
                width={36}
                height={36}
                className="h-9 w-9 rounded-lg object-contain"
              />
              <span className="font-display text-lg font-semibold">
                Gk-king<span className="text-brand">-service</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              {site.tagline}. Des images et des supports qui donnent vie à vos
              moments et à votre marque.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <SocialLink
                href={site.socials.whatsapp}
                label="WhatsApp"
                icon={<WhatsAppIcon className="h-4 w-4" />}
              />
              <SocialLink
                href={site.socials.facebook}
                label="Facebook"
                icon={<FacebookIcon className="h-4 w-4" />}
              />
              <SocialLink
                href={site.socials.tiktok}
                label="TikTok"
                icon={<TikTokIcon className="h-4 w-4" />}
              />
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-light">
              Navigation
            </h3>
            <ul className="mt-5 space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-brand"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Prestations */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-light">
              Prestations
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-white/70">
              <li>Photographie professionnelle</li>
              <li>Impression numérique</li>
              <li>Agrandissement de photo</li>
              <li>Personnalisation textile</li>
              <li>Infographie & design</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-light">
              Contact
            </h3>
            <ul className="mt-5 space-y-4 text-sm">
              <li className="flex items-start gap-3 text-white/70">
                <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <span>
                  {site.location.area}
                  <br />
                  {site.location.city}
                </span>
              </li>
              <li>
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-white/70 transition-colors hover:text-brand"
                >
                  <PhoneIcon className="h-4 w-4 shrink-0 text-brand" />
                  {site.contact.whatsappDisplay}
                </a>
              </li>
              <li>
                <a
                  href={mailLink("Demande d'information")}
                  className="flex items-center gap-3 break-all text-white/70 transition-colors hover:text-brand"
                >
                  <MailIcon className="h-4 w-4 shrink-0 text-brand" />
                  {site.contact.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-center text-xs text-white/50 sm:flex-row sm:text-left">
          <p>
            © {year} {site.name}. Tous droits réservés.
          </p>
          <p>
            Yaoundé · Cameroun — {site.location.coverage}
          </p>
        </div>
      </Container>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition-all hover:border-brand hover:bg-brand hover:text-white"
    >
      {icon}
    </a>
  );
}
