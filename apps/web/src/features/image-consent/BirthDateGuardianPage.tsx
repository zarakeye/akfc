"use client";

import { startTransition, useActionState, useEffect, type JSX } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@akfc/backend/modules/index.ts";

import { trpc } from "#core/trpc/trpcClient.ts";
import { formatDate } from "#features/image-consent/consentFormat.ts";
import { GuardianBirthDateField } from "#features/image-consent/GuardianBirthDateField.tsx";
import { ADULT_BIRTH_DATE_UNCONFIRMED, isAdultBirthDate } from "@akfc/contracts/legal/imageConsent.ts";
import { confirmBirthDateSchema } from "@akfc/contracts/legal/imageConsentForms.schema.ts";
import { confirmBirthDateFormAction } from "#features/image-consent/actions/confirmBirthDateForm.action.ts";
import {
  initialConfirmBirthDateFormState,
  type ConfirmBirthDateField,
  type ConfirmBirthDateFormState,
} from "#features/image-consent/actions/confirmBirthDateForm.types.ts";

/**
 * Page du parent référent : la date de naissance du membre mineur, à renseigner, corriger ou
 * effacer (champ vide), à la demande du mineur. Il se déclare représentant légal et valide. Une
 * date de majeur doit être confirmée : le membre passe alors majeur. Le droit à l'image n'est pas
 * touché.
 *
 * Modèle hybride : React Hook Form et le schéma partagé dans le navigateur, server action
 * confirmBirthDateFormAction pour l'enregistrement. Le lien personnel (token) tient lieu d'identité.
 */
export function BirthDateGuardianPage({ token }: { token: string }): JSX.Element {
  const request = trpc.imageConsent.birthDateRequest.useQuery({ token }, { retry: false, refetchOnWindowFocus: false });
  const r = request.data;
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 text-sm">
      <h1 className="text-xl font-semibold">Date de naissance</h1>
      <p className="mt-1 text-gray-600">AKFC — Association Kung Fu Chambéry</p>
      {request.isPending ? (
        <p className="mt-6 text-gray-600">Chargement…</p>
      ) : request.error ? (
        <p className="mt-6 rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900" role="alert">
          {request.error.message}
        </p>
      ) : r ? (
        <BirthDateForm key={token} token={token} data={r} />
      ) : null}
    </main>
  );
}

type RequestData = inferRouterOutputs<AppRouter>["imageConsent"]["birthDateRequest"];

type BirthDateValues = z.input<typeof confirmBirthDateSchema>;

