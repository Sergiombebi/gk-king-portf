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
    key: "accueil",
    label: "Portfolio (accueil)",
    hint: "Aperçu affiché dans la section « Un aperçu de mon univers » de la page d'accueil.",
  },
  {
    key: "photographie",
    label: "Photographie",
    hint: "Galerie de la page Photographie.",
  },
  {
    key: "impression-numerique",
    label: "Impression numérique",
    hint: "Galerie de la page Impression numérique.",
  },
  {
    key: "infographie",
    label: "Infographie",
    hint: "Galerie de la page Infographie. Vide par défaut : la section n'apparaît sur le site que s'il y a au moins une photo.",
  },
] as const;

export type GalleryFolderKey = (typeof GALLERY_FOLDERS)[number]["key"];

export const isGalleryFolder = (value: string): value is GalleryFolderKey =>
  GALLERY_FOLDERS.some((f) => f.key === value);

/**
 * Grande photo de fond affichée en haut de toutes les pages. Elle est livrée
 * avec le site et n'est pas gérable depuis l'admin : pour la changer, remplacez
 * le fichier dans `public/galerie/`.
 */
export const HERO_IMAGE = "/galerie/hero.jpg";

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
  if (folder === "accueil") return FALLBACK_ACCUEIL;
  return services.find((s) => s.slug === folder)?.gallery ?? [];
}
