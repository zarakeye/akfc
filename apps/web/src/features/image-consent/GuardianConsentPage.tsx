"use client";

import { startTransition, useActionState, useEffect, useState, type JSX } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@akfc/backend/modules/index.ts";

import { trpc } from "#core/trpc/trpcClient.ts";
import { ADULT_BIRTH_DATE_UNCONFIRMED, isAdultBirthDate } from "@akfc/contracts/legal/imageConsent.ts";
import { confirmGuardianSchema } from "@akfc/contracts/legal/imageConsentForms.schema.ts";
import { BlankConsentFormPreview } from "#features/image-consent/BlankConsentFormCard.tsx";
import { ConsentChoicesFields } from "#features/image-consent/ConsentChoicesFields.tsx";
import { formatDate } from "#features/image-consent/consentFormat.ts";
import { GuardianBirthDateField } from "#features/image-consent/GuardianBirthDateField.tsx";
import { confirmGuardianFormAction } from "#features/image-consent/actions/confirmGuardianForm.action.ts";
import {
  initialConfirmGuardianFormState,
  type ConfirmGuardianField,
  type ConfirmGuardianFormState,
} from "#features/image-consent/actions/confirmGuardianForm.types.ts";

/**
 * Page du parent référent : le formulaire pré-rempli des souhaits du membre mineur, qu'il peut
 * changer ; il peut confirmer ou donner sa date de naissance (facultative), se déclare représentant
 * légal et valide. Ses choix font foi ; les lignes qui s'écartent des souhaits sont marquées « modifié »,
 * comme dans le PDF. La date qu'il donne devient celle de la fiche du membre.
 *
 * Modèle hybride : React Hook Form et le schéma partagé dans le navigateur, server action
 * confirmGuardianFormAction pour l'enregistrement. Le lien personnel (token) tient lieu d'identité.
 */
export function GuardianConsentPage({ token }: { token: string }): JSX.Element {
  const request = trpc.imageConsent.guardianRequest.useQuery({ token }, { retry: false, refetchOnWindowFocus: false });
  const r = request.data;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 text-sm">
      <h1 className="text-xl font-semibold">Autorisation de droit à l&apos;image</h1>
      <p className="mt-1 text-gray-600">AKFC — Association Kung Fu Chambéry</p>
      {request.isPending ? (
        <p className="mt-6 text-gray-600">Chargement…</p>
      ) : request.error ? (
        <p className="mt-6 rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900" role="alert">
          {request.error.message}
        </p>
      ) : r ? (
        // Clé : un rechargement des données repart des souhaits reçus, sans état périmé.
        <GuardianForm key={token} token={token} data={r} />
      ) : null}
    </main>
  );
}

type RequestData = inferRouterOutputs<AppRouter>["imageConsent"]["guardianRequest"];

/**
 * Le schéma partagé, plus la règle de la date de majeur : vérifiée ici pour prévenir le parent
 * avant l'envoi, refaite par le service, qui seul fait foi.
 */
const clientSchema = confirmGuardianSchema.superRefine((v, ctx) => {
  if (v.birthDate && isAdultBirthDate(v.birthDate) && !v.confirmAdult) {
    ctx.addIssue({ code: "custom", path: ["confirmAdult"], message: ADULT_BIRTH_DATE_UNCONFIRMED });
  }
});
type GuardianValues = z.input<typeof clientSchema>;

