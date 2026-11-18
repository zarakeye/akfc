"use client";

import { JSX, startTransition, useActionState, useEffect, useState } from "react";
import { useForm, useWatch, type FieldErrors, type Resolver } from "react-hook-form";

import { trpc } from "#core/trpc/trpcClient.ts";
import { CreationLegalFields } from "#features/admin/users/legal/CreationLegalFields.tsx";
import { CoursesPicker, courseLabel } from "#features/admin/users/courses/CoursesPicker.tsx";
import { TaughtCoursesPicker } from "#features/admin/users/courses/TaughtCoursesPicker.tsx";
import { SuccessRedirect } from "#features/admin/common/components/SuccessRedirect.tsx";
import { createUserFormAction } from "#features/admin/users/forms/create-user/createUserForm.action.ts";
import {
  EMAIL_REQUIRED_MESSAGE,
  initialCreateUserFormState,
  type CreateUserFormState,
  type CreateUserFormValues,
} from "#features/admin/users/forms/create-user/createUserForm.types.ts";
import { emailSchema } from "@akfc/contracts/auth/auth.schema.ts";
import {
  EMPTY_CREATION_LEGAL,
  creationLegalAge,
  creationLegalErrorFor,
} from "@akfc/contracts/legal/creationLegal.ts";
import { isMinorAudience } from "@akfc/contracts/courses/enrollment.ts";
import { isAdultGroup } from "@akfc/contracts/groups/systemGroups.ts";

/** Le statut d'un compte, tel que le choisit l'administrateur : un groupe système chacun. */
const STATUS_LABEL = (g: { isAdminGroup: boolean; systemKind: string | null }): string | null =>
  g.isAdminGroup ? "Administrateur" : g.systemKind === "INSTRUCTORS" ? "Instructeur" : g.systemKind === "BUREAU" ? "Bureau" : null;

/**
 * La validation dans le navigateur. Deux règles partagées : l'adresse (emailSchema, celle de la
 * connexion) et la majorité (creationLegalErrorFor, que la server action applique aussi par
 * toCreationLegalInput). La seconde dépend du statut coché : le formulaire passe en contexte les
 * groupes qui rendent majeur d'office.
 */
type ResolverContext = { adultGroupIds: string[] };
const resolver: Resolver<CreateUserFormValues, ResolverContext> = async (values, context) => {
  const errors: FieldErrors<CreateUserFormValues> = {};
  const email = emailSchema.safeParse(values.email);
  if (!values.email.trim()) errors.email = { type: "validate", message: EMAIL_REQUIRED_MESSAGE };
  else if (!email.success) errors.email = { type: "validate", message: email.error.issues[0]?.message };
  const adultByStatus = values.groupIds.some((id) => context?.adultGroupIds.includes(id));
  const legalError = creationLegalErrorFor(values.legal, adultByStatus);
  if (legalError) errors.legal = { type: "validate", message: legalError };
  return Object.keys(errors).length > 0 ? { values: {}, errors } : { values, errors: {} };
};

/**
 * Création d'un compte, sur le modèle hybride (React Hook Form + useActionState + server action
 * createUserFormAction). Son STATUT d'abord : Administrateur, Instructeur, Bureau (les groupes
 * système, qui le rendent majeur d'office) ou, aucun coché, simple membre. Puis ses autres groupes,
 * ses cours, et pour un simple membre sa majorité. Le mot de passe est généré côté serveur et envoyé
 * par e-mail : l'administrateur ne le saisit jamais.
 *
 * Les cases et les listes de cours sont pilotées par l'état du formulaire ; chaque valeur part
 * dans le FormData sous un `name` (cases cochées, champs cachés pour les cours).
 */
