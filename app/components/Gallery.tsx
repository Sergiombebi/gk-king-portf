"use client";

import Image from "next/image";
import { useState } from "react";
import Lightbox from "./Lightbox";
import { CameraIcon } from "./icons";
import Reveal from "./Reveal";

export type GalleryItem = {
  /** Chemin de l'image dans /public, ex: "/galerie/photographie/mariage.jpg". */
  src?: string;
  /** Texte alternatif (accessibilité) et légende affichée. */
  alt: string;
  /** Rend la tuile plus grande (met en avant une image) */
  featured?: boolean;
};

/**
 * Grille de galerie en mosaïque, tolérante aux images manquantes.
 * ➜ Si `src` pointe vers un fichier absent, un emplacement réservé s'affiche.
 * ➜ Dès que le fichier est déposé au bon endroit, la photo apparaît seule.
 */
export default function Gallery({ items }: { items: GalleryItem[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const viewable = items.filter((it) => it.src);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        {items.map((item, i) => {
          const vIndex = item.src ? viewable.indexOf(item) : -1;
          const aspect = item.featured ? "aspect-square" : "aspect-[4/5]";
          const overlay = (
            <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <span className="p-4 text-sm font-medium text-white">
                {item.alt}
              </span>
            </div>
          );
          return (
            <Reveal
              key={i}
              delay={(i % 3) * 90}
              className={`group relative overflow-hidden rounded-2xl bg-ink ${
                item.featured ? "col-span-2 row-span-2" : ""
              }`}
            >
              {vIndex >= 0 ? (
                <button
                  type="button"
                  onClick={() => setOpenIdx(vIndex)}
                  aria-label={`Agrandir : ${item.alt}`}
                  className={`relative block w-full cursor-zoom-in ${aspect}`}
                >
                  <Tile item={item} />
                  {overlay}
                </button>
              ) : (
                <div className={`relative ${aspect}`}>
                  <Tile item={item} />
                  {overlay}
                </div>
              )}
            </Reveal>
          );
        })}
      </div>

      <Lightbox
        items={viewable}
        index={openIdx}
        onClose={() => setOpenIdx(null)}
        onNavigate={setOpenIdx}
      />
    </>
  );
}

/** Affiche la photo si elle existe, sinon un emplacement réservé élégant. */
function Tile({ item }: { item: GalleryItem }) {
  const [failed, setFailed] = useState(false);

  if (!item.src || failed) {
    return <Placeholder label={item.alt} />;
  }

  return (
    <Image
      src={item.src}
      alt={item.alt}
      fill
      sizes="(max-width: 768px) 50vw, 33vw"
      className="object-cover transition-transform duration-700 group-hover:scale-105"
      onError={() => setFailed(true)}
    />
  );
}

/** Emplacement réservé affiché tant qu'aucune image n'est disponible. */
function Placeholder({ label }: { label: string }) {
  return (
    <div className="bg-dots absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink-soft text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-brand/40 text-brand">
        <CameraIcon className="h-6 w-6" />
      </span>
      <span className="px-4 text-xs font-medium uppercase tracking-widest text-white/50">
        {label}
      </span>
      <span className="text-[10px] uppercase tracking-widest text-brand/70">
        Photo à venir
      </span>
    </div>
  );
}
