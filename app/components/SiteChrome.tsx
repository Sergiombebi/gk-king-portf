"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Masque l'habillage du site (en-tête, pied de page, bouton WhatsApp) sur les
 * pages d'administration, qui ont leur propre mise en page.
 */
export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}
