"use client";

import Image from "next/image";
import { useState } from "react";
import { CameraIcon } from "./icons";

/**
 * Photo encadrée (portrait, atelier…) avec repli automatique : tant que le
 * fichier n'existe pas, un emplacement réservé élégant s'affiche.
 * Le parent définit le format via `className` (ex: "aspect-[4/5]").
 */
export default function FramedPhoto({
  src,
  alt,
  placeholder,
  className = "",
}: {
  src: string;
  alt: string;
  /** Texte affiché dans l'emplacement réservé (par défaut : `alt`). */
  placeholder?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-ink ${className}`}>
      {!failed ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="bg-dots absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
          <CameraIcon className="h-12 w-12 text-brand" />
          <span className="px-6 text-xs uppercase tracking-widest text-white/50">
            {placeholder ?? alt}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-brand/70">
            Photo à venir
          </span>
        </div>
      )}
    </div>
  );
}
