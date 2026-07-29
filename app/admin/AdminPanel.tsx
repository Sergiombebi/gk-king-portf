"use client";

import { upload } from "@vercel/blob/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { SpinnerIcon } from "@/app/components/icons";
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
import { deletePhotoAction, refreshPhotosAction } from "./actions";

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
/*  Contenu d'un onglet                                                        */
/* -------------------------------------------------------------------------- */

/** Photo choisie mais pas encore envoyée. */
type Pending = { id: string; file: File; previewUrl: string };

/** État de la publication en cours, affiché par le voile d'attente. */
type Progress = {
  /** `upload` : une photo part vers le stockage. `refresh` : mise à jour du site. */
  step: "upload" | "refresh";
  /** Nom du fichier en cours, ou libellé de l'étape finale. */
  label: string;
  /** Rang de la photo en cours, à partir de 1. */
  index: number;
  total: number;
  /** Avancement de la photo en cours, `null` quand il n'est pas mesurable. */
  percent: number | null;
};

/** Avancement global, en pourcentage, toutes photos confondues. */
function overallPercent({ index, total, percent }: Progress) {
  // Sans mesure (envoi par le serveur), on place le curseur au milieu de la
  // photo en cours plutôt que de laisser la barre figée.
  const withinCurrent = (percent ?? 50) / 100;
  return Math.round(((index - 1 + withinCurrent) / total) * 100);
}

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
  const [progress, setProgress] = useState<Progress | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const busy = progress !== null;

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
    const total = pending.length;
    const failures: string[] = [];

    for (const [index, item] of pending.entries()) {
      setProgress({
        step: "upload",
        label: item.file.name,
        index: index + 1,
        total,
        // L'envoi par le serveur ne remonte pas d'avancement.
        percent: browserUpload ? 0 : null,
      });
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
                setProgress((current) =>
                  current
                    ? { ...current, percent: Math.round(percentage) }
                    : current,
                ),
            },
          );
        } else {
          await uploadThroughServer(folder.key, item.file, title);
        }
      } catch (error) {
        failures.push(`« ${item.file.name} » : ${describeBlobError(error)}`);
      }
    }

    setProgress({
      step: "refresh",
      label: "Mise à jour du site…",
      index: total,
      total,
      percent: 100,
    });
    await refreshPhotosAction();
    router.refresh();

    setErrors(failures);
    clearPending();
    setTitle("");
    setProgress(null);
  }

  return (
    <section className="space-y-6">
      {progress && <PublishOverlay progress={progress} />}

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
            disabled={busy}
            onChange={(e) => e.target.files && addFiles(e.target.files)}
            className="block w-full text-sm text-white/60 file:mr-4 file:rounded-full file:border-0 file:bg-brand file:px-5 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
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
                disabled={busy}
                className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/70 transition-colors hover:border-white/40 hover:text-white disabled:opacity-50"
              >
                Tout annuler
              </button>
              <button
                type="button"
                onClick={() => void sendPending()}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-full bg-brand px-7 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy && <SpinnerIcon className="h-4 w-4 animate-spin" />}
                {busy
                  ? "Publication en cours…"
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
                    disabled={busy}
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
/*  Voile d'attente pendant la publication                                     */
/* -------------------------------------------------------------------------- */

/**
 * Recouvre la page tant que les photos partent : l'envoi peut durer plusieurs
 * dizaines de secondes, et rien ne doit être modifié entre-temps.
 */
function PublishOverlay({ progress }: { progress: Progress }) {
  const done = overallPercent(progress);

  return (
    <div
      role="status"
      aria-live="polite"
      className="animate-fade-in fixed inset-0 z-[100] flex items-center justify-center bg-ink/90 px-5 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
        <SpinnerIcon className="mx-auto h-10 w-10 animate-spin text-brand" />

        <h3 className="font-display mt-5 text-lg font-semibold text-white">
          Publication en cours…
        </h3>

        <p className="mt-2 truncate text-sm text-white/60" title={progress.label}>
          {progress.label}
        </p>

        {progress.step === "upload" && progress.total > 1 && (
          <p className="mt-1 text-xs text-white/40">
            Photo {progress.index} sur {progress.total}
          </p>
        )}

        <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-brand transition-[width] duration-300 ease-out"
            style={{ width: `${done}%` }}
          />
        </div>
        <p className="mt-2 text-xs font-semibold text-brand-light">{done} %</p>

        <p className="mt-5 text-xs leading-relaxed text-white/40">
          Ne fermez pas cette page tant que l&apos;envoi n&apos;est pas terminé.
        </p>
      </div>
    </div>
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
          {pending ? (
            <SpinnerIcon className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <TrashIcon className="h-3.5 w-3.5" />
          )}
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
