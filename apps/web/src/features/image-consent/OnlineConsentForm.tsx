"use client";

import { startTransition, useActionState, useEffect, useState, type JSX } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@akfc/backend/modules/index.ts";
import { PenLine, Send } from "lucide-react";

import { trpc } from "#core/trpc/trpcClient.ts";
import type { ImageUsageValue } from "@akfc/contracts/legal/imageConsent.ts";
import { BlankConsentFormPreview } from "#features/image-consent/BlankConsentFormCard.tsx";
import { ConsentChoicesFields } from "#features/image-consent/ConsentChoicesFields.tsx";
import { formatDate } from "#features/image-consent/consentFormat.ts";
import { confirmMineSchema, requestGuardianSchema } from "@akfc/contracts/legal/imageConsentForms.schema.ts";
import { confirmMineFormAction } from "#features/image-consent/actions/confirmMineForm.action.ts";
import {
  initialConfirmMineFormState,
  type ConfirmMineFormState,
} from "#features/image-consent/actions/confirmMineForm.types.ts";
import { requestGuardianFormAction } from "#features/image-consent/actions/requestGuardianForm.action.ts";
import {
  initialRequestGuardianFormState,
  type RequestGuardianFormState,
} from "#features/image-consent/actions/requestGuardianForm.types.ts";

/**
 * Profil : autorisation de droit à l'image EN LIGNE.
 * - Majeur : il coche chaque usage (Oui / Non) et le choix après le départ, puis confirme avec son
 *   mot de passe ; le club reçoit un avis, et le récapitulatif PDF rejoint ses formulaires.
 * - Mineur : il indique ses SOUHAITS ; un lien personnel part à son parent référent, qui valide
 *   (page /autorisation-parent/…). La page dit ce qui manque au club, et où en est la demande.
 * - Majorité non renseignée : le club doit d'abord la renseigner.
 * Tout se fait en ligne : une fois le majeur ou le parent ayant validé, le récapitulatif PDF des
 * autorisations et refus rejoint les formulaires du membre. *
 * Les deux formulaires (majeur, mineur) suivent le modèle hybride : React Hook Form et le schéma
 * partagé dans le navigateur, une server action pour l'enregistrement.
 */
