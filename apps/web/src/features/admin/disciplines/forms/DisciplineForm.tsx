"use client";

import { useState } from "react";
import type { Discipline, DisciplineType } from "@prisma/client";

import { PageBuilder } from "@features/page-builder";
import { finderStorageAdapter } from "@/features/finder-adapters/cloudinary/finderStorage.adapter";
import { APP_ROOT } from "@config/app";

import { CategorySelect } from "@features/admin/common/components/CategorySelect";
import { OriginSelect } from "@features/admin/common/components/OriginSelect";
import { FamilySelect } from "@/features/admin/common/components/FamilySelect";
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

/**
 * Palette du builder de présentation synthétique : le seul bloc « texte
 * enrobant une image ».
 *
 * La restriction est ce qui garantit que toutes les cartes d'accueil se
 * ressemblent. Un builder complet y autoriserait galeries et colonnes, et la
 * page d'accueil deviendrait un patchwork qu'aucune règle de style ne
 * rattraperait.
 *
 * Le bloc dégénère proprement en texte simple quand aucune image n'est
 * choisie, donc une présentation sans photo reste possible.
 */
const SUMMARY_BLOCKS = ["float-text"] as const;

export interface DisciplineFormInput {
  name: string;
  slug: string;
  type: DisciplineType;
  familyId: number | null;
  school: string | null;
  classification: string | null;
  originId: number | null;
  description: PageContentV1;
  /**
   * Présentation synthétique pour la page d'accueil. Composite VIDE = la
   * discipline ne figure pas sur l'accueil.
   */
  summary: PageContentV1;
  categoryId: number;
  instructorId: string;
}

