import type { Metadata } from "next";
import FramedPhoto from "@/app/components/FramedPhoto";
import PageHeader from "@/app/components/PageHeader";
import Reveal from "@/app/components/Reveal";
import { WhatsAppIcon } from "@/app/components/icons";
import { Button, Container, SectionHeading } from "@/app/components/ui";
import { getHeroImage } from "@/lib/photos";
import { site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Découvrez Gk-king-service, photographe professionnel à Yaoundé (Château, Ngoa-Ekellé) : parcours, valeurs et savoir-faire en photographie, impression et infographie.",
};

const values = [
  {
    title: "Qualité",
    text: "Des images nettes, des impressions fidèles et des créations soignées, sans compromis.",
  },
  {
    title: "Proximité",
    text: "À votre écoute, je m'adapte à vos envies et reste disponible à chaque étape.",
  },
  {
    title: "Ponctualité",
    text: "Des délais annoncés clairement et respectés, pour votre tranquillité.",
  },
  {
    title: "Créativité",
    text: "Un regard artistique au service de vos moments et de votre marque.",
  },
];

export default async function Page() {
  const heroImage = await getHeroImage();

  return (
    <>
      {/* En-tête photo commun */}
      <PageHeader
        image={heroImage}
        eyebrow="À propos de moi"
        title={
          <>
            L'œil derrière{" "}
            <span className="text-gradient-brand">Gk-king-service</span>
          </>
        }
        intro="Photographe professionnel passionné, installé à Yaoundé, je transforme vos moments et vos idées en images et supports qui marquent les esprits."
      />

      {/* Histoire */}
      <section className="py-20 md:py-28">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <FramedPhoto
                src="/galerie/a-propos/portrait.jpg"
                alt="Portrait du photographe Gk-king-service"
                placeholder="Votre photo de profil / atelier"
                className="aspect-[4/5]"
              />
            </Reveal>
            <Reveal delay={120}>
              <div>
                <SectionHeading
                  eyebrow="Mon parcours"
                  title="Une passion devenue métier"
                />
                <div className="mt-6 space-y-4 text-base leading-relaxed text-black/60">
                  <p>
                    Depuis mes débuts, la photographie est bien plus qu'un
                    métier : c'est une manière de raconter des histoires et de
                    figer l'émotion. Au fil des années, j'ai élargi mon
                    savoir-faire à l'impression numérique et à l'infographie
                    pour offrir un service complet.
                  </p>
                  <p>
                    Aujourd'hui, depuis mon atelier au quartier Château
                    (Ngoa-Ekellé) à Yaoundé, j'accompagne aussi bien les
                    particuliers pour leurs événements que les entreprises et
                    créateurs pour leur communication visuelle.
                  </p>
                  <p>
                    Mon objectif reste le même : vous offrir un résultat à la
                    hauteur de vos attentes, avec écoute, exigence et créativité.
                  </p>
                </div>
                <div className="mt-8">
                  <Button
                    href={whatsappLink(
                      "Bonjour Gk-king-service, j'aimerais en savoir plus sur vos services.",
                    )}
                    external
                    icon={<WhatsAppIcon className="h-4 w-4" />}
                  >
                    Faisons connaissance
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Valeurs */}
      <section className="bg-neutral-50 py-20 md:py-28">
        <Container>
          <SectionHeading
            center
            eyebrow="Mes valeurs"
            title="Ce qui guide mon travail"
          />
          <div className="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-2">
            {values.map((v, i) => (
              <Reveal
                key={v.title}
                delay={(i % 2) * 90}
                className="rounded-2xl border border-black/10 bg-white p-7"
              >
                <h3 className="font-display text-xl font-semibold text-ink">
                  <span className="text-brand">—</span> {v.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-black/60">
                  {v.text}
                </p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="bg-brand py-16 text-white md:py-20">
        <Container>
          <div className="flex flex-col items-center gap-6 text-center">
            <h2 className="font-display max-w-2xl text-3xl font-semibold sm:text-4xl">
              Travaillons ensemble sur votre prochain projet
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href={whatsappLink(
                  "Bonjour Gk-king-service, je souhaite discuter d'un projet.",
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
                className="border-white/50 hover:!bg-white hover:!text-ink"
              >
                Me contacter
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
