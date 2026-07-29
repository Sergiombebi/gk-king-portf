"use server";

// =============================================================================
//  ACTIONS DE L'ESPACE ADMIN
//  ⚠️ Chaque action revérifie la session : elles sont atteignables par requête
//  directe, pas seulement depuis l'interface.
// =============================================================================

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { changePassword, verifyCredentials } from "@/lib/admin-users";
import { describeBlobError } from "@/lib/blob-errors";
import { isGalleryFolder } from "@/lib/gallery-config";
import { deletePhoto } from "@/lib/photos";
import {
  createSession,
  destroySession,
  isAuthConfigured,
  requireSession,
} from "@/lib/session";

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

  // Contrôle explicite : la fenêtre de connexion s'ouvre depuis le site public,
  // sans le message de configuration affiché par la page `/admin/connexion`.
  if (!isAuthConfigured()) {
    return {
      error:
        "Connexion impossible : la configuration du serveur est incomplète.",
    };
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
  // Purge le tableau de bord du cache routeur : sans ça, le bouton « précédent »
  // pourrait réafficher la version rendue pendant la session.
  revalidatePath("/admin", "layout");
  redirect("/");
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
