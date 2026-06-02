"use client";

import { useState } from "react";
import type { Origin } from "@prisma/client";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Types                                                                  */
/* ─────────────────────────────────────────────────────────────────────── */

export interface OriginFormInput {
  name: string;
  slug: string;
  description: string | null;
  country: string | null;
  region: string | null;
  flag: string | null;
  historicalPeriod: string | null;
  sortOrder: number;
}

export interface OriginFormProps {
  /** Pré-remplissage en mode édition. Absent en création. */
  initial?: Origin;
  /** Appelée à la soumission. */
  onSubmit: (input: OriginFormInput) => Promise<void>;
  /** Libellé du bouton de soumission. Default "Enregistrer". */
  submitLabel?: string;
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Helpers                                                                */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Slugify : transforme un texte libre en slug URL-safe conforme au
 * pattern attendu par le router origin (`^[a-z0-9]+(?:-[a-z0-9]+)*$`).
 *
 *   slugify("Japon")              // "japon"
 *   slugify("République Tchèque") // "republique-tcheque"
 *   slugify("  Hong Kong  ")      // "hong-kong"
 */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80);
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Composant                                                              */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Formulaire d'édition d'un `Origin`. Champs textuels simples — pas
 * de PageBuilder pour la v1 (la description reste un texte simple).
 *
 * Auto-génération intelligente du slug : tant que l'utilisateur n'a pas
 * touché manuellement au champ slug, il est synchronisé avec le name
 * (via `slugify`). Dès qu'il édite le slug à la main, le lien est
 * rompu et le slug devient indépendant.
 *
 * En mode édition, le slug est considéré comme « déjà touché » (puisqu'il
 * a une valeur explicite qui peut diverger du name), donc le name peut
 * changer sans toucher au slug.
 */
export function OriginForm({
  initial,
  onSubmit,
  submitLabel = "Enregistrer",
}: OriginFormProps) {
  const [name, setName] = useState<string>(initial?.name ?? "");
  const [slug, setSlug] = useState<string>(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState<boolean>(!!initial);
  const [description, setDescription] = useState<string>(
    initial?.description ?? "",
  );
  const [country, setCountry] = useState<string>(initial?.country ?? "");
  const [region, setRegion] = useState<string>(initial?.region ?? "");
  const [flag, setFlag] = useState<string>(initial?.flag ?? "");
  const [historicalPeriod, setHistoricalPeriod] = useState<string>(
    initial?.historicalPeriod ?? "",
  );
  const [sortOrder, setSortOrder] = useState<number>(initial?.sortOrder ?? 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlug(value);
    setSlugTouched(true);
  };

  const handleRegenerateSlug = () => {
    setSlug(slugify(name));
    setSlugTouched(false);
  };

  const handleSubmit = async () => {
    setSubmitError(null);

    if (name.trim() === "") {
      setSubmitError("Le nom est obligatoire.");
      return;
    }
    if (slug.trim() === "") {
      setSubmitError("Le slug est obligatoire.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() === "" ? null : description.trim(),
        country: country.trim() === "" ? null : country.trim(),
        region: region.trim() === "" ? null : region.trim(),
        flag: flag.trim() === "" ? null : flag.trim(),
        historicalPeriod:
          historicalPeriod.trim() === "" ? null : historicalPeriod.trim(),
        sortOrder,
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-2">
        <legend className="px-2 text-sm font-medium">Identité</legend>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Nom *</span>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Japon, Okinawa, Chine…"
            className="rounded border border-input bg-background px-2 py-1"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="flex items-center justify-between font-medium">
            Slug *
            <button
              type="button"
              onClick={handleRegenerateSlug}
              className="text-xs font-normal text-muted-foreground underline hover:text-foreground"
            >
              régénérer depuis le nom
            </button>
          </span>
          <input
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="japon"
            className="rounded border border-input bg-background px-2 py-1 font-mono text-xs"
          />
        </label>

        <label className="col-span-full flex flex-col gap-1 text-sm">
          <span className="font-medium">Description</span>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Présentation culturelle libre, jusqu'à 2000 caractères."
            className="rounded border border-input bg-background px-2 py-1"
          />
        </label>
      </fieldset>

      <fieldset className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-2 lg:grid-cols-3">
        <legend className="px-2 text-sm font-medium">Métadonnées culturelles</legend>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Pays moderne</span>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Japon"
            className="rounded border border-input bg-background px-2 py-1"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Région</span>
          <input
            type="text"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="Okinawa, Shandong…"
            className="rounded border border-input bg-background px-2 py-1"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Drapeau</span>
          <input
            type="text"
            value={flag}
            onChange={(e) => setFlag(e.target.value)}
            placeholder="🇯🇵 ou JP"
            className="rounded border border-input bg-background px-2 py-1"
          />
        </label>

        <label className="col-span-full flex flex-col gap-1 text-sm sm:col-span-1 lg:col-span-2">
          <span className="font-medium">Période historique</span>
          <input
            type="text"
            value={historicalPeriod}
            onChange={(e) => setHistoricalPeriod(e.target.value)}
            placeholder="Période Edo, Dynastie Tang…"
            className="rounded border border-input bg-background px-2 py-1"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Ordre d&apos;affichage</span>
          <input
            type="number"
            min={0}
            value={sortOrder}
            onChange={(e) => setSortOrder(Math.max(0, Number(e.target.value)))}
            className="rounded border border-input bg-background px-2 py-1"
          />
        </label>
      </fieldset>

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