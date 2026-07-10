"use client";

import { useState, type JSX } from "react";
import type { BreakingNews } from "@prisma/client";

/**
 * Formulaire BreakingNews (create + edit via `initial?`) — patron PostForm :
 * état contrôlé, dates en <input type="datetime-local">.
 *
 * NOTE : `toDatetimeLocalValue` est dupliqué de PostForm/EventForm — le
 * chantier « PublicationDateField partagé » (pending du handoff) absorbera
 * les trois occurrences.
 */

export interface BreakingNewsFormInput {
  title: string;
  body: string;
  href: string | null;
  publicationDate: Date | null;
  expiresAt: Date | null;
}

interface BreakingNewsFormProps {
  initial?: BreakingNews;
  onSubmit: (input: BreakingNewsFormInput) => Promise<void>;
  submitLabel?: string;
}

/** Date → valeur `datetime-local` (YYYY-MM-DDTHH:mm, heure locale). "" si null. */
function toDatetimeLocalValue(date: Date | null): string {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

export function BreakingNewsForm({
  initial,
  onSubmit,
  submitLabel = "Enregistrer",
}: BreakingNewsFormProps): JSX.Element {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [href, setHref] = useState(initial?.href ?? "");
  const [publicationDateValue, setPublicationDateValue] = useState(
    toDatetimeLocalValue(initial?.publicationDate ?? null),
  );
  const [expiresAtValue, setExpiresAtValue] = useState(
    toDatetimeLocalValue(initial?.expiresAt ?? null),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (title.trim() === "" || body.trim() === "") {
      setError("Le titre et le corps sont obligatoires.");
      return;
    }
    const publicationDate =
      publicationDateValue === "" ? null : new Date(publicationDateValue);
    const expiresAt = expiresAtValue === "" ? null : new Date(expiresAtValue);
    if (publicationDate && expiresAt && expiresAt <= publicationDate) {
      setError("L'expiration doit être postérieure à la publication.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        body: body.trim(),
        href: href.trim() === "" ? null : href.trim(),
        publicationDate,
        expiresAt,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Titre</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={150}
          placeholder="Fermeture exceptionnelle, Résultats du vote…"
          className="rounded border border-input bg-background px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Corps</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={600}
          rows={4}
          placeholder="Texte court de l'actualité (600 caractères max)."
          className="rounded border border-input bg-background px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Lien (optionnel)</span>
        <input
          type="text"
          value={href}
          onChange={(e) => setHref(e.target.value)}
          placeholder="/#post-12 (interne) ou https://… (externe)"
          className="rounded border border-input bg-background px-2 py-1"
        />
        <span className="text-xs text-muted-foreground">
          CTA de la fiche dans la sidebar — vers un post du mur, une page du
          site ou un lien externe.
        </span>
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
          Laisser vide = brouillon (non visible publiquement). Une date future
          programme la publication.
        </span>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Date d&apos;expiration</span>
        <input
          type="datetime-local"
          value={expiresAtValue}
          onChange={(e) => setExpiresAtValue(e.target.value)}
          className="rounded border border-input bg-background px-2 py-1"
        />
        <span className="text-xs text-muted-foreground">
          Passée cette date, l&apos;actualité disparaît du ruban et de la
          sidebar. Laisser vide = sans expiration.
        </span>
      </label>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {submitting ? "Enregistrement…" : submitLabel}
        </button>
      </div>
    </div>
  );
}
