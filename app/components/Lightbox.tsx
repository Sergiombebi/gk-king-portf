"use client";

import Image from "next/image";
import { useCallback, useEffect } from "react";
import type { GalleryItem } from "./Gallery";
import { ArrowIcon, CloseIcon } from "./icons";

/**
 * Modal plein écran (lightbox) pour agrandir une image.
 * - Fondu + zoom à l'ouverture
 * - Navigation précédent / suivant (flèches + clavier ← →)
 * - Fermeture : croix, clic sur le fond, touche Échap
 */
export default function Lightbox({
  items,
  index,
  onClose,
  onNavigate,
}: {
  /** Liste des images affichables (avec `src`). */
  items: GalleryItem[];
  /** Index courant, ou null si la modal est fermée. */
  index: number | null;
  onClose: () => void;
  onNavigate: (next: number) => void;
}) {
  const open = index !== null;

  const goPrev = useCallback(() => {
    if (index === null) return;
    onNavigate((index - 1 + items.length) % items.length);
  }, [index, items.length, onNavigate]);

  const goNext = useCallback(() => {
    if (index === null) return;
    onNavigate((index + 1) % items.length);
  }, [index, items.length, onNavigate]);

  // Clavier + blocage du défilement de la page
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, goPrev, goNext]);

  if (!open || index === null) return null;
  const current = items[index];
  if (!current?.src) return null;
  const many = items.length > 1;

  return (
    <div
      className="animate-modal-fade fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={current.alt}
    >
      {/* Fermer */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-brand"
      >
        <CloseIcon className="h-6 w-6" />
      </button>

      {/* Précédent / Suivant */}
      {many && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Image précédente"
            className="absolute left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-brand sm:left-6"
          >
            <ArrowIcon className="h-6 w-6 rotate-180" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="Image suivante"
            className="absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-brand sm:right-6"
          >
            <ArrowIcon className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Image */}
      <figure
        key={index}
        onClick={(e) => e.stopPropagation()}
        className="animate-modal-zoom relative flex max-h-full w-full max-w-5xl flex-col items-center"
      >
        <div className="relative h-[76vh] w-full">
          <Image
            src={current.src}
            alt={current.alt}
            fill
            sizes="90vw"
            className="object-contain"
            priority
          />
        </div>
        <figcaption className="mt-4 flex items-center gap-3 text-sm text-white/80">
          <span className="font-medium">{current.alt}</span>
          {many && (
            <span className="text-white/40">
              {index + 1} / {items.length}
            </span>
          )}
        </figcaption>
      </figure>
    </div>
  );
}
