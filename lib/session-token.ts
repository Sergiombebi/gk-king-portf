// =============================================================================
//  JETON DE SESSION (signature / vérification)
//  Fichier volontairement sans dépendance à `next/headers` : il est aussi
//  utilisé par `proxy.ts`, qui s'exécute dans un runtime restreint.
// =============================================================================

import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "gk_admin_session";
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 jours

export type SessionPayload = { username: string };

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "SESSION_SECRET manquant ou trop court : ajoutez une chaîne aléatoire d'au moins 32 caractères dans les variables d'environnement.",
    );
  }
  return new TextEncoder().encode(secret);
}

/** L'espace admin n'est utilisable que si le secret de session est présent. */
export const isAuthConfigured = () =>
  Boolean(process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16);

export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey());
}

/** Vérifie un jeton. Retourne `null` si absent, expiré ou falsifié. */
export async function verifySession(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token || !isAuthConfigured()) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: ["HS256"],
    });
    return typeof payload.username === "string"
      ? { username: payload.username }
      : null;
  } catch {
    return null;
  }
}
