"use client";

import { useState } from "react";
import { trpc } from "#core/trpc/trpcClient.ts";
import {
  CreationLegalFields,
  EMPTY_CREATION_LEGAL,
  ageFromInput,
  creationLegalAge,
  creationLegalError,
  type CreationLegalValue,
} from "#features/admin/users/legal/CreationLegalFields.tsx";
import { CoursesPicker, courseLabel } from "#features/admin/users/courses/CoursesPicker.tsx";
import { TaughtCoursesPicker } from "#features/admin/users/courses/TaughtCoursesPicker.tsx";
import { isMinorAudience } from "@akfc/contracts/courses/enrollment.ts";
import { isAdultGroup } from "@akfc/contracts/groups/systemGroups.ts";

/** Le statut d'un compte, tel que le choisit l'administrateur : un groupe système chacun. */
const STATUS_LABEL = (g: { isAdminGroup: boolean; systemKind: string | null }): string | null =>
  g.isAdminGroup ? "Administrateur" : g.systemKind === "INSTRUCTORS" ? "Instructeur" : g.systemKind === "BUREAU" ? "Bureau" : null;

export interface CreateUserFormInput {
  email: string;
  groupIds: string[];
  /** Simple membre : date de naissance ou choix majeur/mineur ; mineur : parent référent. */
  legal: CreationLegalValue;
  /** Un groupe système est coché : majeur d'office, sans saisie. */
  adultByStatus: boolean;
  /** Créneaux suivis (facultatif) ; pour un instructeur, sans être élève. */
  courseIds: number[];
  /** Instructeur : les créneaux qu'il donne. */
  taughtCourseIds: number[];
}

export interface CreateUserFormProps {
  onSubmit: (input: CreateUserFormInput) => Promise<void>;
  submitLabel?: string;
}

/**
 * Form de création d'utilisateur. Son STATUT d'abord : Administrateur, Instructeur, Bureau (les
 * groupes système, qui le rendent majeur d'office) ou, aucun coché, simple membre. Puis ses autres
 * groupes, ses cours, et pour un simple membre sa majorité. Le mot de passe est généré côté serveur
 * et envoyé par email — l'admin ne le saisit jamais.
 */
