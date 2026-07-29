// =============================================================================
//  COMPTES ADMIN — identifiants stockés dans un fichier PRIVÉ sur Vercel Blob
//
//  • Le mot de passe n'est JAMAIS stocké en clair : seule une empreinte scrypt
//    (irréversible, avec sel aléatoire) est enregistrée.
//  • Le fichier est en accès « private » : il n'est pas accessible par URL,
//    seul le serveur (qui possède le jeton) peut le lire.
//  • Tant qu'aucun changement de mot de passe n'a eu lieu, les identifiants de
//    départ proviennent des variables d'environnement ADMIN_USERNAME /
//    ADMIN_PASSWORD. Au premier changement, le fichier est créé et fait foi.
// =============================================================================

import { get, put } from "@vercel/blob";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

const CREDENTIALS_PATH = "admin/credentials.json";
const KEY_LENGTH = 64;

export type AdminUser = { username: string; hash: string };

/* -------------------------------------------------------------------------- */
/*  Empreintes de mot de passe                                                 */
/* -------------------------------------------------------------------------- */

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derived = await scryptAsync(password, salt, KEY_LENGTH);
  return `scrypt:${salt.toString("hex")}:${derived.toString("hex")}`;
}

async function matchesPassword(password: string, stored: string) {
  const [scheme, saltHex, keyHex] = stored.split(":");
  if (scheme !== "scrypt" || !saltHex || !keyHex) return false;
  const derived = await scryptAsync(password, Buffer.from(saltHex, "hex"), KEY_LENGTH);
  const expected = Buffer.from(keyHex, "hex");
  if (expected.length !== derived.length) return false;
  return timingSafeEqual(derived, expected);
}

/* -------------------------------------------------------------------------- */
/*  Lecture / écriture du fichier d'identifiants                               */
/* -------------------------------------------------------------------------- */

async function readStoredUsers(): Promise<AdminUser[] | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  try {
    const result = await get(CREDENTIALS_PATH, {
      access: "private",
      useCache: false,
    });
    if (!result || result.statusCode !== 200) return null;
    const users = JSON.parse(await new Response(result.stream).text());
    return Array.isArray(users) ? (users as AdminUser[]) : null;
  } catch {
    // Fichier absent (premier démarrage) ou stockage indisponible.
    return null;
  }
}

async function writeStoredUsers(users: AdminUser[]) {
  await put(CREDENTIALS_PATH, JSON.stringify(users, null, 2), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

/** Identifiants de départ, définis dans les variables d'environnement. */
function bootstrapUser() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) return null;
  return { username, password };
}

export const isAdminConfigured = () => Boolean(bootstrapUser());

/* -------------------------------------------------------------------------- */
/*  Opérations utilisées par les actions serveur                               */
/* -------------------------------------------------------------------------- */

/** Vérifie un couple identifiant / mot de passe. */
export async function verifyCredentials(username: string, password: string) {
  const stored = await readStoredUsers();

  if (stored) {
    const user = stored.find((u) => u.username === username);
    if (!user) return false;
    return matchesPassword(password, user.hash);
  }

  // Aucun fichier encore créé : on compare aux identifiants de départ.
  const bootstrap = bootstrapUser();
  if (!bootstrap) return false;
  const sameUser = timingSafeEqualString(username, bootstrap.username);
  const samePassword = timingSafeEqualString(password, bootstrap.password);
  return sameUser && samePassword;
}

/**
 * Change le mot de passe d'un compte. Crée le fichier d'identifiants s'il
 * n'existe pas encore (première modification depuis l'installation).
 */
export async function changePassword(
  username: string,
  currentPassword: string,
  newPassword: string,
) {
  if (newPassword.length < 8) {
    throw new Error("Le nouveau mot de passe doit faire au moins 8 caractères.");
  }
  if (!(await verifyCredentials(username, currentPassword))) {
    throw new Error("Mot de passe actuel incorrect.");
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "Le stockage n'est pas configuré : impossible d'enregistrer le nouveau mot de passe.",
    );
  }

  const users = (await readStoredUsers()) ?? [];
  const hash = await hashPassword(newPassword);
  const existing = users.findIndex((u) => u.username === username);
  if (existing >= 0) {
    users[existing] = { username, hash };
  } else {
    users.push({ username, hash });
  }
  await writeStoredUsers(users);
}

/** Comparaison à durée constante de deux chaînes de longueurs quelconques. */
function timingSafeEqualString(a: string, b: string) {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) {
    // On compare quand même pour ne pas révéler la longueur par le temps.
    timingSafeEqual(bufferA, bufferA);
    return false;
  }
  return timingSafeEqual(bufferA, bufferB);
}