export interface DisciplineFormProps {
  /** Pré-remplissage en mode édition. Absent en création. */
  initial?: Discipline;
  /** Appelée à la soumission. */
  onSubmit: (input: DisciplineFormInput) => Promise<void>;
  /** Libellé du bouton de soumission. Default "Enregistrer". */
  submitLabel?: string;
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Constantes                                                             */
/* ─────────────────────────────────────────────────────────────────────── */

const DISCIPLINE_TYPES: { value: DisciplineType; label: string }[] = [
  { value: "MARTIAL_ART", label: "Art martial" },
  { value: "CALLIGRAPHY", label: "Calligraphie" },
];

/* ─────────────────────────────────────────────────────────────────────── */
/*  Composant                                                              */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Formulaire d'édition d'une `Discipline`. Trois sections :
 *
 *   1. **Identité** — name, slug, type, catégorie, instructeur principal
 *   2. **Origine et classification** — origine culturelle (Origin) et
 *      famille (DisciplineFamily, via sélecteur), plus school / classification
 *   3. **Description** — composite Json édité au PageBuilder
 *
 * Validations au submit :
 *   - `name` non vide
 *   - `slug` non vide (auto-rempli depuis le nom, éditable)
 *   - `categoryId !== 0` (forcé par le placeholder du CategorySelect)
 *   - `instructorId !== null` (Discipline.instructorId est NOT NULL)
 *
 * Le `slug` suit le nom tant que l'admin n'y a pas touché (pattern
 * `OriginForm`), puis devient indépendant — il reste **stable au
 * renommage** une fois figé. Le `familyId` remplace l'ancien champ texte
 * libre `family` : on choisit une `DisciplineFamily` existante (ou aucune).
 *
 * Le `categoryId` est immutable côté router ; en mode édition le select
 * est remplacé par un champ désactivé.
 */
export function DisciplineForm({
  initial,
  onSubmit,
  submitLabel = "Enregistrer",
}: DisciplineFormProps) {
  const [name, setName] = useState<string>(initial?.name ?? "");
  const [slug, setSlug] = useState<string>(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState<boolean>(!!initial);
  const [type, setType] = useState<DisciplineType>(
    initial?.type ?? "MARTIAL_ART",
  );
  const [familyId, setFamilyId] = useState<number | null>(
    initial?.familyId ?? null,
  );
  const [school, setSchool] = useState<string>(initial?.school ?? "");
  const [classification, setClassification] = useState<string>(
    initial?.classification ?? "",
  );
  const [originId, setOriginId] = useState<number | null>(
    initial?.originId ?? null,
  );
  const [categoryId, setCategoryId] = useState<number>(
    initial?.categoryId ?? 0,
  );
  const [instructorId, setInstructorId] = useState<string | null>(
    initial?.instructorId ?? null,
  );
  const [description, setDescription] = useState<PageContentV1>(
    initial ? parsePageContentV1(initial.description) : emptyPageContentV1(),
  );
  const [summary, setSummary] = useState<PageContentV1>(
    initial ? parsePageContentV1(initial.summary) : emptyPageContentV1(),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isEditMode = !!initial;

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
    if (categoryId === 0) {
      setSubmitError("Veuillez sélectionner une catégorie.");
      return;
    }
    if (instructorId === null) {
      setSubmitError(
        "L'instructeur principal est obligatoire. Sélectionne quelqu'un.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        slug: slug.trim(),
        type,
        familyId,
        school: school.trim() === "" ? null : school.trim(),
        classification:
          classification.trim() === "" ? null : classification.trim(),
        originId,
        description,
        summary,
        categoryId,
        instructorId,
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Identité ─────────────────────────────────────────────────── */}
      <fieldset className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-2">
        <legend className="px-2 text-sm font-medium">Identité</legend>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Nom *</span>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Karaté Shotokan"
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
            placeholder="karate-shotokan"
            className="rounded border border-input bg-background px-2 py-1 font-mono text-xs"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Type *</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as DisciplineType)}
            className="rounded border border-input bg-background px-2 py-1"
          >
            {DISCIPLINE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">
            Catégorie *
            {isEditMode && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                (non modifiable)
              </span>
            )}
          </span>
          {isEditMode ? (
            <input
              type="text"
              value={`Catégorie #${categoryId}`}
              disabled
              className="cursor-not-allowed rounded border border-input bg-muted px-2 py-1 text-muted-foreground"
            />
          ) : (
            <CategorySelect value={categoryId} onChange={setCategoryId} />
          )}
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Instructeur principal *</span>
          <InstructorSelect value={instructorId} onChange={setInstructorId} />
        </label>
      </fieldset>

      {/* ── Origine et classification ───────────────────────────────── */}
      <fieldset className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-2">
        <legend className="px-2 text-sm font-medium">
          Origine et classification
        </legend>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Origine culturelle</span>
          <OriginSelect value={originId} onChange={setOriginId} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Famille</span>
          <FamilySelect value={familyId} onChange={setFamilyId} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">École</span>
          <input
            type="text"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            placeholder="Shōtōkan, Aikikai…"
            className="rounded border border-input bg-background px-2 py-1"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Classification</span>
          <input
            type="text"
            value={classification}
            onChange={(e) => setClassification(e.target.value)}
            placeholder="Sport olympique, art martial traditionnel…"
            className="rounded border border-input bg-background px-2 py-1"
          />
        </label>
      </fieldset>

      {/* ── Description (PageBuilder) ───────────────────────────────── */}
      <fieldset className="rounded-lg border border-border p-4">
        <legend className="px-2 text-sm font-medium">
          Description (PageBuilder)
        </legend>
        <PageBuilder
          value={description}
          onChange={setDescription}
          adapter={finderStorageAdapter}
          appRoot={APP_ROOT}
        />
      </fieldset>

      {/* ── Présentation synthétique (builder restreint) ─────────────── */}
      <fieldset className="rounded-lg border border-border p-4">
        <legend className="px-2 text-sm font-medium">
          Présentation synthétique (page d&apos;accueil)
        </legend>
        <p className="mb-3 text-xs text-muted-foreground">
          Quelques lignes autour d&apos;une image, affichées en carte sur la
          page d&apos;accueil avec un lien vers la page complète ci-dessus.
          Laissez vide pour que cette discipline ne figure pas sur
          l&apos;accueil.
        </p>
        <PageBuilder
          value={summary}
          onChange={setSummary}
          adapter={finderStorageAdapter}
          appRoot={APP_ROOT}
          allowedBlocks={SUMMARY_BLOCKS}
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