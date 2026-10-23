"use client";

import { useState, type JSX } from "react";
import { FileDown, PenLine } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import { IMAGE_USAGE_LABEL, IMAGE_USAGE_VALUES, type ImageUsageValue } from "@contracts/legal/imageConsent";
import { BlankConsentFormPreview } from "@features/image-consent/BlankConsentFormCard";

/** Libellés des usages, tels que sur le formulaire papier. */
const USAGE_DETAIL: Record<ImageUsageValue, string> = {
  MEMBER_SPACE: "galeries réservées aux membres connectés",
  PUBLIC_SITE: "visible par tous",
  SOCIAL_NETWORKS: "pages ou comptes officiels du club",
  PRINT: "affiches, plaquettes, supports de la MJC de Chambéry",
  PRESS: "lors d'un article sur le club ou d'une manifestation",
};

/**
 * Profil : autorisation de droit à l'image EN LIGNE.
 * - Majeur : il coche chaque usage (Oui / Non) et le choix après le départ, puis confirme avec son
 *   mot de passe ; le club reçoit un avis, et le récapitulatif PDF rejoint ses formulaires.
 * - Mineur : l'autorisation vient de son parent référent ; la page dit ce qui manque au club.
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
    <a href="/api/media/image-consent/prefilled" className="inline-flex items-center gap-1.5 text-emerald-700 hover:underline">
      <FileDown className="h-4 w-4" />
      Formulaire pré-rempli à imprimer
    </a>
  ) : null;

  if (s.legalAge === "MINOR") {
    return (
      <div className="rounded-lg border border-border p-4 text-sm">
        <p className="font-semibold">Autorisation par votre parent référent</p>
        <p className="mt-1 text-gray-600">
          Vous êtes mineur : c&apos;est votre parent référent qui autorise l&apos;usage de votre image
          {s.guardianEmailMasked ? <> (adresse enregistrée par le club : {s.guardianEmailMasked})</> : null}.
        </p>
        {s.missing.length > 0 ? (
          <p className="mt-2 text-amber-800">
            Le club doit d&apos;abord renseigner : {s.missing.join(", ")}. Parlez-en à un instructeur.
          </p>
        ) : (
          <p className="mt-2 text-gray-600">
            Votre parent peut remplir et signer le formulaire pré-rempli, à remettre à un instructeur.
          </p>
        )}
        {prefilled && <p className="mt-3">{prefilled}</p>}
      </div>
    );
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
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-gray-500">
                <th className="py-1 font-normal">Usage</th>
                <th className="w-14 py-1 text-center font-normal">Oui</th>
                <th className="w-14 py-1 text-center font-normal">Non</th>
              </tr>
            </thead>
            <tbody>
              {IMAGE_USAGE_VALUES.map((u) => {
                const yes = usages.includes(u);
                const set = (v: boolean): void =>
                  setUsages((prev) => (v ? [...prev.filter((x) => x !== u), u] : prev.filter((x) => x !== u)));
                return (
                  <tr key={u} className="border-t border-border">
                    <td className="py-2">
                      <span className="font-medium">{IMAGE_USAGE_LABEL[u]}</span>
                      <span className="block text-xs text-gray-500">{USAGE_DETAIL[u]}</span>
                    </td>
                    <td className="text-center">
                      <input type="radio" name={`usage-${u}`} aria-label={`${IMAGE_USAGE_LABEL[u]} : oui`} checked={yes} onChange={() => set(true)} />
                    </td>
                    <td className="text-center">
                      <input type="radio" name={`usage-${u}`} aria-label={`${IMAGE_USAGE_LABEL[u]} : non`} checked={!yes} onChange={() => set(false)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <fieldset className="space-y-1.5">
            <legend className="mb-1 font-medium">Après mon départ du club</legend>
            <label className="flex items-start gap-2">
              <input type="radio" name="keep" className="mt-1" checked={!keep} onChange={() => setKeep(false)} />
              <span>Les photos et vidéos où j&apos;apparais sont retirées et supprimées au plus tard un an après mon départ.</span>
            </label>
            <label className="flex items-start gap-2">
              <input type="radio" name="keep" className="mt-1" checked={keep} onChange={() => setKeep(true)} />
              <span>
                Le club peut continuer à utiliser celles déjà prises, pour les seuls usages cochés, afin de garder la
                mémoire de sa vie. Je peux retirer cet accord à tout moment.
              </span>
            </label>
          </fieldset>

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
