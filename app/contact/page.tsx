import type { Metadata } from "next";
import PageHeader from "@/app/components/PageHeader";
import Reveal from "@/app/components/Reveal";
import {
  FacebookIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  TikTokIcon,
  WhatsAppIcon,
} from "@/app/components/icons";
import { Container } from "@/app/components/ui";
import { getHeroImage } from "@/lib/photos";
import { mailLink, site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez Gk-king-service à Yaoundé (Château, Ngoa-Ekellé) par WhatsApp ou e-mail pour un devis gratuit en photographie, impression numérique et infographie.",
};

export default async function Page() {
  const heroImage = await getHeroImage();

  return (
    <>
      {/* En-tête photo commun */}
      <PageHeader
        image={heroImage}
        eyebrow="Contact"
        title="Parlons de votre projet"
        intro="Une question, une idée, un devis ? Écrivez-moi sur WhatsApp ou par e-mail : je vous réponds rapidement."
      />

      {/* Moyens de contact */}
      <section className="py-20 md:py-28">
        <Container>
          <div className="grid gap-6 md:grid-cols-2">
            {/* WhatsApp (mis en avant) */}
            <Reveal className="md:col-span-2">
              <a
                href={whatsappLink(
                  "Bonjour Gk-king-service, je vous contacte depuis votre site.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-start justify-between gap-6 rounded-3xl bg-[#25D366] p-8 text-white transition-transform hover:-translate-y-1 sm:flex-row sm:items-center"
              >
                <div className="flex items-center gap-5">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                    <WhatsAppIcon className="h-7 w-7" />
                  </span>
                  <div>
                    <h2 className="font-display text-2xl font-semibold">
                      WhatsApp
                    </h2>
                    <p className="text-white/85">
                      Le moyen le plus rapide — {site.contact.whatsappDisplay}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#128C4A]">
                  Démarrer la discussion
                </span>
              </a>
            </Reveal>

            {/* E-mail */}
            <Reveal>
              <ContactCard
                icon={<MailIcon className="h-6 w-6" />}
                title="E-mail"
                value={site.contact.email}
                href={mailLink("Demande d'information — Gk-king-service")}
                cta="Envoyer un e-mail"
              />
            </Reveal>

            {/* Téléphone */}
            <Reveal delay={90}>
              <ContactCard
                icon={<PhoneIcon className="h-6 w-6" />}
                title="Téléphone"
                value={site.contact.phoneDisplay}
                href={whatsappLink()}
                external
                cta="Appeler / WhatsApp"
              />
            </Reveal>
          </div>

          {/* Localisation + réseaux */}
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-3xl border border-black/10 bg-neutral-50 p-8">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <MapPinIcon className="h-6 w-6" />
                </span>
                <h2 className="font-display mt-5 text-2xl font-semibold text-ink">
                  Localisation
                </h2>
                <p className="mt-3 text-black/60">
                  {site.location.area}
                  <br />
                  {site.location.city}
                </p>
                <p className="mt-4 inline-flex rounded-full bg-brand/10 px-4 py-2 text-sm font-medium text-brand">
                  {site.location.coverage}
                </p>
              </div>
            </Reveal>

            <Reveal delay={90}>
              <div className="h-full rounded-3xl border border-black/10 bg-neutral-50 p-8">
                <h2 className="font-display text-2xl font-semibold text-ink">
                  Suivez-moi
                </h2>
                <p className="mt-3 text-black/60">
                  Retrouvez mes réalisations et actualités sur les réseaux
                  sociaux.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <SocialButton
                    href={site.socials.whatsapp}
                    label="WhatsApp"
                    icon={<WhatsAppIcon className="h-5 w-5" />}
                  />
                  <SocialButton
                    href={site.socials.facebook}
                    label="Facebook"
                    icon={<FacebookIcon className="h-5 w-5" />}
                  />
                  <SocialButton
                    href={site.socials.tiktok}
                    label="TikTok"
                    icon={<TikTokIcon className="h-5 w-5" />}
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}

function ContactCard({
  icon,
  title,
  value,
  href,
  cta,
  external,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  href: string;
  cta: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      className="group flex h-full flex-col rounded-3xl border border-black/10 bg-white p-8 transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-brand/5"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
        {icon}
      </span>
      <h2 className="font-display mt-5 text-2xl font-semibold text-ink">
        {title}
      </h2>
      <p className="mt-2 break-all text-black/60">{value}</p>
      <span className="mt-5 text-sm font-semibold text-brand">{cta} →</span>
    </a>
  );
}

function SocialButton({
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
      className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-medium text-ink transition-all hover:border-brand hover:bg-brand hover:text-white"
    >
      {icon}
      {label}
    </a>
  );
}
