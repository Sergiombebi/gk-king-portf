// =============================================================================
//  GALERIES GÉRABLES DEPUIS L'ESPACE ADMIN
//  Chaque « dossier » ci-dessous correspond à un onglet dans /admin.
//  Les photos sont stockées sur Vercel Blob sous `galerie/<clé>/…`.
//  Tant qu'aucune photo n'a été envoyée pour un dossier, le site retombe
//  automatiquement sur les images statiques de `public/galerie/`.
// =============================================================================

import type { GalleryItem } from "@/app/components/Gallery";
import { services } from "./services";

export const GALLERY_FOLDERS = [
  {
    key: "hero",
    label: "Photo d'en-tête",
    hint: "Grande photo de fond affichée en haut de toutes les pages. Une seule photo est utilisée (la plus récente). Format paysage, ~1920 px de large.",
    single: true,
  },
  {
    key: "accueil",
    label: "Portfolio (accueil)",
    hint: "Aperçu affiché dans la section « Un aperçu de mon univers » de la page d'accueil.",
    single: false,
  },
  {
    key: "photographie",
    label: "Photographie",
    hint: "Galerie de la page Photographie.",
    single: false,
  },
  {
    key: "impression-numerique",
    label: "Impression numérique",
    hint: "Galerie de la page Impression numérique.",
    single: false,
  },
  {
    key: "infographie",
    label: "Infographie",
    hint: "Galerie de la page Infographie. Vide par défaut : la section n'apparaît sur le site que s'il y a au moins une photo.",
    single: false,
  },
] as const;

export type GalleryFolderKey = (typeof GALLERY_FOLDERS)[number]["key"];

export const isGalleryFolder = (value: string): value is GalleryFolderKey =>
  GALLERY_FOLDERS.some((f) => f.key === value);

/** Photo d'en-tête livrée avec le site, utilisée tant qu'aucune n'est envoyée. */
export const FALLBACK_HERO = "/galerie/hero.jpg";

/** Portfolio de la page d'accueil livré avec le site. */
const FALLBACK_ACCUEIL: GalleryItem[] = [
  { src: "/galerie/accueil/mariage.jpg", alt: "Mariage" },
  { src: "/galerie/accueil/portrait.jpg", alt: "Portrait" },
  { src: "/galerie/accueil/evenement.jpg", alt: "Événement" },
  { src: "/galerie/accueil/textile.jpg", alt: "Personnalisation textile" },
  { src: "/galerie/accueil/design.jpg", alt: "Design & infographie" },
  { src: "/galerie/accueil/spot-publicitaire.jpg", alt: "Spot publicitaire" },
  { src: "/galerie/accueil/agrandissement.jpg", alt: "Agrandissement" },
];

/** Images statiques d'un dossier, utilisées tant que l'admin n'a rien envoyé. */
export function fallbackGallery(folder: GalleryFolderKey): GalleryItem[] {
  if (folder === "hero") return [{ src: FALLBACK_HERO, alt: "En-tête" }];
  if (folder === "accueil") return FALLBACK_ACCUEIL;
  return services.find((s) => s.slug === folder)?.gallery ?? [];
}
