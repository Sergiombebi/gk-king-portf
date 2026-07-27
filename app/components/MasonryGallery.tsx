"use client";

import Image from "next/image";
import { useState } from "react";
import type { GalleryItem } from "./Gallery";
import Lightbox from "./Lightbox";
import { CameraIcon } from "./icons";
import Reveal from "./Reveal";

// Rythme des hauteurs pour un rendu « masonry » harmonieux (chaque tuile diffère)
const ASPECTS = [
  "aspect-[3/4]",
  "aspect-[4/5]",
  "aspect-square",
  "aspect-[4/3]",
  "aspect-[4/5]",
  "aspect-[3/4]",
  "aspect-square",
];

/**
 * Galerie « masonry » (colonnes façon Pinterest) : chaque image a une hauteur
 * différente, zoom au survol, ouverture en lightbox. Aucun titre sous les
 * images. Option « Voir plus » via `initialCount`.
 */
export default function MasonryGallery({
  items,
  initialCount,
}: {
  items: GalleryItem[];
  /** Nombre d'images affichées avant le bouton « Voir plus ». */
  initialCount?: number;
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);

  const viewable = items.filter((it) => it.src);
  const limited = Boolean(initialCount) && !expanded;
  const visible = limited ? items.slice(0, initialCount) : items;
  const hasMore = Boolean(initialCount) && items.length > (initialCount ?? 0);

  return (
    <>
      <div className="columns-2 gap-4 sm:columns-3 [&>*]:mb-4">
        {visible.map((item, i) => {
          const vIndex = item.src ? viewable.indexOf(item) : -1;
          const aspect = ASPECTS[i % ASPECTS.length];
          const delay =
            (expanded && initialCount ? i - initialCount : i) * 90;
          const media = (
            <div className={`relative w-full ${aspect}`}>
              <Tile item={item} />
            </div>
          );

          return (
            <Reveal
              key={`${item.alt}-${i}`}
              delay={delay}
              variant="zoom"
              className="break-inside-avoid"
            >
              {vIndex >= 0 ? (
                <button
                  type="button"
                  onClick={() => setOpenIdx(vIndex)}
                  aria-label={`Agrandir : ${item.alt}`}
                  className="group relative block w-full cursor-zoom-in overflow-hidden rounded-2xl bg-ink shadow-sm transition-shadow duration-300 hover:shadow-2xl hover:shadow-brand/10"
                >
                  {media}
                </button>
              ) : (
                <div className="group relative overflow-hidden rounded-2xl bg-ink shadow-sm">
                  {media}
                </div>
              )}
            </Reveal>
          );
        })}
      </div>

      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand"
          >
            {expanded
              ? "Voir moins"
              : `Voir plus (${items.length - (initialCount ?? 0)})`}
          </button>
        </div>
      )}

      <Lightbox
        items={viewable}
        index={openIdx}
        onClose={() => setOpenIdx(null)}
        onNavigate={setOpenIdx}
      />
    </>
  );
}

/** Affiche la photo si elle existe, sinon un emplacement réservé. */
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
      sizes="(max-width: 640px) 50vw, 33vw"
      className="object-cover transition-transform duration-700 group-hover:scale-105"
      onError={() => setFailed(true)}
    />
  );
}

function Placeholder({ label }: { label: string }) {
  return (
    <div className="bg-dots absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink-soft text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-brand/40 text-brand">
        <CameraIcon className="h-5 w-5" />
      </span>
      <span className="px-3 text-[10px] font-medium uppercase tracking-widest text-white/50">
        {label}
      </span>
      <span className="text-[9px] uppercase tracking-widest text-brand/70">
        Photo à venir
      </span>
    </div>
  );
}
