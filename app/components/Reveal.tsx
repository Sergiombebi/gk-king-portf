"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** délai en ms avant l'apparition (effet cascade) */
  delay?: number;
  /** "fade" (fondu + glissement) ou "zoom" (fondu + léger zoom, idéal photos) */
  variant?: "fade" | "zoom";
};

/**
 * Révèle son contenu en fondu/glissement lorsqu'il entre dans le viewport.
 * S'appuie sur les styles [data-reveal] définis dans globals.css.
 */
export default function Reveal({
  children,
  as: Tag = "div",
  className,
  delay = 0,
  variant = "fade",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add("is-visible");
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal={variant}
      className={className}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
