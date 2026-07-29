import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { isAdminConfigured } from "@/lib/admin-users";
import { isAuthConfigured } from "@/lib/session-token";
import { getSession } from "@/lib/session";
import { site } from "@/lib/site";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Connexion",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ suite?: string }>;
}) {
  // Déjà connecté ? On va directement au tableau de bord.
  if (await getSession()) redirect("/admin");

  const { suite } = await searchParams;
  const next = suite?.startsWith("/admin") ? suite : "/admin";
  const configured = isAuthConfigured() && isAdminConfigured();

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-5 py-16 text-white">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <Image
            src="/icone.png"
            alt={site.name}
            width={56}
            height={56}
            className="rounded-xl"
          />
          <div>
            <h1 className="font-display text-2xl font-semibold">
              Espace administration
            </h1>
            <p className="mt-1 text-sm text-white/50">
              Gestion des photos du site
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
          {configured ? (
            <LoginForm next={next} />
          ) : (
            <div className="space-y-3 text-sm text-white/70">
              <p className="font-semibold text-white">
                Configuration incomplète
              </p>
              <p>
                Les variables d&apos;environnement{" "}
                <code className="text-brand-light">SESSION_SECRET</code>,{" "}
                <code className="text-brand-light">ADMIN_USERNAME</code> et{" "}
                <code className="text-brand-light">ADMIN_PASSWORD</code> doivent
                être définies avant de pouvoir se connecter.
              </p>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-white/30">
          Accès réservé — {site.name}
        </p>
      </div>
    </main>
  );
}
