"use client";

import { useState, type JSX } from "react";
import Link from "next/link";

import { trpc } from "@/core/trpc/trpcClient";
import {
  saveLegalSettingsSchema,
  STORAGE_REGION_LABEL,
  type SaveLegalSettingsInput,
  type StorageRegion,
} from "@contracts/legal/legalSettings.schema";

/**
 * Réglages du site → « Informations légales » : éditeur et coordonnées légales (siège, téléphone,
 * e-mail), directeur de la publication, hébergeur, région du stockage, crédits, durées de
 * conservation. Les pages « Mentions légales » et « Politique de confidentialité » et le registre
 * des traitements sont GÉNÉRÉS depuis ces seuls champs : les coordonnées publiques (« Nous
 * contacter ») peuvent différer et n'y figurent jamais.
 */

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none";

type Settings = Record<string, unknown> | null | undefined;
const str = (s: Settings, k: string): string => (typeof s?.[k] === "string" ? (s[k] as string) : "");
const num = (s: Settings, k: string, d: number): number => (typeof s?.[k] === "number" ? (s[k] as number) : d);

function initialOf(s: Settings): SaveLegalSettingsInput {
  const region = str(s, "storageRegion");
  return {
    legalName: str(s, "legalName"),
    legalRna: str(s, "legalRna"),
    legalSiret: str(s, "legalSiret"),
    legalAddress: str(s, "legalAddress"),
    legalPhone: str(s, "legalPhone"),
    legalEmail: str(s, "legalEmail"),
    publicationDirector: str(s, "publicationDirector"),
    publicationDirectorTitle: str(s, "publicationDirectorTitle"),
    hostName: str(s, "hostName"),
    hostAddress: str(s, "hostAddress"),
    hostPhone: str(s, "hostPhone"),
    hostUrl: str(s, "hostUrl"),
    storageRegion: (region === "EU" || region === "GLOBAL" ? region : "") as StorageRegion,
    credits: str(s, "credits"),
    accountRetentionMonths: num(s, "accountRetentionMonths", 12),
    ticketRetentionMonths: num(s, "ticketRetentionMonths", 36),
    backupRetentionDays: typeof s?.backupRetentionDays === "number" ? (s.backupRetentionDays as number) : null,
  };
}

export function LegalSettings(): JSX.Element {
  const settings = trpc.siteSettings.get.useQuery();
  return (
    <section className="mt-12 border-t border-gray-200 pt-8" data-tour="settings.legal">
      <h2 className="mb-1 text-xl font-semibold">Informations légales</h2>
      <p className="mb-6 text-sm text-gray-600">
        Les pages{" "}
        <Link href="/infos/mentions-legales" className="text-emerald-700 hover:underline" target="_blank">
          Mentions légales
        </Link>{" "}
        et{" "}
        <Link href="/infos/confidentialite" className="text-emerald-700 hover:underline" target="_blank">
          Politique de confidentialité
        </Link>{" "}
        sont générées à partir de ces seuls champs. Les coordonnées publiques («&nbsp;Nous contacter&nbsp;»)
        n&apos;y figurent pas : le même numéro peut être saisi aux deux endroits. Un champ vide y apparaît
        «&nbsp;en cours de renseignement&nbsp;». Pour y ajouter un texte libre : Pages éditoriales,
        pages «&nbsp;mentions-legales&nbsp;» et «&nbsp;confidentialite&nbsp;».
      </p>
      {settings.isPending ? (
        <p className="text-sm text-gray-500">Chargement…</p>
      ) : (
        <LegalSettingsForm initial={initialOf(settings.data as Settings)} />
      )}
    </section>
  );
}