function GuardianForm({ token, data: r }: { token: string; data: RequestData }): JSX.Element {
  // Hors du React Compiler : react-hook-form signale ses changements par un proxy (`formState`)
  // que le compilateur ne voit pas ; mémorisé, le rendu ne suivrait plus les erreurs.
  "use no memo";
  const [textOpen, setTextOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<ConfirmGuardianFormState, FormData>(
    confirmGuardianFormAction,
    initialConfirmGuardianFormState,
  );
  const form = useForm<GuardianValues, unknown, z.output<typeof clientSchema>>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      token,
      usages: r.usages,
      keepAfterLeave: r.keepAfterLeave ?? false,
      birthDate: r.birthDate ?? "",
      confirmAdult: false,
      isLegalRepresentative: false,
    },
    // Erreurs au premier envoi, puis corrigées à la saisie (voir le chapitre sur React Hook Form).
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const { register, setValue, setError, control, formState } = form;
  // Les choix et la date sont tenus par des champs pilotés ; leurs valeurs suivent l'état du formulaire.
  const [usages, keep, birthDate, confirmAdult] = useWatch({
    control,
    name: ["usages", "keepAfterLeave", "birthDate", "confirmAdult"],
  });
  const revalidate = { shouldValidate: formState.isSubmitted };

  useEffect(() => {
    if (state.status !== "error" || !state.fieldErrors) return;
    for (const [name, message] of Object.entries(state.fieldErrors)) {
      if (message) setError(name as ConfirmGuardianField, { type: "server", message });
    }
  }, [state, setError]);

  if (state.status === "success" && state.data?.becameAdult) {
    return (
      <div className="mt-6 space-y-2 rounded-md border border-amber-300 bg-amber-50 p-4 text-amber-900" role="status">
        <p className="font-medium">{r.memberName} est majeur : sa date de naissance est enregistrée.</p>
        <p>
          C&apos;est désormais lui qui donne son autorisation de droit à l&apos;image, depuis son profil ; vos choix n&apos;ont pas
          été enregistrés. Il en est informé. Ce lien ne sert plus.
        </p>
      </div>
    );
  }

  if (state.status === "success" && state.data) {
    return (
      <div className="mt-6 space-y-2 rounded-md border border-emerald-300 bg-emerald-50 p-4 text-emerald-900" role="status">
        <p className="font-medium">Merci, l&apos;autorisation de {r.memberName} est enregistrée.</p>
        {state.data.changes.length > 0 ? (
          <>
            <p>Par rapport à ses souhaits, vous avez changé :</p>
            <ul className="list-disc pl-5">
              {state.data.changes.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </>
        ) : (
          <p>Vous avez gardé tous ses souhaits.</p>
        )}
        <p>Le club et {r.memberName} en sont informés. Ce lien ne sert plus.</p>
      </div>
    );
  }

  if (!r.stillMinor) {
    return (
      <p className="mt-6 rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900" role="alert">
        {r.memberName} est devenu majeur : il donne désormais lui-même son autorisation, depuis son profil.
      </p>
    );
  }

  const errors = formState.errors;
  const errMsg = state.status === "error" && !state.fieldErrors ? state.error : null;

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        // Lu tout de suite, tant que l'évènement est disponible.
        const formData = new FormData(e.currentTarget);
        // handleSubmit arrête l'envoi natif, valide, et ne relance l'action que si tout est valide.
        void form.handleSubmit(() => startTransition(() => formAction(formData)))(e);
      }}
      noValidate
      className="mt-6 space-y-5"
    >
      <input type="hidden" {...register("token")} />
      <p>
        Bonjour {r.guardianName}. {r.memberName} a indiqué ses souhaits pour l&apos;usage de son image par le club. Comme son
        représentant légal ({r.guardianRelation}), c&apos;est vous qui décidez : ses choix sont pré-cochés, vous pouvez les
        modifier. L&apos;autorisation est facultative ; la refuser ne change rien à son inscription.{" "}
        <button type="button" onClick={() => setTextOpen(true)} className="text-emerald-700 underline">
          Lire le texte complet de l&apos;autorisation
        </button>
      </p>

      <ConsentChoicesFields
        usages={usages}
        onUsages={(v) => setValue("usages", v, revalidate)}
        keep={keep ?? false}
        onKeep={(v) => setValue("keepAfterLeave", v, revalidate)}
        subject="child"
        wishes={{ usages: r.usages, keepAfterLeave: r.keepAfterLeave }}
      />

      <div>
        <GuardianBirthDateField
          memberName={r.memberName}
          label={`Date de naissance de ${r.memberName} (facultative)`}
          value={String(birthDate ?? "")}
          onChange={(v) => setValue("birthDate", v, revalidate)}
          confirmAdult={confirmAdult ?? false}
          onConfirmAdult={(v) => setValue("confirmAdult", v, revalidate)}
          hint={`${r.birthDate ? "Vérifiez-la, corrigez-la si besoin." : "Le club ne la connaît pas."} Avec elle, ${r.memberName} passe majeur de lui-même à ses 18 ans et décide alors seul ; sans elle, le club le fera.`}
          adultConsequence={`Confirmée, elle fait passer ${r.memberName} majeur : c'est lui qui donnera son autorisation, et vos choix ci-dessus ne seront pas enregistrés.`}
        />
        {errors.birthDate && <p className="mt-1 text-red-600">{errors.birthDate.message}</p>}
        {errors.confirmAdult && <p className="mt-1 text-red-600">{errors.confirmAdult.message}</p>}
      </div>

      <div>
        <label className="flex items-start gap-2">
          <input type="checkbox" className="mt-1" {...register("isLegalRepresentative")} />
          <span>
            Je suis {r.guardianName}, représentant légal ({r.guardianRelation}) de {r.memberName}, et je donne cette
            autorisation pour lui.
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
        {isPending ? "Enregistrement…" : "Je valide l'autorisation"}
      </button>
      <p className="text-xs text-gray-500">
        Lien personnel, valable jusqu&apos;au {formatDate(r.expiresAt)} et utilisable une seule fois. Version du texte :{" "}
        {r.textVersion}.
      </p>
      {textOpen && <BlankConsentFormPreview onClose={() => setTextOpen(false)} />}
    </form>
  );
}
