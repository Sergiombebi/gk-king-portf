"use client";

import { useEffect, useState } from "react";

/**
 * Fond d'en-tête en diaporama : fondu enchaîné (crossfade) + zoom lent
 * (effet « Ken Burns »). Robuste : précharge les images candidates et ne
 * fait défiler que celles réellement présentes dans /public.
 * - 1 seule image trouvée  → affichage fixe (pas de défilement)
 * - aucune image trouvée   → repli sur la 1re source (fond sombre si absente)
 */
export default function HeaderSlideshow({
  sources,
  interval = 6000,
}: {
  sources: string[];
  interval?: number;
}) {
  const [ready, setReady] = useState<string[]>([]);
  const [index, setIndex] = useState(0);

  // Précharge et conserve uniquement les images qui existent (dans l'ordre)
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      sources.map(
        (src) =>
          new Promise<string | null>((resolve) => {
            const img = new window.Image();
            img.onload = () => resolve(src);
            img.onerror = () => resolve(null);
            img.src = src;
          }),
      ),
    ).then((results) => {
      if (!cancelled) {
        setReady(results.filter((r): r is string => Boolean(r)));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [sources]);

  // Défilement automatique (désactivé si animations réduites)
  useEffect(() => {
    if (ready.length <= 1) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % ready.length);
    }, interval);
    return () => clearInterval(id);
  }, [ready, interval]);

  // Repli tant qu'aucune image n'est confirmée
  if (ready.length === 0) {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url('${sources[0]}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
    );
  }

  const active = index % ready.length;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {ready.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
            i === active ? "opacity-100 animate-kenburns" : "opacity-0"
          }`}
          style={{
            backgroundImage: `url('${src}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      ))}
    </div>
  );
}