export function CreateUserForm({
  onSubmit,
  submitLabel = "Créer",
}: CreateUserFormProps) {
  const [email, setEmail] = useState<string>("");
  const [groupIds, setGroupIds] = useState<string[]>([]);
  const [legal, setLegal] = useState<CreationLegalValue>(EMPTY_CREATION_LEGAL);
  const [courseIds, setCourseIds] = useState<number[]>([]);
  const [taughtCourseIds, setTaughtCourseIds] = useState<number[]>([]);
  // Créneaux pour enfants ou adolescents cochés : un indice de minorité, affiché sous les cours.
  const [minorCourses, setMinorCourses] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Liste des groupes pour le sélecteur (procédure admin).
  const { data: groups } = trpc.memberGroup.list.useQuery();
  const statusGroups = (groups ?? []).filter(isAdultGroup);
  const otherGroups = (groups ?? []).filter((g) => !isAdultGroup(g)).sort((a, b) => a.name.localeCompare(b.name, "fr"));
  const adultByStatus = statusGroups.some((g) => groupIds.includes(g.id));
  const instructor = statusGroups.some((g) => g.systemKind === "INSTRUCTORS" && groupIds.includes(g.id));
  const taught = instructor ? taughtCourseIds : [];
  const toggleGroup = (id: string, on: boolean) =>
    setGroupIds((prev) => (on ? [...prev, id] : prev.filter((x) => x !== id)));
  const legalAge = adultByStatus ? "ADULT" : creationLegalAge(legal);

  const handleSubmit = async () => {
    setSubmitError(null);
    if (email.trim() === "") {
      setSubmitError("L'email est obligatoire.");
      return;
    }
    const legalError = adultByStatus
      ? legal.birthDate && (ageFromInput(legal.birthDate) ?? 18) < 18
        ? "Un mineur ne peut pas être administrateur, instructeur ou membre du bureau."
        : null
      : creationLegalError(legal);
    if (legalError) {
      setSubmitError(legalError);
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({
        email: email.trim(),
        groupIds,
        legal,
        adultByStatus,
        courseIds: courseIds.filter((id) => !taught.includes(id)),
        taughtCourseIds: taught,
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex max-w-md flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm" data-tour="users.form.email">
        <span className="font-medium">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded border border-input bg-background px-2 py-1"
        />
      </label>

      <fieldset className="flex flex-col gap-1 text-sm" data-tour="users.form.groups">
        <legend className="mb-1 font-medium">Statut</legend>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {statusGroups.map((g) => (
            <label key={g.id} className="flex cursor-pointer items-center gap-1.5">
              <input type="checkbox" checked={groupIds.includes(g.id)} onChange={(e) => toggleGroup(g.id, e.target.checked)} />
              {STATUS_LABEL(g)}
            </label>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          {adultByStatus ? "Majeur d'office." : "Aucun coché : simple membre."}
        </span>

        {otherGroups.length > 0 && (
          <>
            <span className="mt-2 font-medium">Autres groupes (facultatif)</span>
            <div className="flex max-h-48 flex-col gap-1 overflow-y-auto rounded border border-input bg-background p-2">
              {otherGroups.map((g) => (
                <label key={g.id} className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 hover:bg-muted">
                  <input type="checkbox" checked={groupIds.includes(g.id)} onChange={(e) => toggleGroup(g.id, e.target.checked)} />
                  <span>{g.name}</span>
                </label>
              ))}
            </div>
          </>
        )}
      </fieldset>

      {instructor && (
        <fieldset className="flex flex-col gap-1 text-sm">
          <legend className="mb-1 font-medium">Cours donnés</legend>
          <TaughtCoursesPicker userId={null} value={taughtCourseIds} onChange={setTaughtCourseIds} />
        </fieldset>
      )}

      <fieldset className="flex flex-col gap-1 text-sm" data-tour="users.form.courses">
        <legend className="mb-1 font-medium">{instructor ? "Autres cours suivis (facultatif)" : "Cours suivis"}</legend>
        {instructor && (
          <span className="text-xs text-muted-foreground">
            Un instructeur suit d&apos;autres cours gratuitement, sans être compté comme élève.
          </span>
        )}
        <CoursesPicker
          value={courseIds.filter((id) => !taught.includes(id))}
          except={taught}
          exclusiveMinor={!adultByStatus}
          onChange={(ids, courses) => {
            setCourseIds(ids);
            const minors = courses.filter((c) => isMinorAudience(c.audience)).map(courseLabel);
            setMinorCourses(minors);
            // Un cours pour mineurs pré-coche « Mineur », tant que rien ne décide de la majorité.
            if (minors.length > 0 && creationLegalAge(legal) === null) setLegal({ ...legal, choice: "MINOR" });
          }}
        />
        {minorCourses.length > 0 && !adultByStatus && (
          <span role="note" className="text-xs text-sky-800 dark:text-sky-300">
            {legalAge === "ADULT"
              ? `Attention : ${minorCourses.join(", ")} est un cours pour mineurs. Le membre est-il bien majeur ?`
              : `Mineur pré-coché : ${minorCourses.join(", ")} est un cours pour mineurs. Vérifiez la majorité ci-dessous.`}
          </span>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-1 text-sm" data-tour="users.form.legal">
        <legend className="mb-1 font-medium">Majorité</legend>
        {adultByStatus ? (
          <p className="text-sm">
            <strong>Majeur d&apos;office</strong> : les administrateurs, instructeurs et membres du bureau sont majeurs.
          </p>
        ) : (
          <CreationLegalFields value={legal} onChange={setLegal} />
        )}
      </fieldset>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <div className="flex justify-end" data-tour="users.form.submit">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? "Création…" : submitLabel}
        </button>
      </div>
    </div>
  );
}
