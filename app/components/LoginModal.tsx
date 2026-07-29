"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import LoginForm from "@/app/admin/connexion/LoginForm";
import { site } from "@/lib/site";
import { CloseIcon } from "./icons";

/**
 * Fenêtre de connexion à l'espace administration. Elle s'ouvre par-dessus le
 * site (aucun changement de page) : la connexion réussie redirige ensuite vers
 * le tableau de bord.
 */
export default function LoginModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Échap ferme la fenêtre, et le site derrière ne défile plus.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-connexion"
      className="animate-fade-in fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/80 px-5 py-10 backdrop-blur-sm"
      // Clic en dehors du panneau : on ferme.
      onMouseDown={(event) => {
        if (!panelRef.current?.contains(event.target as Node)) onClose();
      }}
    >
      <div
        ref={panelRef}
        className="animate-pop-in relative w-full max-w-md rounded-3xl border border-white/10 bg-ink p-7 text-white shadow-2xl shadow-black/50"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la fenêtre de connexion"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
        >
          <CloseIcon className="h-5 w-5" />
        </button>

        <div className="mb-7 flex flex-col items-center gap-3 text-center">
          <Image
            src="/icone.png"
            alt={site.name}
            width={48}
            height={48}
            className="rounded-xl"
          />
          <div>
            <h2
              id="titre-connexion"
              className="font-display text-xl font-semibold"
            >
              Espace administration
            </h2>
            <p className="mt-1 text-sm text-white/50">
              Connectez-vous pour gérer les photos du site
            </p>
          </div>
        </div>

        <LoginForm next="/admin" />
      </div>
    </div>
  );
}
