import Link from "next/link";
import FramedPhoto from "./components/FramedPhoto";
import MasonryGallery from "./components/MasonryGallery";
import PageHeader from "./components/PageHeader";
import Reveal from "./components/Reveal";
import ServiceIcon from "./components/ServiceIcon";
import { ArrowIcon, MapPinIcon, WhatsAppIcon } from "./components/icons";
import { Button, Container, Eyebrow, SectionHeading } from "./components/ui";
import { getGallery, getHeroImage } from "@/lib/photos";
import { services } from "@/lib/services";
import { site, whatsappLink } from "@/lib/site";

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <ServicesOverview />
      <AboutTeaser />
      <GalleryTeaser />
      <Process />
      <Coverage />
      <ContactCta />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  HERO                                                                        */
/* -------------------------------------------------------------------------- */
async function Hero() {
  const heroImage = await getHeroImage();

  return (
    <PageHeader
      image={heroImage}
      eyebrow={site.name}
      title="Photographe professionnel"
      intro="Basé à Yaoundé, disponible partout."
    >
      <div className="flex flex-wrap gap-3">
        <Button
          href={whatsappLink(
            "Bonjour Gk-king-service, je souhaite discuter d'un projet.",
          )}
          external
          icon={<WhatsAppIcon className="h-4 w-4" />}
        >
          Discuter de mon projet
        </Button>
        <Button href="/photographie" variant="outline">
          Voir les prestations
        </Button>
      </div>
    </PageHeader>
  );
}

