// =============================================================================
//  PROXY (ex-« middleware ») — première barrière devant l'espace admin
//  Redirige vers la page de connexion si le cookie de session est absent ou
//  invalide. Ce contrôle reste « optimiste » : chaque action serveur revérifie
//  la session de son côté.
// =============================================================================

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session-token";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // La page de connexion doit rester accessible sans session.
  if (pathname.startsWith("/admin/connexion")) return NextResponse.next();

  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (session) return NextResponse.next();

  const loginUrl = new URL("/admin/connexion", request.url);
  if (pathname !== "/admin") {
    loginUrl.searchParams.set("suite", `${pathname}${search}`);
  }
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