function LegalSettingsForm({ initial }: { initial: SaveLegalSettingsInput }): JSX.Element {
  const utils = trpc.useUtils();
  const save = trpc.siteSettings.saveLegal.useMutation({ onSuccess: () => utils.siteSettings.get.invalidate() });
  const [v, setV] = useState<SaveLegalSettingsInput>(initial);
  const set = <K extends keyof SaveLegalSettingsInput>(k: K, value: SaveLegalSettingsInput[K]): void => {
    save.reset();
    setV((prev) => ({ ...prev, [k]: value }));
  };
  const check = saveLegalSettingsSchema.safeParse(v);
  const problem = check.success ? null : (check.error.issues[0]?.message ?? "Saisie invalide");

  const field = (k: "legalName" | "legalRna" | "legalSiret" | "legalPhone" | "legalEmail" | "publicationDirector" | "publicationDirectorTitle" | "hostName" | "hostAddress" | "hostPhone" | "hostUrl", label: string, hint?: string, placeholder?: string): JSX.Element => (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <input className={inputClass} value={v[k]} placeholder={placeholder} onChange={(e) => set(k, e.target.value)} />
      {hint && <span className="mt-1 block text-xs text-gray-400">{hint}</span>}
    </label>
  );
  const monthsField = (k: "accountRetentionMonths" | "ticketRetentionMonths", label: string, hint: string): JSX.Element => (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <span className="flex items-center gap-2">
        <input type="number" min={1} max={120} className={`${inputClass} max-w-24`} value={v[k]} onChange={(e) => set(k, Number(e.target.value))} />
        <span className="text-sm text-gray-600">mois</span>
      </span>
      <span className="mt-1 block text-xs text-gray-400">{hint}</span>
    </label>
  );

  return (
    <div className="space-y-8">
      <fieldset className="space-y-4">
        <legend className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Éditeur</legend>
        {field("legalName", "Dénomination exacte", "Telle qu'écrite dans les statuts.")}
        <div className="grid gap-4 sm:grid-cols-2">
          {field("legalRna", "Numéro RNA", "W suivi de 9 chiffres (récépissé de déclaration).", "W731234567")}
          {field("legalSiret", "SIRET (facultatif)", "Seulement si l'association en a un.")}
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Siège social</span>
          <textarea
            className={`${inputClass} min-h-16 resize-y`}
            value={v.legalAddress}
            maxLength={300}
            placeholder={"3 rue de la Trésorerie\n73000 Chambéry"}
            onChange={(e) => set("legalAddress", e.target.value)}
          />
          <span className="mt-1 block text-xs text-gray-400">
            Celui des statuts, pas forcément le lieu des cours. Une ligne par élément.
          </span>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          {field(
            "legalPhone",
            "Téléphone de l'association",
            "Obligatoire dans les mentions légales. Il peut différer des numéros de « Nous contacter ».",
            "04 79 00 00 00",
          )}
          {field("legalEmail", "E-mail de l'association", "Cité pour les demandes légales et RGPD.", "contact@akfc.fr")}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {field("publicationDirector", "Directeur de la publication", "En pratique le président ou la présidente.", "Prénom Nom")}
          {field("publicationDirectorTitle", "Sa qualité", undefined, "présidente de l'association")}
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Hébergeur</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          {field("hostName", "Nom")}
          {field("hostPhone", "Téléphone")}
        </div>
        {field("hostAddress", "Adresse")}
        {field("hostUrl", "Site web")}
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Région du stockage des documents (Cloudflare R2)</span>
          <select className={inputClass} value={v.storageRegion} onChange={(e) => set("storageRegion", e.target.value as StorageRegion)}>
            <option value="">Non renseignée</option>
            {(Object.keys(STORAGE_REGION_LABEL) as Array<keyof typeof STORAGE_REGION_LABEL>).map((r) => (
              <option key={r} value={r}>
                {STORAGE_REGION_LABEL[r]}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs text-gray-400">Visible dans le tableau de bord Cloudflare, réglages du bucket.</span>
        </label>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Durées de conservation</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          {monthsField("accountRetentionMonths", "Comptes des anciens membres", "Après la fin de la dernière adhésion.")}
          {monthsField("ticketRetentionMonths", "Demandes et messages", "Après le dernier échange ; les demandes closes sont ensuite supprimées.")}
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Sauvegardes</span>
          <span className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={3650}
              className={`${inputClass} max-w-24`}
              value={v.backupRetentionDays ?? ""}
              onChange={(e) => set("backupRetentionDays", e.target.value === "" ? null : Number(e.target.value))}
            />
            <span className="text-sm text-gray-600">jours</span>
          </span>
          <span className="mt-1 block text-xs text-gray-400">Durée pendant laquelle une sauvegarde nocturne est gardée.</span>
        </label>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Crédits</legend>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Conception et réalisation (facultatif)</span>
          <textarea className={`${inputClass} min-h-16 resize-y`} value={v.credits} maxLength={500} onChange={(e) => set("credits", e.target.value)} />
        </label>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
        <button
          type="button"
          disabled={problem !== null || save.isPending}
          onClick={() => check.success && save.mutate(check.data)}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          {save.isPending ? "Enregistrement…" : "Enregistrer les informations légales"}
        </button>
        {problem && <span className="text-sm text-amber-700">{problem}</span>}
        {save.isSuccess && <span className="text-sm text-emerald-700">Enregistré : les pages légales sont à jour.</span>}
        {save.error && <span className="text-sm text-red-600">{save.error.message}</span>}
      </div>
    </div>
  );
}
