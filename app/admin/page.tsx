import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { GALLERY_FOLDERS, fallbackGallery } from "@/lib/gallery-config";
import {
  canUploadFromBrowser,
  isStorageConfigured,
  listManagedPhotos,
} from "@/lib/photos";
import { getSession } from "@/lib/session";
import AdminPanel, { type FolderData } from "./AdminPanel";
import LogoutButton from "./LogoutButton";
import PasswordForm from "./PasswordForm";

export const metadata: Metadata = {
  title: "Espace administration",
  robots: { index: false, follow: false },
};

// Les photos changent à la demande : on lit toujours l'état réel du stockage.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/admin/connexion");

  const data: FolderData[] = await Promise.all(
    GALLERY_FOLDERS.map(async (folder) => ({
      folder,
      photos: await listManagedPhotos(folder.key),
      fallbackCount: fallbackGallery(folder.key).length,
    })),
  );

  return (
    <main className="min-h-screen bg-ink px-5 py-10 text-white sm:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-10">
        {/* Barre supérieure */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-light">
              Espace administration
            </p>
            <h1 className="font-display mt-2 text-3xl font-semibold">
              Gestion des photos
            </h1>
            <p className="mt-1 text-sm text-white/50">
              Connecté en tant que{" "}
              <strong className="text-white/80">{session.username}</strong>
            </p>
          </div>
          {/* La déconnexion est la seule sortie : revenir au tableau de bord
              imposera une nouvelle connexion. */}
          <LogoutButton />
        </header>

        <AdminPanel
          data={data}
          storageReady={isStorageConfigured()}
          browserUpload={canUploadFromBrowser()}
        />

        <section className="border-t border-white/10 pt-10">
          <h2 className="font-display text-xl font-semibold">
            Changer mon mot de passe
          </h2>
          <p className="mt-1 text-sm text-white/50">
            8 caractères minimum. Le nouveau mot de passe remplace
            immédiatement l&apos;ancien.
          </p>
          <PasswordForm />
        </section>
      </div>
    </main>
  );
}