export function OnlineConsentForm({ latest }: { latest: { usages: ImageUsageValue[]; keepAfterLeave: boolean | null } | null }): JSX.Element | null {
  const utils = trpc.useUtils();
  const state = trpc.imageConsent.onlineState.useQuery();
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [textOpen, setTextOpen] = useState(false);

  const s = state.data;
  if (!s) return null;

  if (s.legalAge === "MINOR") {
    return <MinorWishes state={s} latest={latest} onText={() => setTextOpen(true)} textOpen={textOpen} onCloseText={() => setTextOpen(false)} />;
  }

  if (s.legalAge === "UNKNOWN") {
    return (
      <div className="rounded-lg border border-border p-4 text-sm text-gray-600">
        <p className="font-semibold text-foreground">Pourquoi pas de formulaire en ligne ?</p>
        <p className="mt-1">
          Le club n&apos;a pas encore indiqué si vous êtes majeur(e) ou mineur(e) : un mineur ne signe pas lui-même,
          c&apos;est son parent qui valide. Écrivez à contact@akfc.fr pour qu&apos;un administrateur le renseigne ; le
          formulaire en ligne apparaîtra ici.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border p-4 text-sm">
      <p className="font-semibold">Donner ou modifier votre autorisation en ligne</p>
      {s.reconfirm && (
        <p className="mt-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900" role="status">
          Vous êtes majeur(e) : c&apos;est désormais vous qui décidez. Les choix de votre parent restent valables
          jusqu&apos;à ce que vous confirmiez ou modifiiez les vôtres.
        </p>
      )}
      {!s.canConfirmOnline ? (
        <p className="mt-1 text-amber-800">Renseignez d&apos;abord vos nom et prénom dans votre profil.</p>
      ) : !open ? (
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => {
              setSaved(false);
              setOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 font-medium text-white hover:bg-emerald-700"
          >
            <PenLine className="h-4 w-4" />
            {s.reconfirm ? "Confirmer ou modifier mes choix" : latest ? "Modifier mes choix" : "Donner mon autorisation"}
          </button>
        </div>
      ) : (
        <AdultConsentForm
          latest={latest}
          onText={() => setTextOpen(true)}
          onCancel={() => setOpen(false)}
          onDone={async () => {
            setOpen(false);
            setSaved(true);
            await Promise.all([utils.imageConsent.mine.invalidate(), utils.imageConsent.onlineState.invalidate()]);
          }}
        />
      )}
      {saved && !open && (
        <p className="mt-3 text-emerald-700">
          Autorisation enregistrée. Le récapitulatif signé figure ci-dessous, avec vos formulaires.
        </p>
      )}
      {textOpen && <BlankConsentFormPreview onClose={() => setTextOpen(false)} />}
    </div>
  );
}

type OnlineState = inferRouterOutputs<AppRouter>["imageConsent"]["onlineState"];

/**
 * Mineur : ses souhaits, envoyés à son parent référent par un lien personnel (7 jours, usage
 * unique). Sans effet sur ses droits tant que le parent n'a pas validé. Renvoyer remplace le lien.
 */
function MinorWishes({
  state: s,
  latest,
  onText,
  textOpen,
  onCloseText,
}: {
  state: OnlineState;
  latest: { usages: ImageUsageValue[]; keepAfterLeave: boolean | null } | null;
  onText: () => void;
  textOpen: boolean;
  onCloseText: () => void;
}): JSX.Element {
  const utils = trpc.useUtils();
  const pending = s.pendingGuardian;
  const start = pending ?? latest;
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-border p-4 text-sm">
      <p className="font-semibold">Autorisation par votre parent référent</p>
      <p className="mt-1 text-gray-600">
        Vous êtes mineur : c&apos;est votre parent référent qui autorise l&apos;usage de votre image
        {s.guardianEmailMasked ? <> (adresse enregistrée par le club : {s.guardianEmailMasked})</> : null}. Vous indiquez vos
        souhaits ; il les reçoit pré-cochés, peut les modifier, confirmer votre date de naissance, puis valide.
      </p>

      {s.missing.length > 0 ? (
        <p className="mt-2 text-amber-800">
          Le club doit d&apos;abord renseigner : {s.missing.join(", ")}. Parlez-en à un instructeur.
        </p>
      ) : pending?.active && !open ? (
        <div className="mt-3 space-y-2" role="status">
          <p className="text-emerald-800">
            En attente de votre parent : lien envoyé à {pending.sentToMasked} le {pending.sentAt ? formatDate(pending.sentAt) : "—"},
            valable jusqu&apos;au {pending.expiresAt ? formatDate(pending.expiresAt) : "—"}.
          </p>
          <button type="button" onClick={() => setOpen(true)} className="rounded-md border border-gray-300 px-3 py-2 hover:bg-gray-50">
            Modifier mes souhaits et renvoyer le lien
          </button>
        </div>
      ) : !open ? (
        <div className="mt-3 flex flex-wrap items-center gap-4">
          {pending && !pending.active && <p className="w-full text-amber-800">Le lien envoyé à votre parent a expiré.</p>}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 font-medium text-white hover:bg-emerald-700"
          >
            <PenLine className="h-4 w-4" />
            Indiquer mes souhaits
          </button>
        </div>
      ) : (
        <MinorWishesForm
          start={start}
          onText={onText}
          onCancel={() => setOpen(false)}
          onDone={async () => {
            setOpen(false);
            await utils.imageConsent.onlineState.invalidate();
          }}
        />
      )}
      {textOpen && <BlankConsentFormPreview onClose={onCloseText} />}
    </div>
  );
}

type Choices = { usages: ImageUsageValue[]; keepAfterLeave: boolean | null } | null;

/** Le submit commun : la validation de React Hook Form (handleSubmit), puis la server action. */
function submitWith(
  form: { handleSubmit: (onValid: () => void) => (e: React.BaseSyntheticEvent) => Promise<void> },
  formAction: (fd: FormData) => void,
) {
  return (e: React.FormEvent<HTMLFormElement>) => {
    // Lu tout de suite, tant que l'évènement est disponible.
    const formData = new FormData(e.currentTarget);
    // handleSubmit arrête l'envoi natif, valide, et ne relance l'action que si tout est valide.
    void form.handleSubmit(() => startTransition(() => formAction(formData)))(e);
  };
}

/** Majeur : ses choix, signés de son mot de passe (server action confirmMineFormAction). */
function AdultConsentForm({
  latest,
  onText,
  onCancel,
  onDone,
}: {
  latest: Choices;
  onText: () => void;
  onCancel: () => void;
  onDone: () => Promise<void>;
}): JSX.Element {
  // Hors du React Compiler : react-hook-form signale ses changements par un proxy (`formState`)
  // que le compilateur ne voit pas ; mémorisé, le rendu ne suivrait plus les erreurs.
  "use no memo";
  const [state, formAction, isPending] = useActionState<ConfirmMineFormState, FormData>(
    confirmMineFormAction,
    initialConfirmMineFormState,
  );
  const form = useForm<z.input<typeof confirmMineSchema>>({
    resolver: zodResolver(confirmMineSchema),
    defaultValues: { usages: latest?.usages ?? [], keepAfterLeave: latest?.keepAfterLeave ?? false, password: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const { register, setValue, setError, control, formState } = form;
  const [usages, keep] = useWatch({ control, name: ["usages", "keepAfterLeave"] });

  useEffect(() => {
    if (state.status === "success") {
      void onDone();
      return;
    }
    if (state.status === "error" && state.fieldErrors?.password) {
      setError("password", { type: "server", message: state.fieldErrors.password });
    }
  }, [state, onDone, setError]);

  const errMsg = state.status === "error" && !state.fieldErrors ? state.error : null;

  return (
    <form action={formAction} onSubmit={submitWith(form, formAction)} noValidate className="mt-3 space-y-4">
      <p className="text-gray-600">
        Pour chaque usage, choisissez Oui ou Non. L&apos;autorisation est facultative : la refuser ne change rien à
        votre inscription.{" "}
        <button type="button" onClick={onText} className="text-emerald-700 underline">
          Lire le texte complet de l&apos;autorisation
        </button>
      </p>
      <ConsentChoicesFields
        usages={usages}
        onUsages={(v) => setValue("usages", v)}
        keep={keep ?? false}
        onKeep={(v) => setValue("keepAfterLeave", v)}
        subject="self"
      />

      <label className="flex max-w-xs flex-col gap-1">
        <span className="font-medium">Votre mot de passe, pour signer</span>
        <input
          type="password"
          autoComplete="current-password"
          className="rounded border border-gray-300 px-2 py-1.5"
          {...register("password")}
        />
        {formState.errors.password && <span className="text-red-600">{formState.errors.password.message}</span>}
      </label>

      {errMsg && <p className="text-red-600">{errMsg}</p>}
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-emerald-600 px-3 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {isPending ? "Enregistrement…" : "Je confirme mes choix"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-md border border-gray-300 px-3 py-2">
          Annuler
        </button>
      </div>
    </form>
  );
}

/** Mineur : ses souhaits, envoyés à son parent (server action requestGuardianFormAction). */
function MinorWishesForm({
  start,
  onText,
  onCancel,
  onDone,
}: {
  start: Choices;
  onText: () => void;
  onCancel: () => void;
  onDone: () => Promise<void>;
}): JSX.Element {
  // Hors du React Compiler : react-hook-form signale ses changements par un proxy (`formState`)
  // que le compilateur ne voit pas ; mémorisé, le rendu ne suivrait plus les erreurs.
  "use no memo";
  const [state, formAction, isPending] = useActionState<RequestGuardianFormState, FormData>(
    requestGuardianFormAction,
    initialRequestGuardianFormState,
  );
  const form = useForm<z.input<typeof requestGuardianSchema>>({
    resolver: zodResolver(requestGuardianSchema),
    defaultValues: { usages: start?.usages ?? [], keepAfterLeave: start?.keepAfterLeave ?? false },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const { setValue, control } = form;
  const [usages, keep] = useWatch({ control, name: ["usages", "keepAfterLeave"] });

  useEffect(() => {
    if (state.status === "success") void onDone();
  }, [state, onDone]);

  const errMsg = state.status === "error" ? state.error : null;

  return (
    <form action={formAction} onSubmit={submitWith(form, formAction)} noValidate className="mt-3 space-y-4">
      <p className="text-gray-600">
        Pour chaque usage, choisissez Oui ou Non : ce sont vos souhaits, votre parent décide.{" "}
        <button type="button" onClick={onText} className="text-emerald-700 underline">
          Lire le texte complet de l&apos;autorisation
        </button>
      </p>
      <ConsentChoicesFields
        usages={usages}
        onUsages={(v) => setValue("usages", v)}
        keep={keep ?? false}
        onKeep={(v) => setValue("keepAfterLeave", v)}
        subject="self"
      />
      {errMsg && <p className="text-red-600">{errMsg}</p>}
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {isPending ? "Envoi…" : "Envoyer à mon parent"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-md border border-gray-300 px-3 py-2">
          Annuler
        </button>
      </div>
    </form>
  );
}