function BirthDateForm({ token, data: r }: { token: string; data: RequestData }): JSX.Element {
  // Hors du React Compiler : react-hook-form signale ses changements par un proxy (`formState`)
  // que le compilateur ne voit pas ; mémorisé, le rendu ne suivrait plus les erreurs.
  "use no memo";
  const [state, formAction, isPending] = useActionState<ConfirmBirthDateFormState, FormData>(
    confirmBirthDateFormAction,
    initialConfirmBirthDateFormState,
  );

  // Le schéma partagé, plus deux règles vérifiées ici pour prévenir le parent avant l'envoi, et
  // refaites par le service : une date à donner quand le club n'en a pas, une date de majeur à confirmer.
  const clientSchema = confirmBirthDateSchema.superRefine((v, ctx) => {
    if (!v.birthDate && r.birthDate === null) {
      ctx.addIssue({ code: "custom", path: ["birthDate"], message: "Indiquez sa date de naissance." });
    }
    if (v.birthDate && isAdultBirthDate(v.birthDate) && !v.confirmAdult) {
      ctx.addIssue({ code: "custom", path: ["confirmAdult"], message: ADULT_BIRTH_DATE_UNCONFIRMED });
    }
  });
  const form = useForm<BirthDateValues, unknown, z.output<typeof clientSchema>>({
    resolver: zodResolver(clientSchema),
    defaultValues: { token, birthDate: r.birthDate ?? "", confirmAdult: false, isLegalRepresentative: false },
    // Erreurs au premier envoi, puis corrigées à la saisie (voir le chapitre sur React Hook Form).
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const { register, setValue, setError, control, formState } = form;
  const [birthDateValue, confirmAdult] = useWatch({ control, name: ["birthDate", "confirmAdult"] });
  const birthDate = String(birthDateValue ?? "");
  const clearing = birthDate === "" && r.birthDate !== null;
  const revalidate = { shouldValidate: formState.isSubmitted };

  useEffect(() => {
    if (state.status !== "error" || !state.fieldErrors) return;
    for (const [name, message] of Object.entries(state.fieldErrors)) {
      if (message) setError(name as ConfirmBirthDateField, { type: "server", message });
    }
  }, [state, setError]);

  if (state.status === "success" && state.data) {
    const text =
      state.data.result === "ADULT"
        ? `${r.memberName} est majeur : sa date de naissance est enregistrée. Il gère désormais seul son compte et son droit à l'image ; il en est informé.`
        : state.data.result === "CLEARED"
          ? `La date de naissance de ${r.memberName} est effacée. ${r.memberName} en est informé.`
          : `La date de naissance de ${r.memberName} est enregistrée. ${r.memberName} en est informé.`;
    return (
      <div className="mt-6 space-y-2 rounded-md border border-emerald-300 bg-emerald-50 p-4 text-emerald-900" role="status">
        <p className="font-medium">Merci.</p>
        <p>{text}</p>
        <p>Ce lien ne sert plus.</p>
      </div>
    );
  }

  if (!r.stillMinor) {
    return (
      <p className="mt-6 rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900" role="alert">
        {r.memberName} est devenu majeur : il gère désormais lui-même son compte.
      </p>
    );
  }

  const errors = formState.errors;
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
      className="mt-6 space-y-5"
    >
      <input type="hidden" {...register("token")} />
      <p>
        Bonjour {r.guardianName}. {r.memberName} vous demande de{" "}
        {r.birthDate ? "vérifier sa date de naissance enregistrée par le club" : "renseigner sa date de naissance"}. Elle
        sert à savoir quand il deviendra majeur et décidera seul de l&apos;usage de son image.
      </p>

      <div>
        <GuardianBirthDateField
          memberName={r.memberName}
          label={`Date de naissance de ${r.memberName}`}
          value={birthDate}
          onChange={(v) => setValue("birthDate", v, revalidate)}
          confirmAdult={confirmAdult ?? false}
          onConfirmAdult={(v) => setValue("confirmAdult", v, revalidate)}
          hint={
            r.birthDate
              ? "Corrigez-la si besoin, ou videz le champ pour l'effacer (le passage à 18 ans ne sera alors plus automatique)."
              : undefined
          }
          adultConsequence={`Confirmée, elle fait passer ${r.memberName} majeur : il gérera seul son compte et son droit à l'image.`}
        />
        {errors.birthDate && <p className="mt-1 text-red-600">{errors.birthDate.message}</p>}
        {errors.confirmAdult && <p className="mt-1 text-red-600">{errors.confirmAdult.message}</p>}
      </div>
      {clearing && (
        <p className="rounded-md border border-gray-300 bg-gray-50 p-3 text-gray-700">
          Champ vide : la date enregistrée sera effacée.
        </p>
      )}

      <div>
        <label className="flex items-start gap-2">
          <input type="checkbox" className="mt-1" {...register("isLegalRepresentative")} />
          <span>
            Je suis {r.guardianName}, représentant légal ({r.guardianRelation}) de {r.memberName}.
          </span>
        </label>
        {errors.isLegalRepresentative && <p className="mt-1 text-red-600">{errors.isLegalRepresentative.message}</p>}
      </div>

      {errMsg && <p className="text-red-600">{errMsg}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-emerald-600 px-3 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {isPending ? "Enregistrement…" : clearing ? "J'efface la date" : "J'enregistre la date"}
      </button>
      <p className="text-xs text-gray-500">
        Lien personnel, valable jusqu&apos;au {formatDate(r.expiresAt)} et utilisable une seule fois.
      </p>
    </form>
  );
}
