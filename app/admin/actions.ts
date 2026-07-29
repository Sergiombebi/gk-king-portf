"use server";

// =============================================================================
//  ACTIONS DE L'ESPACE ADMIN
//  ⚠️ Chaque action revérifie la session : elles sont atteignables par requête
//  directe, pas seulement depuis l'interface.
// =============================================================================

import { del, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { changePassword, verifyCredentials } from "@/lib/admin-users";
import { describeBlobError } from "@/lib/blob-errors";
import { isGalleryFolder } from "@/lib/gallery-config";
import { deletePhoto } from "@/lib/photos";
import { createSession, destroySession, requireSession } from "@/lib/session";

export type ActionState = { error?: string; success?: string };

/** Rafraîchit les pages publiques qui affichent des photos. */
function revalidatePublicPages() {
  revalidatePath("/", "layout");
}

/* -------------------------------------------------------------------------- */
/*  Connexion                                                                  */
/* -------------------------------------------------------------------------- */

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("suite") ?? "/admin");

  if (!username || !password) {
    return { error: "Renseignez votre identifiant et votre mot de passe." };
  }

  let valid = false;
  try {
    valid = await verifyCredentials(username, password);
  } catch (error) {
    console.error("Vérification des identifiants impossible :", error);
    return {
      error:
        "Connexion impossible : la configuration du serveur est incomplète.",
    };
  }

  if (!valid) {
    return { error: "Identifiant ou mot de passe incorrect." };
  }

  await createSession(username);
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/connexion");
}

/* -------------------------------------------------------------------------- */
/*  Photos                                                                     */
/* -------------------------------------------------------------------------- */

/** Appelée après un envoi réussi pour rafraîchir l'affichage. */
export async function refreshPhotosAction() {
  await requireSession();
  revalidatePublicPages();
  revalidatePath("/admin");
}

export async function deletePhotoAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireSession();
    const pathname = String(formData.get("pathname") ?? "");
    const folder = pathname.split("/")[1];
    if (!isGalleryFolder(folder ?? "")) {
      return { error: "Photo introuvable." };
    }
    await deletePhoto(pathname);
    revalidatePublicPages();
    revalidatePath("/admin");
    return { success: "Photo supprimée." };
  } catch (error) {
    console.error("Suppression impossible :", error);
    return { error: describeBlobError(error) };
  }
}

/* -------------------------------------------------------------------------- */
/*  Diagnostic du stockage                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Dépose puis supprime un fichier témoin depuis le SERVEUR, et renvoie
 * l'erreur brute en cas d'échec. Permet de savoir si le problème vient du
 * stockage lui-même ou du trajet navigateur → stockage.
 */
export async function testStorageAction(): Promise<ActionState> {
  try {
    await requireSession();
  } catch {
    return { error: "Session expirée — reconnectez-vous." };
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return {
      error:
        "BLOB_READ_WRITE_TOKEN est absent : le stockage n'est pas relié à ce déploiement.",
    };
  }

  const pathname = `galerie/_diagnostic-${Date.now()}.txt`;
  try {
    const blob = await put(pathname, "test", {
      access: "public",
      contentType: "text/plain",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    await del(blob.url);
    return {
      success:
        "Stockage opérationnel : écriture et suppression réussies depuis le serveur.",
    };
  } catch (error) {
    console.error("Diagnostic du stockage en échec :", error);
    return { error: describeBlobError(error) };
  }
}

/* -------------------------------------------------------------------------- */
/*  Mot de passe                                                               */
/* -------------------------------------------------------------------------- */

export async function changePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const session = await requireSession();
    const current = String(formData.get("current") ?? "");
    const next = String(formData.get("next") ?? "");
    const confirm = String(formData.get("confirm") ?? "");

    if (next !== confirm) {
      return { error: "Les deux nouveaux mots de passe ne correspondent pas." };
    }

    await changePassword(session.username, current, next);
    return { success: "Mot de passe modifié." };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Modification impossible.",
    };
  }
}
