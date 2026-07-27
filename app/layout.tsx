import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import { site } from "@/lib/site";
import Header from "./components/Header";
import Footer from "./components/Footer";
import WhatsAppFloat from "./components/WhatsAppFloat";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} — Photographe professionnel à Yaoundé`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [
    "photographe Yaoundé",
    "photographe Cameroun",
    "photographe mariage Yaoundé",
    "impression numérique Yaoundé",
    "personnalisation t-shirt Cameroun",
    "infographie Yaoundé",
    "banderole flyers Yaoundé",
    "Gk-king-service",
  ],
  authors: [{ name: site.name }],
  openGraph: {
    title: `${site.name} — Photographe professionnel à Yaoundé`,
    description: site.description,
    type: "website",
    locale: "fr_FR",
    siteName: site.name,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppFloat />
      </body>
    </html>
  );
}
