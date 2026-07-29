"use client";

import { upload } from "@vercel/blob/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import type { GALLERY_FOLDERS, GalleryFolderKey } from "@/lib/gallery-config";
import type { ManagedPhoto } from "@/lib/photos";
import {
  ALLOWED_IMAGE_TYPES,
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
}: {
  data: FolderData[];
  storageReady: boolean;
}) {
  const [active, setActive] = useState<GalleryFolderKey>(data[0].folder.key);
  const current = data.find((d) => d.folder.key === active)!;

  return (
    <div className="space-y-8">
      {!storageReady && (
        <p className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-200">
          Le stockage des photos n&apos;est pas encore configuré (variable{" "}
          <code>BLOB_READ_WRITE_TOKEN</code>). Vous pouvez parcourir
          l&apos;interface, mais les envois et suppressions échoueront.
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

      <FolderEditor key={current.folder.key} data={current} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Contenu d'un onglet                                                        */
/* -------------------------------------------------------------------------- */

function FolderEditor({ data }: { data: FolderData }) {
  const { folder, photos, fallbackCount } = data;
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);

  async function sendFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;

    const problems = list
      .map((file) => validateImage(file))
      .filter((message): message is string => Boolean(message));
    setErrors(problems);

    const valid = list.filter((file) => !validateImage(file));
    for (const [index, file] of valid.entries()) {
      setBusy(`Envoi ${index + 1}/${valid.length} — ${file.name}`);
      try {
        await upload(buildPhotoPathname(folder.key, file.name, title), file, {
          access: "public",
          handleUploadUrl: "/api/admin/upload",
          contentType: file.type,
        });
      } catch (error) {
        setErrors((prev) => [
          ...prev,
          `« ${file.name} » : ${
            error instanceof Error ? error.message : "envoi impossible"
          }`,
        ]);
      }
    }

    setBusy("Actualisation du site…");
    await refreshPhotosAction();
    router.refresh();
    setBusy(null);
    setTitle("");
    if (inputRef.current) inputRef.current.value = "";
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
          void sendFiles(e.dataTransfer.files);
        }}
        className={`rounded-3xl border-2 border-dashed p-8 text-center transition-colors ${
          dragging ? "border-brand bg-brand/10" : "border-white/15 bg-white/[0.02]"
        }`}
      >
        <p className="font-display text-lg font-semibold text-white">
          Glissez vos photos ici
        </p>
        <p className="mt-1 text-sm text-white/50">
          ou choisissez-les depuis votre appareil — {ALLOWED_IMAGE_TYPES.map((t) => t.replace("image/", "").toUpperCase()).join(", ")}, {MAX_UPLOAD_BYTES / 1024 / 1024} Mo max par photo
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
            onChange={(e) => e.target.files && void sendFiles(e.target.files)}
            className="block w-full text-sm text-white/60 file:mr-4 file:rounded-full file:border-0 file:bg-brand file:px-5 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-dark"
          />
        </div>

        {busy && (
          <p className="mt-5 text-sm font-medium text-brand-light">{busy}</p>
        )}
      </div>

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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <PhotoCard key={photo.pathname} photo={photo} />
          ))}
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
    <figure className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
      <div className="relative aspect-square">
        <Image
          src={photo.url}
          alt={photo.alt}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-cover"
        />
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          className="absolute right-2 top-2 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white opacity-0 transition-opacity hover:bg-red-600 focus:opacity-100 group-hover:opacity-100 disabled:opacity-60"
        >
          {pending ? "…" : "Supprimer"}
        </button>
      </div>
      <figcaption className="px-3 py-2.5">
        <span className="block truncate text-sm text-white/80">{photo.alt}</span>
        {error && <span className="text-xs text-red-300">{error}</span>}
      </figcaption>
    </figure>
  );
}
