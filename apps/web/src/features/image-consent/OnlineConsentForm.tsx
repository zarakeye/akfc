"use client";

import { useState, type JSX } from "react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@backend/modules";
import { FileDown, PenLine, Send } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import type { ImageUsageValue } from "@contracts/legal/imageConsent";
import { BlankConsentFormPreview } from "@features/image-consent/BlankConsentFormCard";
import { ConsentChoicesFields } from "@features/image-consent/ConsentChoicesFields";
import { formatDate } from "@features/image-consent/consentFormat";

/**
 * Profil : autorisation de droit à l'image EN LIGNE.
 * - Majeur : il coche chaque usage (Oui / Non) et le choix après le départ, puis confirme avec son
 *   mot de passe ; le club reçoit un avis, et le récapitulatif PDF rejoint ses formulaires.
 * - Mineur : il indique ses SOUHAITS ; un lien personnel part à son parent référent, qui valide
 *   (page /autorisation-parent/…). La page dit ce qui manque au club, et où en est la demande.
 * - Majorité non renseignée : le formulaire papier, en attendant.
 * Le formulaire pré-rempli à imprimer est proposé dès que les informations le permettent.
 */
export function OnlineConsentForm({ latest }: { latest: { usages: ImageUsageValue[]; keepAfterLeave: boolean | null } | null }): JSX.Element | null {
  const utils = trpc.useUtils();
  const state = trpc.imageConsent.onlineState.useQuery();
  const confirm = trpc.imageConsent.confirmMine.useMutation({
    onSuccess: async () => {
      setOpen(false);
      setPassword("");
      await Promise.all([utils.imageConsent.mine.invalidate(), utils.imageConsent.onlineState.invalidate()]);
    },
  });
  const [open, setOpen] = useState(false);
  const [textOpen, setTextOpen] = useState(false);
  const [usages, setUsages] = useState<ImageUsageValue[]>(latest?.usages ?? []);
  const [keep, setKeep] = useState<boolean>(latest?.keepAfterLeave ?? false);
  const [password, setPassword] = useState("");

  const s = state.data;
  if (!s) return null;

  const prefilled = s.canDownloadPrefilled ? (
    // Téléchargement d'un PDF servi par une route d'API, pas une page : <Link> (navigation
    // côté client) ne convient pas, un vrai lien <a> si.
    // eslint-disable-next-line @next/next/no-html-link-for-pages
    <a href="/api/media/image-consent/prefilled" className="inline-flex items-center gap-1.5 text-emerald-700 hover:underline">
      <FileDown className="h-4 w-4" />
      Formulaire pré-rempli à imprimer
    </a>
  ) : null;

  if (s.legalAge === "MINOR") {
    return <MinorWishes state={s} latest={latest} prefilled={prefilled} onText={() => setTextOpen(true)} textOpen={textOpen} onCloseText={() => setTextOpen(false)} />;
  }

  if (s.legalAge === "UNKNOWN") {
    return (
      <div className="rounded-lg border border-border p-4 text-sm text-gray-600">
        Le club n&apos;a pas encore renseigné votre majorité : en attendant, l&apos;autorisation se donne par le
        formulaire papier, à remettre signé à un instructeur.
        {prefilled && <p className="mt-3">{prefilled}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border p-4 text-sm">
      <p className="font-semibold">Donner ou modifier votre autorisation en ligne</p>
      {!s.canConfirmOnline ? (
        <p className="mt-1 text-amber-800">Renseignez d&apos;abord vos nom et prénom dans votre profil.</p>
      ) : !open ? (
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 font-medium text-white hover:bg-emerald-700"
          >
            <PenLine className="h-4 w-4" />
            {latest ? "Modifier mes choix" : "Donner mon autorisation"}
          </button>
          {prefilled}
        </div>
      ) : (
        <form
          className="mt-3 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            confirm.mutate({ usages, keepAfterLeave: keep, password });
          }}
        >
          <p className="text-gray-600">
            Pour chaque usage, choisissez Oui ou Non. L&apos;autorisation est facultative : la refuser ne change rien à
            votre inscription.{" "}
            <button type="button" onClick={() => setTextOpen(true)} className="text-emerald-700 underline">
              Lire le texte complet de l&apos;autorisation
            </button>
          </p>
          <ConsentChoicesFields usages={usages} onUsages={setUsages} keep={keep} onKeep={setKeep} subject="self" />

          <label className="flex max-w-xs flex-col gap-1">
            <span className="font-medium">Votre mot de passe, pour signer</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded border border-gray-300 px-2 py-1.5"
            />
          </label>

          {confirm.error && <p className="text-red-600">{confirm.error.message}</p>}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={confirm.isPending || password === ""}
              className="rounded-md bg-emerald-600 px-3 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {confirm.isPending ? "Enregistrement…" : "Je confirme mes choix"}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="rounded-md border border-gray-300 px-3 py-2">
              Annuler
            </button>
          </div>
        </form>
      )}
      {confirm.isSuccess && !open && (
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
  prefilled,
  onText,
  textOpen,
  onCloseText,
}: {
  state: OnlineState;
  latest: { usages: ImageUsageValue[]; keepAfterLeave: boolean | null } | null;
  prefilled: JSX.Element | null;
  onText: () => void;
  textOpen: boolean;
  onCloseText: () => void;
}): JSX.Element {
  const utils = trpc.useUtils();
  const pending = s.pendingGuardian;
  const start = pending ?? latest;
  const [open, setOpen] = useState(false);
  const [usages, setUsages] = useState<ImageUsageValue[]>(start?.usages ?? []);
  const [keep, setKeep] = useState<boolean>(start?.keepAfterLeave ?? false);
  const send = trpc.imageConsent.requestGuardian.useMutation({
    onSuccess: async () => {
      setOpen(false);
      await utils.imageConsent.onlineState.invalidate();
    },
  });

  return (
    <div className="rounded-lg border border-border p-4 text-sm">
      <p className="font-semibold">Autorisation par votre parent référent</p>
      <p className="mt-1 text-gray-600">
        Vous êtes mineur : c&apos;est votre parent référent qui autorise l&apos;usage de votre image
        {s.guardianEmailMasked ? <> (adresse enregistrée par le club : {s.guardianEmailMasked})</> : null}. Vous indiquez vos
        souhaits ; il les reçoit pré-cochés, peut les modifier, puis valide.
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
        <form
          className="mt-3 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            send.mutate({ usages, keepAfterLeave: keep });
          }}
        >
          <p className="text-gray-600">
            Pour chaque usage, choisissez Oui ou Non : ce sont vos souhaits, votre parent décide.{" "}
            <button type="button" onClick={onText} className="text-emerald-700 underline">
              Lire le texte complet de l&apos;autorisation
            </button>
          </p>
          <ConsentChoicesFields usages={usages} onUsages={setUsages} keep={keep} onKeep={setKeep} subject="self" />
          {send.error && <p className="text-red-600">{send.error.message}</p>}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={send.isPending}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {send.isPending ? "Envoi…" : "Envoyer à mon parent"}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="rounded-md border border-gray-300 px-3 py-2">
              Annuler
            </button>
          </div>
        </form>
      )}
      {prefilled && <p className="mt-3 text-gray-600">Version papier : {prefilled}</p>}
      {textOpen && <BlankConsentFormPreview onClose={onCloseText} />}
    </div>
  );
}
