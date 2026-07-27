import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowIcon } from "./icons";

/* -------------------------------------------------------------------------- */
/*  Bouton (lien) — variantes primaire / secondaire / fantôme                  */
/* -------------------------------------------------------------------------- */
type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost";
  external?: boolean;
  className?: string;
  icon?: ReactNode;
};

const buttonBase =
  "group inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2";

const buttonVariants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-brand text-white shadow-lg shadow-brand/25 hover:bg-brand-dark hover:shadow-xl hover:shadow-brand/30 hover:-translate-y-0.5",
  outline:
    "border border-white/25 text-white hover:border-brand hover:bg-brand hover:-translate-y-0.5",
  ghost:
    "border border-black/10 text-ink hover:border-brand hover:text-brand",
};

export function Button({
  href,
  children,
  variant = "primary",
  external,
  className = "",
  icon,
}: ButtonProps) {
  const classes = `${buttonBase} ${buttonVariants[variant]} ${className}`;
  const content = (
    <>
      {children}
      {icon ?? (
        <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      )}
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*  Étiquette de section (petit label orange)                                  */
/* -------------------------------------------------------------------------- */
export function Eyebrow({
  children,
  dark = false,
}: {
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${
        dark ? "text-brand-light" : "text-brand"
      }`}
    >
      <span className="h-px w-6 bg-brand" />
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  En-tête de section (eyebrow + titre + intro)                               */
/* -------------------------------------------------------------------------- */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  dark = false,
  center = false,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  dark?: boolean;
  center?: boolean;
}) {
  return (
    <div className={`max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      <Eyebrow dark={dark}>{eyebrow}</Eyebrow>
      <h2
        className={`font-display mt-4 text-3xl font-semibold leading-tight sm:text-4xl md:text-[2.75rem] ${
          dark ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {intro && (
        <p
          className={`mt-5 text-base leading-relaxed sm:text-lg ${
            dark ? "text-white/70" : "text-black/60"
          }`}
        >
          {intro}
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Section conteneur avec largeur max                                         */
/* -------------------------------------------------------------------------- */
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}
