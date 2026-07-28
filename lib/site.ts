// =============================================================================
//  CONFIGURATION CENTRALE DU SITE — Gk-king-service
//  👉 Modifiez UNIQUEMENT ce fichier pour changer les infos de contact,
//     les réseaux sociaux, le nom, etc. Tout le site lit ces valeurs.
// =============================================================================

export const site = {
  name: "Gk-king-service",
  shortName: "GK King",
  tagline: "Photographe professionnel · Impression numérique · Infographie",
  description:
    "Gk-king-service — Photographe professionnel à Yaoundé (Château, Ngoa-Ekellé). Photographie mariage, anniversaire, création de contenu, spot publicitaire. Impression numérique, agrandissement, personnalisation textile et infographie.",

  // --- Coordonnées de contact -------------------------------------------------
  // ⚠️ REMPLACEZ par vos vraies coordonnées.
  // Format WhatsApp : indicatif pays SANS le "+" ni espaces (Cameroun = 237).
  contact: {
    whatsapp: "237656092638", // 👈 Numéro WhatsApp (indicatif 237 + 656092638)
    whatsappDisplay: "+237 6 56 09 26 38", // 👈 Affichage lisible
    email: "abbasfifen@gmail.com", // 👈 À REMPLACER par votre e-mail
    phoneDisplay: "+237 6 56 09 26 38",
  },

  // --- Localisation -----------------------------------------------------------
  location: {
    city: "Yaoundé, Cameroun",
    area: "Château, Ngoa-Ekellé",
    coverage: "Déplacement partout où le besoin se trouve",
  },

  // --- Réseaux sociaux --------------------------------------------------------
  // ⚠️ REMPLACEZ par les liens de vos profils.
  socials: {
    whatsapp: "https://wa.me/237656092638", // 👈 wa.me/<numéro>
    facebook: "https://www.facebook.com/share/19UCuohWTV/?mibextid=wwXIfr", // 👈 À REMPLACER
    tiktok: "https://www.tiktok.com/@gklegaza?_r=1&_t=ZS-98MjjzzvTpR", // 👈 À REMPLACER
  },
} as const;

// Message pré-rempli pour le bouton WhatsApp
export const whatsappLink = (message?: string) => {
  const base = `https://wa.me/${site.contact.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
};

// Lien mailto pré-rempli
export const mailLink = (subject?: string, body?: string) => {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  const qs = params.toString();
  return `mailto:${site.contact.email}${qs ? `?${qs}` : ""}`;
};

// =============================================================================
//  NAVIGATION
// =============================================================================
export const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/photographie", label: "Photographie" },
  { href: "/impression-numerique", label: "Impression numérique" },
  { href: "/infographie", label: "Infographie" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
] as const;
