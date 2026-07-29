// =============================================================================
//  RÈGLES D'ENVOI DES PHOTOS — partagées par le navigateur et le serveur.
//  (Aucune dépendance serveur ici : ce fichier est importable côté client.)
// =============================================================================

import type { GalleryFolderKey } from "./gallery-config";

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 Mo par photo

/**
 * Quand la photo transite par le serveur (voie de secours), la plateforme
 * limite la taille des requêtes : on reste sous cette barre.
 */
export const MAX_SERVER_UPLOAD_BYTES = 4 * 1024 * 1024; // 4 Mo

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

/** Séparateur entre le titre lisible et l'horodatage dans le nom de fichier. */
export const NAME_SEPARATOR = "__";

/** "Mariage à Yaoundé" → "mariage-a-yaounde" */
export function slugify(value: string) {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "photo"
  );
}

/** "galerie/accueil/mariage-civil__1730000000000.jpg" → "Mariage civil" */
export function altFromPathname(pathname: string) {
  const file = pathname.split("/").pop() ?? "";
  const slug = file.split(NAME_SEPARATOR)[0].replace(/\.[a-z0-9]+$/i, "");
  const words = slug.replace(/-/g, " ").trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : "Photo";
}

/** Construit le chemin de destination d'une photo dans le stockage. */
export function buildPhotoPathname(
  folder: GalleryFolderKey,
  fileName: string,
  title?: string,
) {
  const extension = fileName.split(".").pop()?.toLowerCase() || "jpg";
  const base = slugify(title?.trim() || fileName.replace(/\.[^.]+$/, ""));
  return `galerie/${folder}/${base}${NAME_SEPARATOR}${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)}.${extension}`;
}

/** Message d'erreur si le fichier ne respecte pas les règles, sinon `null`. */
export function validateImage(
  file: { name: string; type: string; size: number },
  maxBytes: number = MAX_UPLOAD_BYTES,
) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return `« ${file.name} » : format non accepté (JPG, PNG, WEBP ou AVIF).`;
  }
  if (file.size > maxBytes) {
    return `« ${file.name} » pèse ${(file.size / 1024 / 1024).toFixed(
      1,
    )} Mo, au-delà de la limite de ${maxBytes / 1024 / 1024} Mo. Réduisez la photo avant de l'envoyer.`;
  }
  return null;
}
