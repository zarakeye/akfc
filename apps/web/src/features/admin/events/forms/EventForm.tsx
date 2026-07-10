"use client";

import { useState } from "react";
import type { Event, Audience } from "@prisma/client";

import { PageBuilder } from "@features/page-builder";
import { finderStorageAdapter } from "@/features/finder-adapters/cloudinary/finderStorage.adapter";
import { APP_ROOT } from "@config/app";

import { DisciplineSelect } from "@features/admin/common/components/DisciplineSelect";
import { OriginSelect } from "@features/admin/common/components/OriginSelect";
import { InstructorSelect } from "@features/admin/common/components/InstructorSelect";

import { slugify } from "@contracts/slug/slugify";
import {
  emptyPageContentV1,
  parsePageContentV1,
  type PageContentV1,
} from "@contracts/page";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Types                                                                  */
/* ─────────────────────────────────────────────────────────────────────── */

export interface EventFormInput {
  label: string;
  slug: string;
  content: PageContentV1;
  audience: Audience;
  disciplineId: number | null;
  externalDisciplineLabel: string | null;
  originId: number | null;
  organizerId: string;
  publicationDate: Date | null;
}

export interface EventFormProps {
  /** Pré-remplissage en mode édition. Absent en création. */
  initial?: Event;
  /** Appelée à la soumission. */
  onSubmit: (input: EventFormInput) => Promise<void>;
  /** Libellé du bouton de soumission. Default "Enregistrer". */
  submitLabel?: string;
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Constantes & helpers                                                   */
/* ─────────────────────────────────────────────────────────────────────── */

const AUDIENCES: { value: Audience; label: string }[] = [
  { value: "KIDS", label: "Enfants" },
  { value: "TEENAGERS", label: "Ados" },
  { value: "ADULTS", label: "Adultes" },
  { value: "ALL_AGES", label: "Tous publics" },
];

/**
 * Convertit une Date en valeur pour un `<input type="datetime-local">`
 * (format `YYYY-MM-DDTHH:mm`, en heure locale). Retourne "" si null.
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
 * Formulaire d'édition d'un `Event`. Plus simple que StageForm :
 *
 *   1. **Identité et publication** — label, slug, audience, organisateur,
 *      date de publication (vide = brouillon)
 *   2. **Rattachement** — au moins un des trois (discipline du club,
 *      label externe, origine), exactement comme Stage
 *   3. **Contenu** — un seul PageBuilder (vs les deux de Stage)
 *
 * Validations au submit :
 *   - `label` non vide
 *   - `slug` non vide (auto-rempli depuis le label, éditable)
 *   - `organizerId` non null
 *   - Au moins un de `disciplineId` / `externalDisciplineLabel` /
 *     `originId`
 *
 * Le `slug` suit le label tant que l'admin n'y a pas touché (pattern
 * `DisciplineForm`/`OriginForm`), puis devient indépendant — stable au
 * renommage. Alimente `/evenements/[slug]`.
 *
 * `publicationDate` : `null` = brouillon. Une date passée = publié,
 * une date future = publication programmée.
 *
 * Note sur l'organisateur : on réutilise `InstructorSelect`, qui ne
 * liste que les instructeurs. Si tu veux pouvoir désigner n'importe
 * quel utilisateur comme organisateur, il faudra un `UserSelect` plus
 * large — dis-le moi et je le fais.
 */
export function EventForm({
  initial,
  onSubmit,
  submitLabel = "Enregistrer",
}: EventFormProps) {
  const [label, setLabel] = useState<string>(initial?.label ?? "");
  const [slug, setSlug] = useState<string>(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState<boolean>(!!initial);
  const [audience, setAudience] = useState<Audience>(
    initial?.audience ?? "ALL_AGES",
  );
  const [disciplineId, setDisciplineId] = useState<number>(
    initial?.disciplineId ?? 0,
  );
  const [externalDisciplineLabel, setExternalDisciplineLabel] =
    useState<string>(initial?.externalDisciplineLabel ?? "");
  const [originId, setOriginId] = useState<number | null>(
    initial?.originId ?? null,
  );
  const [organizerId, setOrganizerId] = useState<string | null>(
    initial?.organizerId ?? null,
  );
  const [publicationDateValue, setPublicationDateValue] = useState<string>(
    toDatetimeLocalValue(initial?.publicationDate ?? null),
  );
  const [content, setContent] = useState<PageContentV1>(
    initial ? parsePageContentV1(initial.content) : emptyPageContentV1(),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleLabelChange = (value: string) => {
    setLabel(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlug(value);
    setSlugTouched(true);
  };

  const handleRegenerateSlug = () => {
    setSlug(slugify(label));
    setSlugTouched(false);
  };

  const handleSubmit = async () => {
    setSubmitError(null);

    if (label.trim() === "") {
      setSubmitError("Le label est obligatoire.");
      return;
    }
    if (slug.trim() === "") {
      setSubmitError("Le slug est obligatoire.");
      return;
    }
    if (organizerId === null) {
      setSubmitError("L'organisateur est obligatoire.");
      return;
    }

    const disciplineIdFinal = disciplineId === 0 ? null : disciplineId;
    const externalDisciplineLabelFinal =
      externalDisciplineLabel.trim() === ""
        ? null
        : externalDisciplineLabel.trim();
    const originIdFinal = originId;

    if (
      disciplineIdFinal === null &&
      externalDisciplineLabelFinal === null &&
      originIdFinal === null
    ) {
      setSubmitError(
        "Au moins un rattachement est requis : discipline du club, " +
          "label externe, ou origine culturelle.",
      );
      return;
    }

    const publicationDate =
      publicationDateValue === "" ? null : new Date(publicationDateValue);

    setIsSubmitting(true);
    try {
      await onSubmit({
        label: label.trim(),
        slug: slug.trim(),
        content,
        audience,
        disciplineId: disciplineIdFinal,
        externalDisciplineLabel: externalDisciplineLabelFinal,
        originId: originIdFinal,
        organizerId,
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
      {/* ── Identité et publication ─────────────────────────────────── */}
      <fieldset className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-2">
        <legend className="px-2 text-sm font-medium">
          Identité et publication
        </legend>

        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium">Label *</span>
          <input
            type="text"
            value={label}
            onChange={(e) => handleLabelChange(e.target.value)}
            placeholder="Repas de fin d'année, Conférence sur le zen…"
            className="rounded border border-input bg-background px-2 py-1"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="flex items-center justify-between font-medium">
            Slug *
            <button
              type="button"
              onClick={handleRegenerateSlug}
              className="text-xs font-normal text-muted-foreground underline hover:text-foreground"
            >
              régénérer depuis le label
            </button>
          </span>
          <input
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="repas-de-fin-d-annee"
            className="rounded border border-input bg-background px-2 py-1 font-mono text-xs"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Audience *</span>
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value as Audience)}
            className="rounded border border-input bg-background px-2 py-1"
          >
            {AUDIENCES.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Organisateur *</span>
          <InstructorSelect value={organizerId} onChange={setOrganizerId} />
        </label>

        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
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

      {/* ── Rattachement (au moins un des trois) ────────────────────── */}
      <fieldset className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-2">
        <legend className="px-2 text-sm font-medium">
          Rattachement (au moins un requis)
        </legend>

        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium">Discipline du club</span>
          <DisciplineSelect value={disciplineId} onChange={setDisciplineId} />
          <span className="text-xs text-muted-foreground">
            Laisser sur « Aucune » pour un événement non rattaché à une
            discipline (repas, conférence culturelle…).
          </span>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">
            Discipline externe (libellé libre)
          </span>
          <input
            type="text"
            value={externalDisciplineLabel}
            onChange={(e) => setExternalDisciplineLabel(e.target.value)}
            placeholder="Cérémonie du thé"
            className="rounded border border-input bg-background px-2 py-1"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Origine culturelle</span>
          <OriginSelect value={originId} onChange={setOriginId} />
        </label>
      </fieldset>

      {/* ── Contenu (PageBuilder) ───────────────────────────────────── */}
      <fieldset className="rounded-lg border border-border p-4">
        <legend className="px-2 text-sm font-medium">
          Contenu (PageBuilder)
        </legend>
        <p className="mb-3 text-xs text-muted-foreground">
          Présentation de l&apos;événement : de quoi il s&apos;agit, quand, où,
          comment participer. Format riche avec texte, images, documents.
        </p>
        <PageBuilder
          value={content}
          onChange={setContent}
          adapter={finderStorageAdapter}
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