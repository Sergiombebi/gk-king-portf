import type { GalleryFolderKey } from "@/lib/gallery-config";
import { getGallery, getHeroImage } from "@/lib/photos";
import type { Service } from "@/lib/services";
import { site, whatsappLink } from "@/lib/site";
import MasonryGallery from "./MasonryGallery";
import PageHeader from "./PageHeader";
import Reveal from "./Reveal";
import { CheckIcon, WhatsAppIcon } from "./icons";
import { Button, Container, Eyebrow, SectionHeading } from "./ui";

/** Gabarit commun aux trois pages de prestation. */
export default async function ServicePage({ service }: { service: Service }) {
  const [heroImage, gallery] = await Promise.all([
    getHeroImage(),
    getGallery(service.slug as GalleryFolderKey),
  ]);

  return (
    <>
      {/* En-tête photo commun */}
      <PageHeader
        image={heroImage}
        eyebrow="Prestation"
        title={service.title}
        intro={service.intro}
      >
        <div className="flex flex-wrap gap-3">
          <Button
            href={whatsappLink(
              `Bonjour Gk-king-service, je suis intéressé(e) par votre prestation « ${service.title} ».`,
            )}
            external
            icon={<WhatsAppIcon className="h-4 w-4" />}
          >
            Demander un devis
          </Button>
          <Button href="/contact" variant="outline">
            Nous contacter
          </Button>
        </div>
      </PageHeader>

      {/* Prestations détaillées */}
      <section className="py-20 md:py-28">
        <Container>
          <SectionHeading
            eyebrow="Ce que je propose"
            title="Des prestations sur mesure"
            intro="Chaque projet est unique. Voici les services proposés dans cette catégorie — n'hésitez pas à me solliciter pour toute demande spécifique."
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {service.features.map((f, i) => (
              <Reveal
                key={f.title}
                delay={(i % 2) * 90}
                className="group rounded-2xl border border-black/10 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-brand/5"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                  <CheckIcon className="h-5 w-5" />
                </span>
                <h3 className="font-display mt-5 text-xl font-semibold text-ink">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-black/60">
                  {f.description}
                </p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Galerie dédiée (masquée si aucune image n'est prévue) */}
      {gallery.length > 0 && (
        <section className="bg-neutral-50 py-20 md:py-28">
          <Container>
            <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <Eyebrow>Galerie</Eyebrow>
                <h2 className="font-display mt-4 text-3xl font-semibold text-ink sm:text-4xl">
                  Quelques réalisations
                </h2>
              </div>
              <p className="max-w-sm text-sm text-black/50">
                Les emplacements ci-dessous sont réservés à vos photos. Elles
                seront intégrées prochainement.
              </p>
            </div>
            <MasonryGallery items={gallery} initialCount={4} />
          </Container>
        </section>
      )}

      {/* Appel à l'action */}
      <CtaBand service={service} />
    </>
  );
}

function CtaBand({ service }: { service: Service }) {
  return (
    <section className="bg-brand py-16 text-white md:py-20">
      <Container>
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className="font-display max-w-2xl text-3xl font-semibold sm:text-4xl">
            Un projet de {service.title.toLowerCase()} ? Parlons-en.
          </h2>
          <p className="max-w-xl text-white/85">
            Réponse rapide sur WhatsApp. Devis gratuit et sans engagement,
            partout où le besoin se trouve.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={whatsappLink(
                `Bonjour Gk-king-service, je souhaite un devis pour « ${service.title} ».`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
            >
              <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
              {site.contact.whatsappDisplay}
            </a>
            <Button
              href="/contact"
              variant="outline"
              className="border-white/40 hover:!bg-white hover:!text-ink"
            >
              Voir tous les contacts
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
