// =============================================================================
//  ENVOI DES PHOTOS — le navigateur envoie le fichier DIRECTEMENT au stockage.
//  Cette route ne fait que délivrer un jeton d'envoi à usage unique, après
//  vérification de la session admin. Aucune photo ne transite par le serveur :
//  on évite ainsi la limite de taille des requêtes et les envois lents.
// =============================================================================

import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { isGalleryFolder } from "@/lib/gallery-config";
import { getSession } from "@/lib/session";
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from "@/lib/upload-rules";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Le jeton n'est délivré qu'à un administrateur connecté…
        const session = await getSession();
        if (!session) throw new Error("Non autorisé.");

        // …et uniquement pour un dossier de galerie connu.
        const [root, folder] = pathname.split("/");
        if (root !== "galerie" || !folder || !isGalleryFolder(folder)) {
          throw new Error("Destination invalide.");
        }

        return {
          allowedContentTypes: ALLOWED_IMAGE_TYPES,
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          addRandomSuffix: false,
          allowOverwrite: true,
        };
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Envoi impossible.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
