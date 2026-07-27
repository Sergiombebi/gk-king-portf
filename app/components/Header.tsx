"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navLinks, site, whatsappLink } from "@/lib/site";
import { CloseIcon, MenuIcon, WhatsAppIcon } from "./icons";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Ombre / fond au défilement
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fermer le menu à chaque changement de page
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Bloquer le scroll du body quand le menu mobile est ouvert
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? "border-b border-white/10 bg-ink/90 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8 md:h-20">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-white"
          aria-label={`${site.name} — accueil`}
        >
          <Image
            src="/icone.png"
            alt={site.name}
            width={40}
            height={40}
            priority
            className="h-9 w-9 rounded-lg object-contain md:h-10 md:w-10"
          />
          <span className="font-display text-lg font-semibold tracking-tight">
            Gk-king<span className="text-brand">-service</span>
          </span>
        </Link>

        {/* Navigation bureau */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "text-brand"
                  : "text-white/80 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA + burger */}
        <div className="flex items-center gap-2">
          <a
            href={whatsappLink(
              "Bonjour Gk-king-service, je vous contacte depuis votre site.",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-dark hover:-translate-y-0.5 sm:inline-flex"
          >
            <WhatsAppIcon className="h-4 w-4" />
            WhatsApp
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 lg:hidden"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
          >
            {open ? (
              <CloseIcon className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      <div
        className={`overflow-hidden bg-ink transition-[max-height] duration-500 ease-out lg:hidden ${
          open ? "max-h-[26rem] border-t border-white/10" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col gap-1 px-5 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-brand/10 text-brand"
                  : "text-white/80 hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <a
            href={whatsappLink(
              "Bonjour Gk-king-service, je vous contacte depuis votre site.",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Écrire sur WhatsApp
          </a>
        </nav>
      </div>
    </header>
  );
}
