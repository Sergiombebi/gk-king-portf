import type { GalleryItem } from "@/app/components/Gallery";

export type IconKey = "camera" | "printer" | "palette";

export type Service = {
  slug: string;
  href: string;
  icon: IconKey;
  title: string;
  short: string; // phrase courte (cartes accueil)
  intro: string; // paragraphe d'introduction (page)
  features: { title: string; description: string }[];
  gallery: GalleryItem[];
};

export const services: Service[] = [
  // ==========================================================================
  {
    slug: "photographie",
    href: "/photographie",
    icon: "camera",
    title: "Photographie",
    short:
      "Mariage, anniversaire, création de contenu et spots publicitaires — tout type de photo, avec un regard professionnel.",
    intro:
      "Chaque instant mérite d'être immortalisé avec soin. De vos événements les plus intimes aux campagnes de votre marque, je capture des images nettes, vivantes et pleines d'émotion, en studio comme sur le terrain, partout où le besoin se trouve.",
    features: [
      {
        title: "Tout type de photo",
        description:
          "Portrait, événementiel, produit, corporate, mode… une prestation adaptée à chaque besoin.",
      },
      {
        title: "Mariage",
        description:
          "De la préparation à la soirée, une couverture complète de votre plus beau jour.",
      },
      {
        title: "Anniversaires",
        description:
          "Anniversaires, baptêmes et fêtes de famille immortalisés avec spontanéité.",
      },
      {
        title: "Création de contenu",
        description:
          "Photos pensées pour vos réseaux sociaux : Instagram, TikTok, Facebook.",
      },
      {
        title: "Spot publicitaire",
        description:
          "Images et visuels percutants pour vos publicités et votre communication de marque.",
      },
    ],
    gallery: [
      { src: "/galerie/photographie/mariage.jpg", alt: "Mariage", featured: true },
      { src: "/galerie/photographie/portrait.jpg", alt: "Portrait studio" },
      { src: "/galerie/photographie/anniversaire.jpg", alt: "Anniversaire" },
      { src: "/galerie/photographie/creation-contenu.jpg", alt: "Création de contenu" },
      { src: "/galerie/photographie/spot-publicitaire.jpg", alt: "Spot publicitaire" },
      { src: "/galerie/photographie/evenement.jpg", alt: "Événement" },
      { src: "/galerie/photographie/produit.jpg", alt: "Photo produit" },
    ],
  },

  // ==========================================================================
  {
    slug: "impression-numerique",
    href: "/impression-numerique",
    icon: "printer",
    title: "Impression numérique",
    short:
      "Agrandissement, impression sur tout support (banderoles, flyers) et personnalisation textile de qualité.",
    intro:
      "Donnez une forme physique à vos images et à votre communication. Du tirage grand format à la personnalisation de vos textiles, j'assure une impression nette, des couleurs fidèles et des finitions soignées sur une large gamme de supports.",
    features: [
      {
        title: "Agrandissement de photo",
        description:
          "Tirages grand format de vos meilleures photos, avec un rendu net et des couleurs éclatantes.",
      },
      {
        title: "Impression tout support",
        description:
          "Banderoles, bâches, flyers, affiches, cartes de visite et bien plus.",
      },
      {
        title: "Personnalisation textile",
        description:
          "Vente et personnalisation de t-shirts, survêtements, polos et casquettes à votre image.",
      },
    ],
    gallery: [
      { src: "/galerie/impression-numerique/agrandissement.jpg", alt: "Agrandissement photo", featured: true },
      { src: "/galerie/impression-numerique/banderole.jpg", alt: "Banderole" },
      { src: "/galerie/impression-numerique/flyers.jpg", alt: "Flyers" },
      { src: "/galerie/impression-numerique/tshirt.jpg", alt: "T-shirt personnalisé" },
      { src: "/galerie/impression-numerique/casquette.jpg", alt: "Casquette personnalisée" },
      { src: "/galerie/impression-numerique/polo-survetement.jpg", alt: "Polo & survêtement" },
      { src: "/galerie/impression-numerique/affiche.jpg", alt: "Affiche grand format" },
    ],
  },

  // ==========================================================================
  {
    slug: "infographie",
    href: "/infographie",
    icon: "palette",
    title: "Infographie",
    short:
      "Logo, identité visuelle, affiches, flyers et visuels réseaux sociaux — un design qui vous distingue.",
    intro:
      "Une bonne image commence par un bon design. Je conçois des visuels professionnels qui renforcent votre identité et captent l'attention : de votre logo à vos supports print et digitaux, chaque création est pensée pour votre marque.",
    features: [
      {
        title: "Logo & identité visuelle",
        description:
          "Création de logos et de chartes graphiques qui rendent votre marque reconnaissable.",
      },
      {
        title: "Affiches & flyers",
        description:
          "Conception de supports print percutants pour vos événements et promotions.",
      },
      {
        title: "Visuels réseaux sociaux",
        description:
          "Bannières, publications et habillages adaptés à chaque plateforme.",
      },
      {
        title: "Retouche & montage",
        description:
          "Retouche photo professionnelle et compositions créatives sur mesure.",
      },
    ],
    // Pas de galerie pour l'infographie : le bloc image est masqué.
    gallery: [],
  },
];

export const getService = (slug: string) =>
  services.find((s) => s.slug === slug);
