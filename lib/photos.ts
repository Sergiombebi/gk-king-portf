// =============================================================================
//  LECTURE / SUPPRESSION DES PHOTOS (Vercel Blob)
//  ⚠️ Code serveur uniquement — jamais importé depuis un composant client.
//  L'envoi, lui, se fait directement du navigateur vers le stockage
//  (voir app/api/admin/upload/route.ts).
// =============================================================================

import { del, list, put } from "@vercel/blob";
import type { GalleryItem } from "@/app/components/Gallery";
import { fallbackGallery, type GalleryFolderKey } from "./gallery-config";
import { altFromPathname } from "./upload-rules";

const ROOT = "galerie";

export type ManagedPhoto = {
  /** URL publique de l'image sur le stockage. */
  url: string;
  /** Chemin interne, ex: "galerie/photographie/mariage__1730000000000.jpg". */
  pathname: string;
  /** Titre lisible reconstruit depuis le nom de fichier. */
  alt: string;
  uploadedAt: string;
};

/**
 * Le stockage est utilisable de deux façons :
 *  • `BLOB_READ_WRITE_TOKEN` — l'ancienne clé, qui autorise tout ;
 *  • `BLOB_STORE_ID` + jeton OIDC fourni par Vercel — le nouveau mode, qui
 *    couvre la lecture, l'écriture et la suppression DEPUIS LE SERVEUR.
 */
export const isStorageConfigured = () =>
  Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

/**
 * L'envoi direct navigateur → stockage exige de signer un jeton temporaire,
 * ce que seule l'ancienne clé permet. Sans elle, on passe par le serveur.
 */
export const canUploadFromBrowser = () =>
  Boolean(process.env.BLOB_READ_WRITE_TOKEN);

/**
 * Photos envoyées depuis l'admin pour un dossier, de la plus ancienne à la
 * plus récente. Retourne une liste vide si le stockage n'est pas configuré
 * (développement local) ou en cas d'erreur réseau : le site reste affichable.
 */
export async function listManagedPhotos(
  folder: GalleryFolderKey,
): Promise<ManagedPhoto[]> {
  if (!isStorageConfigured()) return [];
  try {
    const { blobs } = await list({ prefix: `${ROOT}/${folder}/`, limit: 1000 });
    return blobs
      .map((blob) => ({
        url: blob.url,
        pathname: blob.pathname,
        alt: altFromPathname(blob.pathname),
        uploadedAt: blob.uploadedAt.toISOString(),
      }))
      .sort((a, b) => a.uploadedAt.localeCompare(b.uploadedAt));
  } catch (error) {
    console.error(`Lecture des photos « ${folder} » impossible :`, error);
    return [];
  }
}

/**
 * Galerie affichée sur le site public : les photos de l'admin si elles
 * existent, sinon les images statiques livrées avec le site.
 */
export async function getGallery(
  folder: GalleryFolderKey,
): Promise<GalleryItem[]> {
  const managed = await listManagedPhotos(folder);
  if (managed.length === 0) return fallbackGallery(folder);
  return managed.map((photo, i) => ({
    src: photo.url,
    alt: photo.alt,
    featured: i === 0,
  }));
}

/**
 * Envoi effectué PAR LE SERVEUR (voie de secours quand le navigateur ne peut
 * pas écrire directement dans le stockage). La photo transite alors par le
 * site, d'où une limite de taille plus basse.
 */
export async function uploadPhotoFromServer(
  pathname: string,
  file: File,
  contentType: string,
) {
  if (!pathname.startsWith(`${ROOT}/`)) {
    throw new Error("Destination invalide.");
  }
  return put(pathname, file, {
    access: "public",
    contentType,
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

/** Supprime une photo à partir de son chemin interne. */
export async function deletePhoto(pathname: string) {
  if (!pathname.startsWith(`${ROOT}/`)) {
    throw new Error("Chemin de photo invalide.");
  }
  await del(pathname);
}
