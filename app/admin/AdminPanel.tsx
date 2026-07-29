"use client";

import { upload } from "@vercel/blob/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { describeBlobError } from "@/lib/blob-errors";
import type { GALLERY_FOLDERS, GalleryFolderKey } from "@/lib/gallery-config";
import type { ManagedPhoto } from "@/lib/photos";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_SERVER_UPLOAD_BYTES,
  MAX_UPLOAD_BYTES,
  buildPhotoPathname,
  validateImage,
} from "@/lib/upload-rules";
import {
  deletePhotoAction,
  refreshPhotosAction,
  testStorageAction,
  type ActionState,
} from "./actions";

type Folder = (typeof GALLERY_FOLDERS)[number];

export type FolderData = {
  folder: Folder;
  photos: ManagedPhoto[];
  fallbackCount: number;
};

export default function AdminPanel({
  data,
  storageReady,
  browserUpload,
}: {
  data: FolderData[];
  storageReady: boolean;
  /** true : envoi direct navigateur → stockage. false : passage par le serveur. */
  browserUpload: boolean;
}) {
  const [active, setActive] = useState<GalleryFolderKey>(data[0].folder.key);
  const current = data.find((d) => d.folder.key === active)!;

  return (
    <div className="space-y-8">
      {!storageReady && (
        <p className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-200">
          Aucun stockage n&apos;est relié à ce déploiement : ni{" "}
          <code>BLOB_READ_WRITE_TOKEN</code> ni <code>BLOB_STORE_ID</code>{" "}
          n&apos;est présent. Reliez le magasin au projet dans Vercel (Storage →
          Projets) puis redéployez. Vous pouvez parcourir l&apos;interface, mais
          les envois et suppressions échoueront.
        </p>
      )}

      <StorageTest />

      {storageReady && !browserUpload && (
        <p className="rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4 text-sm text-white/50">
          Mode d&apos;envoi : les photos passent par le site (limite{" "}
          {MAX_SERVER_UPLOAD_BYTES / 1024 / 1024} Mo par photo). Pour envoyer
          des fichiers plus lourds et plus vite, ajoutez la variable{" "}
          <code className="text-brand-light">BLOB_READ_WRITE_TOKEN</code> dans
          Vercel.
        </p>
      )}

      {/* Onglets */}
      <div className="flex flex-wrap gap-2">
        {data.map(({ folder, photos }) => {
          const isActive = folder.key === active;
          return (
            <button
              key={folder.key}
              type="button"
              onClick={() => setActive(folder.key)}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-brand text-white"
                  : "border border-white/15 text-white/70 hover:border-brand/50 hover:text-white"
              }`}
            >
              {folder.label}
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  isActive ? "bg-white/20" : "bg-white/10"
                }`}
              >
                {photos.length}
              </span>
            </button>
          );
        })}
      </div>

      <FolderEditor
        key={current.folder.key}
        data={current}
        browserUpload={browserUpload}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Diagnostic du stockage                                                     */
/* -------------------------------------------------------------------------- */