export function CreateUserForm(): JSX.Element {
  // Hors du React Compiler : react-hook-form signale ses changements par un proxy (`formState`)
  // que le compilateur ne voit pas ; mémorisé, le rendu ne suivrait plus les erreurs.
  "use no memo";
  const utils = trpc.useUtils();
  const { data: groups } = trpc.memberGroup.list.useQuery();
  const statusGroups = (groups ?? []).filter(isAdultGroup);
  const otherGroups = (groups ?? []).filter((g) => !isAdultGroup(g)).sort((a, b) => a.name.localeCompare(b.name, "fr"));

  const [state, formAction, isPending] = useActionState<CreateUserFormState, FormData>(
    createUserFormAction,
    initialCreateUserFormState,
  );

  const form = useForm<CreateUserFormValues, ResolverContext>({
    resolver,
    context: { adultGroupIds: statusGroups.map((g) => g.id) },
    defaultValues: { email: "", groupIds: [], courseIds: [], taughtCourseIds: [], legal: EMPTY_CREATION_LEGAL },
    // Erreurs au premier envoi, puis corrigées à la frappe (voir le chapitre sur React Hook Form).
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const { register, setValue, setError, control, formState } = form;

  const [groupIds, courseIds, taughtCourseIds, legal] = useWatch({
    control,
    name: ["groupIds", "courseIds", "taughtCourseIds", "legal"],
  });
  const adultByStatus = statusGroups.some((g) => groupIds.includes(g.id));
  const instructor = statusGroups.some((g) => g.systemKind === "INSTRUCTORS" && groupIds.includes(g.id));
  const taught = instructor ? taughtCourseIds : [];
  const followed = courseIds.filter((id) => !taught.includes(id));
  const legalAge = adultByStatus ? "ADULT" : creationLegalAge(legal);
  // Créneaux pour enfants ou adolescents cochés : un indice de minorité, affiché sous les cours.
  // Une aide à la saisie, pas une valeur envoyée : un état local suffit.
  const [minorCourses, setMinorCourses] = useState<string[]>([]);

  // Après le premier envoi, une valeur changée par un clic (case, cours, majorité) est revalidée.
  const revalidate = { shouldValidate: formState.isSubmitted };
  const toggleGroup = (id: string, on: boolean) =>
    setValue("groupIds", on ? [...groupIds, id] : groupIds.filter((x) => x !== id), revalidate);

  useEffect(() => {
    if (state.status === "success") {
      void utils.user.getAll.invalidate();
      return;
    }
    if (state.status !== "error" || !state.fieldErrors) return;
    for (const [field, message] of Object.entries(state.fieldErrors)) {
      if (message) setError(field as "email" | "legal", { type: "server", message });
    }
  }, [state, utils, setError]);

  if (state.status === "success" && state.data) {
    return <SuccessRedirect target={`/dashboard/users/${state.data.id}`} message="Utilisateur créé." />;
  }

  const errMsg = state.status === "error" && !state.fieldErrors ? state.error : null;

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        // La validation de React Hook Form est asynchrone : on suspend TOUJOURS l'envoi (un
        // preventDefault après un await arriverait trop tard), puis on le relance s'il est valide.
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        void form.trigger().then((valid) => {
          if (valid) startTransition(() => formAction(formData));
        });
      }}
      noValidate
      className="flex max-w-md flex-col gap-4"
    >
      <label className="flex flex-col gap-1 text-sm" data-tour="users.form.email">
        <span className="font-medium">Email</span>
        <input type="email" className="rounded border border-input bg-background px-2 py-1" {...register("email")} />
        {formState.errors.email && <span className="text-sm text-red-600">{formState.errors.email.message}</span>}
      </label>

      <fieldset className="flex flex-col gap-1 text-sm" data-tour="users.form.groups">
        <legend className="mb-1 font-medium">Statut</legend>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {statusGroups.map((g) => (
            <label key={g.id} className="flex cursor-pointer items-center gap-1.5">
              <input
                type="checkbox"
                name="groupIds"
                value={g.id}
                checked={groupIds.includes(g.id)}
                onChange={(e) => toggleGroup(g.id, e.target.checked)}
              />
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
                  <input
                    type="checkbox"
                    name="groupIds"
                    value={g.id}
                    checked={groupIds.includes(g.id)}
                    onChange={(e) => toggleGroup(g.id, e.target.checked)}
                  />
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
          <TaughtCoursesPicker userId={null} value={taughtCourseIds} onChange={(v) => setValue("taughtCourseIds", v, revalidate)} />
          {taught.map((id) => (
            <input key={id} type="hidden" name="taughtCourseIds" value={id} />
          ))}
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
          value={followed}
          except={taught}
          exclusiveMinor={!adultByStatus}
          onChange={(ids, courses) => {
            setValue("courseIds", ids, revalidate);
            const minors = courses.filter((c) => isMinorAudience(c.audience)).map(courseLabel);
            setMinorCourses(minors);
            // Un cours pour mineurs pré-coche « Mineur », tant que rien ne décide de la majorité.
            if (minors.length > 0 && creationLegalAge(legal) === null) setValue("legal", { ...legal, choice: "MINOR" }, revalidate);
          }}
        />
        {followed.map((id) => (
          <input key={id} type="hidden" name="courseIds" value={id} />
        ))}
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
          <CreationLegalFields value={legal} onChange={(v) => setValue("legal", v, revalidate)} />
        )}
        {formState.errors.legal?.message && (
          <span className="text-sm text-red-600">{formState.errors.legal.message}</span>
        )}
      </fieldset>

      {errMsg && <p className="text-sm text-red-600">{errMsg}</p>}

      <div className="flex justify-end" data-tour="users.form.submit">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? "Création…" : "Créer"}
        </button>
      </div>
    </form>
  );
}
