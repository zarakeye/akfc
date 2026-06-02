"use client";

import { useState } from "react";
import type { Post } from "@prisma/client";

import { PageBuilder } from "@features/page-builder";
import { cloudinaryAdapter } from "@features/finder-adapters/cloudinary/cloudinary.adapter";
import { APP_ROOT } from "@config/app";

import {
  emptyPageContentV1,
  parsePageContentV1,
  type PageContentV1,
} from "@contracts/page";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Types                                                                  */
/* ─────────────────────────────────────────────────────────────────────── */

export interface PostFormInput {
  title: string;
  content: PageContentV1;
  publicationDate: Date | null;
}

export interface PostFormProps {
  /** Pré-remplissage en mode édition. Absent en création. */
  initial?: Post;
  /** Appelée à la soumission. */
  onSubmit: (input: PostFormInput) => Promise<void>;
  /** Libellé du bouton de soumission. Default "Enregistrer". */
  submitLabel?: string;
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Helpers                                                                */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Convertit une Date en valeur pour `<input type="datetime-local">`
 * (format `YYYY-MM-DDTHH:mm`, heure locale). "" si null.
 */
function toDatetimeLocalValue(date: Date | null): string {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Composant                                                              */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Formulaire d'un `Post` (article / actualité). Volontairement minimal,
 * calqué sur EventForm sans le rattachement ni l'organisateur :
 *
 *   1. **Titre et publication** — titre + date de publication
 *      (vide = brouillon)
 *   2. **Contenu** — un PageBuilder
 *
 * L'auteur n'apparaît pas : il est fixé à l'utilisateur courant côté
 * router au create. `publicationDate` suit la même sémantique que
 * partout (null = brouillon, passée = publié, future = programmé).
 */
export function PostForm({
  initial,
  onSubmit,
  submitLabel = "Enregistrer",
}: PostFormProps) {
  const [title, setTitle] = useState<string>(initial?.title ?? "");
  const [publicationDateValue, setPublicationDateValue] = useState<string>(
    toDatetimeLocalValue(initial?.publicationDate ?? null),
  );
  const [content, setContent] = useState<PageContentV1>(
    initial ? parsePageContentV1(initial.content) : emptyPageContentV1(),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitError(null);

    if (title.trim() === "") {
      setSubmitError("Le titre est obligatoire.");
      return;
    }

    const publicationDate =
      publicationDateValue === "" ? null : new Date(publicationDateValue);

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        content,
        publicationDate,
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Titre et publication ────────────────────────────────────── */}
      <fieldset className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4">
        <legend className="px-2 text-sm font-medium">
          Titre et publication
        </legend>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Titre *</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Reprise des cours, Résultats de la compétition…"
            className="rounded border border-input bg-background px-2 py-1"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Date de publication</span>
          <input
            type="datetime-local"
            value={publicationDateValue}
            onChange={(e) => setPublicationDateValue(e.target.value)}
            className="rounded border border-input bg-background px-2 py-1"
          />
          <span className="text-xs text-muted-foreground">
            Laisser vide = brouillon (non visible publiquement). Une date
            future programme la publication.
          </span>
        </label>
      </fieldset>

      {/* ── Contenu (PageBuilder) ───────────────────────────────────── */}
      <fieldset className="rounded-lg border border-border p-4">
        <legend className="px-2 text-sm font-medium">
          Contenu (PageBuilder)
        </legend>
        <p className="mb-3 text-xs text-muted-foreground">
          Le corps de l&apos;article : texte, images, documents. Format riche.
        </p>
        <PageBuilder
          value={content}
          onChange={setContent}
          adapter={cloudinaryAdapter}
          appRoot={APP_ROOT}
        />
      </fieldset>

      {/* ── Action ──────────────────────────────────────────────────── */}
      {submitError && (
        <pre className="whitespace-pre-wrap rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {submitError}
        </pre>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? "Enregistrement…" : submitLabel}
        </button>
      </div>
    </div>
  );
}