function StorageTest() {
  const [state, setState] = useState<ActionState | null>(null);
  const [running, startTest] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4">
      <button
        type="button"
        disabled={running}
        onClick={() =>
          startTest(async () => setState(await testStorageAction()))
        }
        className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/80 transition-colors hover:border-brand/50 hover:text-white disabled:opacity-60"
      >
        {running ? "Test en cours…" : "Tester le stockage"}
      </button>
      {state?.success && (
        <span className="text-sm text-emerald-300">{state.success}</span>
      )}
      {state?.error && (
        <span className="text-sm text-red-300">{state.error}</span>
      )}
      {!state && (
        <span className="text-sm text-white/40">
          Vérifie que le serveur sait écrire dans le stockage.
        </span>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Contenu d'un onglet                                                        */
/* -------------------------------------------------------------------------- */

/** Photo choisie mais pas encore envoyée. */
type Pending = { id: string; file: File; previewUrl: string };

/** Au-delà, on considère l'envoi perdu plutôt que de laisser tourner. */
const UPLOAD_TIMEOUT_MS = 90_000;

/** Voie de secours : la photo passe par le site, qui l'écrit dans le stockage. */
async function uploadThroughServer(
  folder: GalleryFolderKey,
  file: File,
  title: string,
) {
  const formData = new FormData();
  formData.set("file", file);
  formData.set("folder", folder);
  formData.set("title", title);

  const response = await fetch("/api/admin/upload-serveur", {
    method: "POST",
    body: formData,
    signal: AbortSignal.timeout(UPLOAD_TIMEOUT_MS),
  });

  if (!response.ok) {
    const details = await response
      .json()
      .catch(() => ({ error: `Le serveur a répondu ${response.status}.` }));
    throw new Error(details.error ?? "Envoi impossible.");
  }
}

function FolderEditor({
  data,
  browserUpload,
}: {
  data: FolderData;
  browserUpload: boolean;
}) {
  const { folder, photos, fallbackCount } = data;
  const maxBytes = browserUpload ? MAX_UPLOAD_BYTES : MAX_SERVER_UPLOAD_BYTES;
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [pending, setPending] = useState<Pending[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);

  // Libère les aperçus gardés en mémoire quand on quitte l'onglet.
  const pendingRef = useRef<Pending[]>([]);
  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);
  useEffect(
    () => () => {
      pendingRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    },
    [],
  );

  /** Ajoute des fichiers à la sélection (sans les envoyer). */
  function addFiles(files: FileList | File[]) {
    const chosen = Array.from(files);
    if (chosen.length === 0) return;

    const problems: string[] = [];
    const accepted: Pending[] = [];

    for (const file of chosen) {
      const problem = validateImage(file, maxBytes);
      if (problem) {
        problems.push(problem);
        continue;
      }
      accepted.push({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    setErrors(problems);
    setPending((current) => {
      // Une seule photo attendue pour l'en-tête : la nouvelle remplace l'ancienne.
      if (folder.single) {
        current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
        return accepted.slice(-1);
      }
      return [...current, ...accepted];
    });
    if (inputRef.current) inputRef.current.value = "";
  }

  function removePending(id: string) {
    setPending((current) => {
      const target = current.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((item) => item.id !== id);
    });
  }

  function clearPending() {
    setPending((current) => {
      current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return [];
    });
  }

  /** Envoi effectif, déclenché par le bouton. */
  async function sendPending() {
    if (pending.length === 0 || busy) return;
    const failures: string[] = [];

    for (const [index, item] of pending.entries()) {
      const position = `Envoi ${index + 1}/${pending.length} — ${item.file.name}`;
      setBusy(position);
      try {
        if (browserUpload) {
          await upload(
            buildPhotoPathname(folder.key, item.file.name, title),
            item.file,
            {
              access: "public",
              handleUploadUrl: "/api/admin/upload",
              contentType: item.file.type,
              // Sans limite de temps, le SDK réessaie une dizaine de fois avec
              // des délais croissants : l'interface semble figée alors que
              // l'envoi échoue en silence.
              abortSignal: AbortSignal.timeout(UPLOAD_TIMEOUT_MS),
              onUploadProgress: ({ percentage }) =>
                setBusy(`${position} — ${Math.round(percentage)} %`),
            },
          );
        } else {
          await uploadThroughServer(folder.key, item.file, title);
        }
      } catch (error) {
        failures.push(`« ${item.file.name} » : ${describeBlobError(error)}`);
      }
    }

    setBusy("Actualisation du site…");
    await refreshPhotosAction();
    router.refresh();

    setErrors(failures);
    clearPending();
    setTitle("");
    setBusy(null);
  }

  return (
    <section className="space-y-6">
      <p className="text-sm leading-relaxed text-white/50">{folder.hint}</p>

      {/* Zone d'envoi */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`rounded-3xl border-2 border-dashed p-8 text-center transition-colors ${
          dragging ? "border-brand bg-brand/10" : "border-white/15 bg-white/[0.02]"
        }`}
      >
        <p className="font-display text-lg font-semibold text-white">
          Glissez vos photos ici
        </p>
        <p className="mt-1 text-sm text-white/50">
          ou choisissez-les depuis votre appareil — {ALLOWED_IMAGE_TYPES.map((t) => t.replace("image/", "").toUpperCase()).join(", ")}, {maxBytes / 1024 / 1024} Mo max par photo
        </p>

        <div className="mx-auto mt-6 max-w-sm space-y-3 text-left">
          <label className="block text-xs font-semibold uppercase tracking-widest text-white/40">
            Titre (facultatif)
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex : Mariage Yaoundé"
              className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-normal normal-case tracking-normal text-white outline-none placeholder:text-white/30 focus:border-brand"
            />
          </label>

          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(",")}
            multiple={!folder.single}
            disabled={Boolean(busy)}
            onChange={(e) => e.target.files && addFiles(e.target.files)}
            className="block w-full text-sm text-white/60 file:mr-4 file:rounded-full file:border-0 file:bg-brand file:px-5 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-dark"
          />
        </div>

        {busy && (
          <p className="mt-5 text-sm font-medium text-brand-light">{busy}</p>
        )}
      </div>

      {/* Aperçu avant envoi */}
      {pending.length > 0 && (
        <div className="rounded-3xl border border-brand/30 bg-brand/[0.06] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-semibold text-white">
                {pending.length} photo{pending.length > 1 ? "s" : ""} à envoyer
              </h3>
              <p className="mt-1 text-sm text-white/50">
                Vérifiez l&apos;aperçu, puis validez. Rien n&apos;est publié
                tant que vous n&apos;avez pas cliqué sur « Envoyer ».
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={clearPending}
                disabled={Boolean(busy)}
                className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/70 transition-colors hover:border-white/40 hover:text-white disabled:opacity-50"
              >
                Tout annuler
              </button>
              <button
                type="button"
                onClick={() => void sendPending()}
                disabled={Boolean(busy)}
                className="rounded-full bg-brand px-7 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy
                  ? "Envoi en cours…"
                  : `Envoyer ${pending.length > 1 ? `les ${pending.length} photos` : "la photo"}`}
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {pending.map((item) => (
              <figure
                key={item.id}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-black/30"
              >
                <div className="relative aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element -- aperçu local (blob:), non optimisable */}
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePending(item.id)}
                    disabled={Boolean(busy)}
                    aria-label={`Retirer ${item.file.name}`}
                    className="absolute right-2 top-2 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                  >
                    Retirer
                  </button>
                </div>
                <figcaption className="px-3 py-2.5">
                  <span className="block truncate text-xs text-white/70">
                    {item.file.name}
                  </span>
                  <span className="text-[11px] text-white/40">
                    {(item.file.size / 1024 / 1024).toFixed(1)} Mo
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}

      {errors.length > 0 && (
        <ul className="space-y-2">
          {errors.map((message) => (
            <li
              key={message}
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            >
              {message}
            </li>
          ))}
        </ul>
      )}

      {/* Photos en place */}
      {photos.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-6 text-sm text-white/50">
          Aucune photo envoyée pour cette section.
          {fallbackCount > 0 && (
            <>
              {" "}
              Le site affiche pour l&apos;instant les {fallbackCount} image
              {fallbackCount > 1 ? "s" : ""} d&apos;origine. Dès que vous
              enverrez une photo ici, elles seront remplacées.
            </>
          )}
        </p>
      ) : (
        <div>
          <h3 className="font-display text-lg font-semibold text-white">
            {photos.length} photo{photos.length > 1 ? "s" : ""} en ligne
          </h3>
          <p className="mt-1 text-sm text-white/50">
            Ces photos sont visibles par les visiteurs. Vous pouvez en
            supprimer une à tout moment : elle disparaît du site
            immédiatement.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo) => (
              <PhotoCard key={photo.pathname} photo={photo} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Vignette + suppression                                                     */
/* -------------------------------------------------------------------------- */

function PhotoCard({ photo }: { photo: ManagedPhoto }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function remove() {
    if (!confirm(`Supprimer définitivement « ${photo.alt} » ?`)) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("pathname", photo.pathname);
      const result = await deletePhotoAction({}, formData);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <figure className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
      <div className="relative aspect-square">
        <Image
          src={photo.url}
          alt={photo.alt}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className={`object-cover transition-opacity ${
            pending ? "opacity-40" : ""
          }`}
        />
      </div>
      <figcaption className="space-y-2 px-3 py-3">
        <span className="block truncate text-sm text-white/80">{photo.alt}</span>
        <span className="block text-[11px] text-white/40">
          Ajoutée le{" "}
          {new Date(photo.uploadedAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
        {/* Bouton toujours visible : sur téléphone, le survol n'existe pas. */}
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-red-500/40 px-4 py-2 text-xs font-semibold text-red-300 transition-colors hover:border-red-500 hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <TrashIcon className="h-3.5 w-3.5" />
          {pending ? "Suppression…" : "Supprimer"}
        </button>
        {error && (
          <span className="block text-xs leading-relaxed text-red-300">
            {error}
          </span>
        )}
      </figcaption>
    </figure>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
    </svg>
  );
}
