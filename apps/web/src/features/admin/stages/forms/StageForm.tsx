"use client";

import { useState } from "react";
import type { Stage, Audience } from "@prisma/client";

import { PageBuilder } from "@features/page-builder";
import { cloudinaryAdapter } from "@features/finder-adapters/cloudinary/cloudinary.adapter";
import { APP_ROOT } from "@config/app";

import { DisciplineSelect } from "@features/admin/common/components/DisciplineSelect";
import { OriginSelect } from "@features/admin/common/components/OriginSelect";
import { InstructorSelect } from "@features/admin/common/components/InstructorSelect";
import { AnimatorsMultiSelect } from "@features/admin/common/components/AnimatorsMultiSelect";

import {
  emptyPageContentV1,
  parsePageContentV1,
  type PageContentV1,
} from "@contracts/page";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Types                                                                  */
/* ─────────────────────────────────────────────────────────────────────── */

export interface StageFormInput {
  label: string;
  audience: Audience;
  disciplineId: number | null;
  externalDisciplineLabel: string | null;
  originId: number | null;
  description: PageContentV1;
  program: PageContentV1;
  preRegistered: string[];
  primaryAnimatorId: string;
  coAnimatorIds: string[];
}

export interface StageFormProps {
  /** Pré-remplissage en mode édition. Absent en création. */
  initial?: Stage & { animators?: { id: string }[] };
  /** Appelée à la soumission. */
  onSubmit: (input: StageFormInput) => Promise<void>;
  /** Libellé du bouton de soumission. Default "Enregistrer". */
  submitLabel?: string;
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Constantes                                                             */
/* ─────────────────────────────────────────────────────────────────────── */

const AUDIENCES: { value: Audience; label: string }[] = [
  { value: "KIDS", label: "Enfants" },
  { value: "TEENAGERS", label: "Ados" },
  { value: "ADULTS", label: "Adultes" },
  { value: "ALL_AGES", label: "Tous publics" },
];

/* ─────────────────────────────────────────────────────────────────────── */
/*  Composant                                                              */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Formulaire d'édition d'un `Stage`. Six sections :
 *
 *   1. **Identité** — label, audience, animateur principal
 *   2. **Rattachement** — au moins un des trois : discipline du club,
 *      label externe, origine culturelle
 *   3. **Co-animateurs** — multi-sélection (filtre primaryAnimatorId)
 *   4. **Description** — PageBuilder #1 (ce qu'est le stage)
 *   5. **Programme** — PageBuilder #2 (ce qui s'y passe)
 *   6. **Prérequis** — liste libre, un par ligne dans le textarea
 *
 * Validations au submit :
 *   - `label` non vide
 *   - `primaryAnimatorId` non null
 *   - Au moins un de `disciplineId` / `externalDisciplineLabel` /
 *     `originId` non vide
 *
 * Le label est `@@unique([disciplineId, label])` côté schéma quand
 * disciplineId est non-null — la collision remonte du router en
 * CONFLICT.
 *
 * Les `StageSession[]` (séances datées) sont **gérées séparément** —
 * pas dans ce form. Voir la page d'édition qui les affiche et qui
 * exposera leur UI dédiée dans une livraison suivante.
 */
export function StageForm({
  initial,
  onSubmit,
  submitLabel = "Enregistrer",
}: StageFormProps) {
  const [label, setLabel] = useState<string>(initial?.label ?? "");
  const [audience, setAudience] = useState<Audience>(
    initial?.audience ?? "ADULTS",
  );
  const [disciplineId, setDisciplineId] = useState<number>(
    initial?.disciplineId ?? 0,
  );
  const [externalDisciplineLabel, setExternalDisciplineLabel] =
    useState<string>(initial?.externalDisciplineLabel ?? "");
  const [originId, setOriginId] = useState<number | null>(
    initial?.originId ?? null,
  );
  const [primaryAnimatorId, setPrimaryAnimatorId] = useState<string | null>(
    initial?.primaryAnimatorId ?? null,
  );
  const [coAnimatorIds, setCoAnimatorIds] = useState<string[]>(
    // En mode édition, on lit la relation `animators[]` et on retire
    // le primaryAnimatorId pour reconstituer la liste des co-animateurs
    // pure (côté backend, primary est inclus dans animators).
    initial?.animators
      ?.map((a) => a.id)
      .filter((id) => id !== initial?.primaryAnimatorId) ?? [],
  );
  const [description, setDescription] = useState<PageContentV1>(
    initial ? parsePageContentV1(initial.description) : emptyPageContentV1(),
  );
  const [program, setProgram] = useState<PageContentV1>(
    initial ? parsePageContentV1(initial.program) : emptyPageContentV1(),
  );
  const [preRegisteredText, setPreRegisteredText] = useState<string>(
    (initial?.preRegistered ?? []).join("\n"),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitError(null);

    if (label.trim() === "") {
      setSubmitError("Le label est obligatoire.");
      return;
    }
    if (primaryAnimatorId === null) {
      setSubmitError("L'animateur principal est obligatoire.");
      return;
    }

    // Validation "au moins un des trois"
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

    // Conversion textarea → string[]
    const preRegistered = preRegisteredText
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s !== "");

    setIsSubmitting(true);
    try {
      await onSubmit({
        label: label.trim(),
        audience,
        disciplineId: disciplineIdFinal,
        externalDisciplineLabel: externalDisciplineLabelFinal,
        originId: originIdFinal,
        description,
        program,
        preRegistered,
        primaryAnimatorId,
        coAnimatorIds,
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
      <fieldset className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-3">
        <legend className="px-2 text-sm font-medium">Identité</legend>

        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium">Label *</span>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Stage Sensei Tanaka 2026"
            className="rounded border border-input bg-background px-2 py-1"
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

        <label className="flex flex-col gap-1 text-sm sm:col-span-3">
          <span className="font-medium">Animateur principal *</span>
          <InstructorSelect
            value={primaryAnimatorId}
            onChange={setPrimaryAnimatorId}
          />
        </label>
      </fieldset>

      {/* ── Rattachement (au moins un des trois) ────────────────────── */}
      <fieldset className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-2">
        <legend className="px-2 text-sm font-medium">
          Rattachement (au moins un requis)
        </legend>

        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium">Discipline du club</span>
          <DisciplineSelect
            value={disciplineId}
            onChange={setDisciplineId}
          />
          <span className="text-xs text-muted-foreground">
            Laisser sur « Aucune » pour un stage non rattaché à une
            discipline du club (intervenant externe, discipline non
            enseignée…).
          </span>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Discipline externe (libellé libre)</span>
          <input
            type="text"
            value={externalDisciplineLabel}
            onChange={(e) => setExternalDisciplineLabel(e.target.value)}
            placeholder="Calligraphie chinoise"
            className="rounded border border-input bg-background px-2 py-1"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Origine culturelle</span>
          <OriginSelect value={originId} onChange={setOriginId} />
        </label>
      </fieldset>

      {/* ── Co-animateurs ──────────────────────────────────────────── */}
      <fieldset className="flex flex-col gap-2 rounded-lg border border-border p-4">
        <legend className="px-2 text-sm font-medium">Co-animateurs</legend>
        <p className="text-xs text-muted-foreground">
          Sélection des animateurs secondaires qui interviennent sur le
          stage. L&apos;animateur principal est automatiquement inclus côté
          backend — pas besoin de le cocher ici.
        </p>
        <AnimatorsMultiSelect
          value={coAnimatorIds}
          onChange={setCoAnimatorIds}
          excludeId={primaryAnimatorId}
        />
      </fieldset>

      {/* ── Description (PageBuilder) ───────────────────────────────── */}
      <fieldset className="rounded-lg border border-border p-4">
        <legend className="px-2 text-sm font-medium">
          Description (PageBuilder)
        </legend>
        <p className="mb-3 text-xs text-muted-foreground">
          Ce qu&apos;est ce stage : présentation, intervenants, contexte,
          public visé, prérequis. Format riche avec texte, images,
          documents.
        </p>
        <PageBuilder
          value={description}
          onChange={setDescription}
          adapter={cloudinaryAdapter}
          appRoot={APP_ROOT}
        />
      </fieldset>

      {/* ── Programme (PageBuilder) ─────────────────────────────────── */}
      <fieldset className="rounded-lg border border-border p-4">
        <legend className="px-2 text-sm font-medium">
          Programme (PageBuilder)
        </legend>
        <p className="mb-3 text-xs text-muted-foreground">
          Ce qui s&apos;y passera concrètement : déroulé des sessions,
          techniques abordées, matériel requis, etc.
        </p>
        <PageBuilder
          value={program}
          onChange={setProgram}
          adapter={cloudinaryAdapter}
          appRoot={APP_ROOT}
        />
      </fieldset>

      {/* ── Prérequis ───────────────────────────────────────────────── */}
      <fieldset className="rounded-lg border border-border p-4">
        <legend className="px-2 text-sm font-medium">Prérequis</legend>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs text-muted-foreground">
            Un prérequis par ligne. Lignes vides ignorées.
          </span>
          <textarea
            rows={4}
            value={preRegisteredText}
            onChange={(e) => setPreRegisteredText(e.target.value)}
            placeholder={"Ceinture jaune minimum\nÂge ≥ 14 ans\nKeikogi obligatoire"}
            className="rounded border border-input bg-background px-2 py-1 font-mono text-sm"
          />
        </label>
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