// =============================================================================
//  ENVOI PAR LE SERVEUR — voie de secours.
//  Utilisée quand le stockage est relié en mode OIDC (BLOB_STORE_ID), qui ne
//  permet pas de signer un jeton d'envoi pour le navigateur. La photo transite
//  alors par le site, d'où une limite de taille plus basse.
// =============================================================================

import { NextResponse } from "next/server";
import { describeBlobError } from "@/lib/blob-errors";
import { isGalleryFolder } from "@/lib/gallery-config";
import { uploadPhotoFromServer } from "@/lib/photos";
import { getSession } from "@/lib/session";
import {
  MAX_SERVER_UPLOAD_BYTES,
  buildPhotoPathname,
  validateImage,
} from "@/lib/upload-rules";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Session expirée — reconnectez-vous." },
      { status: 401 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      {
        error:
          "La photo n'a pas pu être reçue : elle est probablement trop lourde pour ce mode d'envoi.",
      },
      { status: 413 },
    );
  }

  const file = formData.get("file");
  const folder = String(formData.get("folder") ?? "");
  const title = String(formData.get("title") ?? "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }
  if (!isGalleryFolder(folder)) {
    return NextResponse.json(
      { error: "Destination invalide." },
      { status: 400 },
    );
  }

  const problem = validateImage(file, MAX_SERVER_UPLOAD_BYTES);
  if (problem) {
    return NextResponse.json({ error: problem }, { status: 400 });
  }

  try {
    const blob = await uploadPhotoFromServer(
      buildPhotoPathname(folder, file.name, title),
      file,
      file.type,
    );
    return NextResponse.json({ url: blob.url, pathname: blob.pathname });
  } catch (error) {
    console.error("Envoi par le serveur en échec :", error);
    return NextResponse.json(
      { error: describeBlobError(error) },
      { status: 500 },
    );
  }
}
