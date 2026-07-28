import type { ReactNode } from "react";
import Reveal from "./Reveal";
import { Container, Eyebrow } from "./ui";

/**
 * En-tête commun à TOUTES les pages (accueil compris) : grand format plein
 * écran, photo de fond bien visible. Un dégradé sombre léger part de la gauche
 * (côté texte) pour garantir la lisibilité quelle que soit la photo — y compris
 * les fonds clairs ou orangés — tout en laissant la photo apparente à droite.
 * Le fond photo est OPTIONNEL : tant que le fichier n'existe pas, l'en-tête
 * reste sur un beau fond sombre.
 */
export default function PageHeader({
  image,
  eyebrow,
  title,
  intro,
  children,
}: {
  /** Photo de fond fixe, ex: "/galerie/hero.jpg" */
  image?: string;
  eyebrow: string;
  title?: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative flex min-h-[115vh] items-center overflow-hidden bg-ink pt-24 text-white">
      {/* Fond : photo fixe */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url('${image}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Voile dégradé côté texte : lisibilité sur les photos claires */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/60 to-transparent"
      />


      <Container className="relative py-24 md:py-28">
        <Reveal className="max-w-3xl [text-shadow:_0_2px_24px_rgba(0,0,0,0.85)]">
          <Eyebrow dark>{eyebrow}</Eyebrow>
          {title && (
            <h1 className="font-display mt-5 text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
              {title}
            </h1>
          )}
          {intro && (
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
              {intro}
            </p>
          )}
          {children && <div className="mt-8">{children}</div>}
        </Reveal>
      </Container>
    </section>
  );
}
