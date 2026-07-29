// =============================================================================
//  SESSION ADMIN — cookie httpOnly contenant un jeton signé
//  Aucune base de données : le jeton porte lui-même l'identité, et sa
//  signature est vérifiée à chaque requête.
// =============================================================================

import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  signSession,
  verifySession,
  type SessionPayload,
} from "./session-token";

export { isAuthConfigured, SESSION_COOKIE } from "./session-token";
export type { SessionPayload } from "./session-token";

export async function createSession(username: string) {
  const token = await signSession({ username });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Session courante, lue depuis le cookie. `null` si non connecté. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

/**
 * À appeler au début de CHAQUE action serveur sensible : les actions sont
 * atteignables par requête POST directe, pas seulement via l'interface.
 */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new Error("Session expirée — reconnectez-vous.");
  return session;
}