/* -------------------------------------------------------------------------- */
/*  BANDEAU DÉFILANT                                                            */
/* -------------------------------------------------------------------------- */
function Marquee() {
  const items = [
    "Mariage",
    "Anniversaire",
    "Création de contenu",
    "Spot publicitaire",
    "Agrandissement",
    "Banderoles & flyers",
    "T-shirts personnalisés",
    "Casquettes & polos",
    "Logo & identité",
    "Affiches",
  ];
  const loop = [...items, ...items];
  return (
    <div className="border-y border-black/10 bg-white py-5">
      <div className="relative flex overflow-hidden">
        <div className="flex shrink-0 animate-marquee items-center gap-8 pr-8">
          {loop.map((it, i) => (
            <span
              key={i}
              className="flex items-center gap-8 text-sm font-medium uppercase tracking-widest text-black/40"
            >
              {it}
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  APERÇU DES SERVICES                                                         */
/* -------------------------------------------------------------------------- */
function ServicesOverview() {
  return (
    <section className="py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Nos prestations"
          title="Trois expertises, un seul studio"
          intro="De la prise de vue à l'impression finale, en passant par la création graphique, Gk-king-service vous accompagne de bout en bout."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {services.map((service, i) => (
            <Reveal key={service.slug} delay={i * 100}>
              <Link
                href={service.href}
                className="group flex h-full flex-col rounded-3xl border border-black/10 bg-white p-8 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand/40 hover:shadow-2xl hover:shadow-brand/10"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                  <ServiceIcon icon={service.icon} className="h-7 w-7" />
                </span>
                <h3 className="font-display mt-6 text-2xl font-semibold text-ink">
                  {service.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-black/60">
                  {service.short}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand">
                  Découvrir
                  <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  APERÇU À PROPOS                                                             */
/* -------------------------------------------------------------------------- */
function AboutTeaser() {
  return (
    <section className="bg-neutral-50 py-20 md:py-28">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <FramedPhoto
              src="/galerie/a-propos/portrait.jpg"
              alt="Portrait du photographe Gk-king-service"
              placeholder="Votre portrait / photo d'atelier"
              className="aspect-[4/5]"
            />
          </Reveal>

          <Reveal delay={120}>
            <div>
              <Eyebrow>À propos</Eyebrow>
              <h2 className="font-display mt-4 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
                La passion de l'image, le sens du détail
              </h2>
              <p className="mt-5 text-base leading-relaxed text-black/60">
                Basé à Yaoundé, au quartier Château (Ngoa-Ekellé), j'accompagne
                particuliers, entreprises et créateurs dans la réalisation de
                leurs projets visuels. Photographie, impression et design : je
                mets mon savoir-faire au service de vos idées, avec exigence et
                proximité.
              </p>
              <ul className="mt-7 space-y-3">
                {[
                  "Un interlocuteur unique du cadrage à l'impression",
                  "Des délais tenus et des tarifs transparents",
                  "Déplacement partout où le besoin se trouve",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-black/70"
                  >
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button href="/a-propos" variant="ghost">
                  En savoir plus sur moi
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  APERÇU GALERIE                                                              */
/* -------------------------------------------------------------------------- */
async function GalleryTeaser() {
  const items = await getGallery("accueil");
  return (
    <section className="py-20 md:py-28">
      <Container>
        <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Portfolio"
            title="Un aperçu de mon univers"
          />
          <p className="max-w-sm text-sm text-black/50">
            Les emplacements ci-dessous accueilleront prochainement mes
            réalisations photo.
          </p>
        </div>
        <MasonryGallery items={items} />
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  PROCESSUS                                                                   */
/* -------------------------------------------------------------------------- */
function Process() {
  const steps = [
    {
      n: "01",
      title: "Échange",
      text: "Vous me contactez sur WhatsApp ou par e-mail et me décrivez votre besoin.",
    },
    {
      n: "02",
      title: "Devis",
      text: "Je vous propose une solution adaptée avec un devis clair et gratuit.",
    },
    {
      n: "03",
      title: "Réalisation",
      text: "Prise de vue, impression ou création — je concrétise votre projet.",
    },
    {
      n: "04",
      title: "Livraison",
      text: "Vous recevez vos fichiers ou supports finis dans les délais convenus.",
    },
  ];
  return (
    <section className="bg-ink py-20 text-white md:py-28">
      <Container>
        <SectionHeading
          dark
          eyebrow="Comment ça marche"
          title="Un processus simple et transparent"
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <Reveal key={step.n} delay={i * 90}>
              <div className="relative h-full rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition-colors hover:border-brand/40">
                <span className="font-display text-4xl font-bold text-brand/30">
                  {step.n}
                </span>
                <h3 className="font-display mt-4 text-xl font-semibold">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {step.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  ZONE D'INTERVENTION                                                         */
/* -------------------------------------------------------------------------- */
function Coverage() {
  return (
    <section className="py-20 md:py-28">
      <Container>
        <Reveal>
          <div className="flex flex-col items-center gap-6 rounded-3xl border border-black/10 bg-neutral-50 px-6 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
              <MapPinIcon className="h-7 w-7" />
            </span>
            <h2 className="font-display max-w-2xl text-3xl font-semibold text-ink sm:text-4xl">
              Basé à Yaoundé, disponible partout
            </h2>
            <p className="max-w-xl text-base text-black/60">
              Mon atelier se situe au quartier{" "}
              <strong className="text-ink">Château, Ngoa-Ekellé</strong>, à
              Yaoundé. Mais je me déplace partout où le besoin se trouve pour
              vos événements et projets.
            </p>
            <Button href="/contact">Me localiser & me contacter</Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  CTA CONTACT                                                                 */
/* -------------------------------------------------------------------------- */
function ContactCta() {
  return (
    <section className="relative overflow-hidden bg-brand py-20 text-white md:py-24">
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <Container className="relative">
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className="font-display max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl">
            Prêt à donner vie à votre projet ?
          </h2>
          <p className="max-w-xl text-white/85">
            Contactez-moi dès maintenant sur WhatsApp pour un devis gratuit et
            sans engagement.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={whatsappLink(
                "Bonjour Gk-king-service, je souhaite un devis gratuit.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
            >
              <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
              Écrire sur WhatsApp
            </a>
            <Button
              href="/contact"
              variant="outline"
              className="border-white/50 hover:!bg-white hover:!text-ink"
            >
              Tous les moyens de contact
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
