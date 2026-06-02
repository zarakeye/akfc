"use client";

import { useState } from "react";
import type { Audience, Course, Day } from "@prisma/client";

import { PageBuilder } from "@features/page-builder";
import { cloudinaryAdapter } from "@features/finder-adapters/cloudinary/cloudinary.adapter";
import { APP_ROOT } from "@config/app";

import { DisciplineSelect } from "@features/admin/common/components/DisciplineSelect";
import { InstructorSelect } from "@features/admin/common/components/InstructorSelect";
import { TimeInput } from "@features/admin/common/components/TimeInput";

import {
  emptyPageContentV1,
  parsePageContentV1,
  type PageContentV1,
} from "@contracts/page";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Types                                                                  */
/* ─────────────────────────────────────────────────────────────────────── */

export interface CourseFormInput {
  disciplineId: number;
  audience: Audience;
  day: Day;
  beginTime: number;
  endTime: number;
  instructorId: string | null;
  requisites: string[];
  content: PageContentV1;
}

export interface CourseFormProps {
  /** Pré-remplissage en mode édition. Absent en création. */
  initial?: Course;
  /** Appelée à la soumission avec un payload conforme au contrat course.create/update. */
  onSubmit: (input: CourseFormInput) => Promise<void>;
  /** Libellé du bouton de soumission. Default "Enregistrer". */
  submitLabel?: string;
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Constantes — listes pour les selects                                   */
/* ─────────────────────────────────────────────────────────────────────── */

const AUDIENCES: { value: Audience; label: string }[] = [
  { value: "KIDS", label: "Enfants" },
  { value: "TEENAGERS", label: "Ados" },
  { value: "ADULTS", label: "Adultes" },
  { value: "ALL_AGES", label: "Tous publics" },
];

const DAYS: { value: Day; label: string }[] = [
  { value: "MONDAY", label: "Lundi" },
  { value: "TUESDAY", label: "Mardi" },
  { value: "WEDNESDAY", label: "Mercredi" },
  { value: "THURSDAY", label: "Jeudi" },
  { value: "FRIDAY", label: "Vendredi" },
  { value: "SATURDAY", label: "Samedi" },
  { value: "SUNDAY", label: "Dimanche" },
];

/* ─────────────────────────────────────────────────────────────────────── */
/*  Composant                                                              */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Formulaire d'édition d'un Course, branché sur les composants partagés
 * (DisciplineSelect, InstructorSelect, TimeInput) qui interrogent la
 * DB plutôt que de demander des IDs bruts.
 *
 * Validation simple au submit :
 *   - `disciplineId !== 0` (forcé par le placeholder du DisciplineSelect)
 *   - `endTime > beginTime` (un créneau doit avoir une durée positive)
 *
 * Le `content` initial est passé par `parsePageContentV1` : si la row
 * en DB a un `content` invalide ou pré-v1, on dégrade proprement vers
 * un composite vide plutôt que de crasher le form.
 */
export function CourseForm({
  initial,
  onSubmit,
  submitLabel = "Enregistrer",
}: CourseFormProps) {
  const [disciplineId, setDisciplineId] = useState<number>(
    initial?.disciplineId ?? 0,
  );
  const [audience, setAudience] = useState<Audience>(
    initial?.audience ?? "ADULTS",
  );
  const [day, setDay] = useState<Day>(initial?.day ?? "MONDAY");
  const [beginTime, setBeginTime] = useState<number>(initial?.beginTime ?? 1800);
  const [endTime, setEndTime] = useState<number>(initial?.endTime ?? 1930);
  const [instructorId, setInstructorId] = useState<string | null>(
    initial?.instructorId ?? null,
  );
  const [requisitesText, setRequisitesText] = useState<string>(
    (initial?.requisites ?? []).join("\n"),
  );
  const [content, setContent] = useState<PageContentV1>(
    initial ? parsePageContentV1(initial.content) : emptyPageContentV1(),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitError(null);

    // Validations côté client — légères, juste pour éviter les soumissions
    // évidemment invalides. La vraie validation reste côté backend (Zod).
    if (disciplineId === 0) {
      setSubmitError("Veuillez sélectionner une discipline.");
      return;
    }
    if (endTime <= beginTime) {
      setSubmitError("L'heure de fin doit être après l'heure de début.");
      return;
    }

    setIsSubmitting(true);
    try {
      const requisites = requisitesText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      await onSubmit({
        disciplineId,
        audience,
        day,
        beginTime,
        endTime,
        instructorId,
        requisites,
        content,
      });
    } catch (err) {
      // tRPC propage les Error.message — on les affiche tel quel.
      // Cas attendu : la garde du sous-chantier 7 qui refuse de sortir
      // un asset référencé de published rend ici son diagnostic.
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Métier ───────────────────────────────────────────────────── */}
      <fieldset className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-2 lg:grid-cols-3">
        <legend className="px-2 text-sm font-medium">Métier</legend>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Discipline</span>
          <DisciplineSelect value={disciplineId} onChange={setDisciplineId} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Public</span>
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
          <span className="font-medium">Jour</span>
          <select
            value={day}
            onChange={(e) => setDay(e.target.value as Day)}
            className="rounded border border-input bg-background px-2 py-1"
          >
            {DAYS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Début</span>
          <TimeInput value={beginTime} onChange={setBeginTime} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Fin</span>
          <TimeInput value={endTime} onChange={setEndTime} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Instructeur</span>
          <InstructorSelect value={instructorId} onChange={setInstructorId} />
        </label>

        <label className="col-span-full flex flex-col gap-1 text-sm">
          <span className="font-medium">Prérequis (un par ligne)</span>
          <textarea
            rows={3}
            value={requisitesText}
            onChange={(e) => setRequisitesText(e.target.value)}
            className="rounded border border-input bg-background px-2 py-1 font-mono text-xs"
          />
        </label>
      </fieldset>

      {/* ── Contenu (PageBuilder) ────────────────────────────────────── */}
      <fieldset className="rounded-lg border border-border p-4">
        <legend className="px-2 text-sm font-medium">Contenu de la page</legend>
        <PageBuilder
          value={content}
          onChange={setContent}
          adapter={cloudinaryAdapter}
          appRoot={APP_ROOT}
        />
      </fieldset>

      {/* ── Action ────────────────────────────────────────────────────── */}
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