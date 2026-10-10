"use client";

import { useState, type JSX } from "react";
import { Plus, Trash2 } from "lucide-react";

import { trpc } from "@/core/trpc/trpcClient";
import {
  parseSitePhones,
  saveSiteContactSchema,
  SITE_PHONES_MAX,
  type SitePhone,
} from "@contracts/siteContact/siteContact.schema";

/**
 * Réglages du site → « Coordonnées publiques » : ce que le public et les partenaires voient sur
 * « Nous contacter » (e-mail du club, téléphones joignables en appel et/ou sur WhatsApp, adresse).
 * Un champ vide n'est pas affiché.
 */

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none";

export function ContactSettings(): JSX.Element {
  const settings = trpc.siteSettings.get.useQuery();
  return (
    <section className="mt-12 border-t border-gray-200 pt-8">
      <h2 className="mb-1 text-xl font-semibold">Coordonnées publiques</h2>
      <p className="mb-6 text-sm text-gray-600">
        Affichées à tous sur la page «&nbsp;Nous contacter&nbsp;» : c&apos;est ainsi que le public et les
        partenaires joignent l&apos;association. Le formulaire de demandes, lui, est réservé aux membres
        connectés. Un champ laissé vide n&apos;est pas affiché.
      </p>
      {settings.isPending ? (
        <p className="text-sm text-gray-500">Chargement…</p>
      ) : (
        <ContactSettingsForm
          initialEmail={settings.data?.contactEmail ?? ""}
          initialAddress={settings.data?.contactAddress ?? ""}
          initialPhones={parseSitePhones(settings.data?.contactPhones)}
        />
      )}
    </section>
  );
}

const EMPTY_PHONE: SitePhone = { label: "", number: "", call: true, whatsapp: false };

function ContactSettingsForm(props: {
  initialEmail: string;
  initialAddress: string;
  initialPhones: SitePhone[];
}): JSX.Element {
  const utils = trpc.useUtils();
  const save = trpc.siteSettings.saveContact.useMutation({
    onSuccess: () => utils.siteSettings.get.invalidate(),
  });
  const [email, setEmail] = useState(props.initialEmail);
  const [address, setAddress] = useState(props.initialAddress);
  const [phones, setPhones] = useState<SitePhone[]>(props.initialPhones);

  const input = { contactEmail: email, contactAddress: address, contactPhones: phones };
  const check = saveSiteContactSchema.safeParse(input);
  const problem = check.success ? null : (check.error.issues[0]?.message ?? "Saisie invalide");

  const setPhone = (i: number, patch: Partial<SitePhone>): void => {
    save.reset();
    setPhones((list) => list.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  };

  return (
    <div className="space-y-5">
      <label className="block">
        <span className="mb-1 block text-sm font-medium">E-mail du club</span>
        <input
          type="email"
          className={inputClass}
          value={email}
          onChange={(e) => {
            save.reset();
            setEmail(e.target.value);
          }}
          placeholder="contact@akfc.fr"
        />
      </label>

      <fieldset>
        <legend className="mb-1 text-sm font-medium">Téléphones</legend>
        <p className="mb-3 text-xs text-gray-500">
          Pour chaque numéro, indiquez s&apos;il répond aux appels, sur WhatsApp, ou les deux. Le libellé est
          facultatif (ex. «&nbsp;Bureau&nbsp;», «&nbsp;Président&nbsp;»). N&apos;indiquez que des numéros que
          leurs titulaires acceptent de rendre publics.
        </p>
        <ul className="space-y-3">
          {phones.map((p, i) => (
            <li key={i} className="flex flex-wrap items-center gap-3 rounded-md border border-gray-200 p-3">
              <input
                className={`${inputClass} max-w-40`}
                value={p.label}
                maxLength={60}
                onChange={(e) => setPhone(i, { label: e.target.value })}
                placeholder="Libellé"
                aria-label={`Libellé du numéro ${i + 1}`}
              />
              <input
                type="tel"
                className={`${inputClass} max-w-48`}
                value={p.number}
                onChange={(e) => setPhone(i, { number: e.target.value })}
                placeholder="06 12 34 56 78"
                aria-label={`Numéro ${i + 1}`}
              />
              <label className="inline-flex items-center gap-1.5 text-sm">
                <input type="checkbox" className="accent-emerald-600" checked={p.call} onChange={(e) => setPhone(i, { call: e.target.checked })} />
                Appel
              </label>
              <label className="inline-flex items-center gap-1.5 text-sm">
                <input type="checkbox" className="accent-emerald-600" checked={p.whatsapp} onChange={(e) => setPhone(i, { whatsapp: e.target.checked })} />
                WhatsApp
              </label>
              <button
                type="button"
                title="Retirer ce numéro"
                aria-label={`Retirer le numéro ${i + 1}`}
                onClick={() => {
                  save.reset();
                  setPhones((list) => list.filter((_, j) => j !== i));
                }}
                className="ml-auto rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
        {phones.length < SITE_PHONES_MAX && (
          <button
            type="button"
            onClick={() => {
              save.reset();
              setPhones((list) => [...list, { ...EMPTY_PHONE }]);
            }}
            className="mt-3 inline-flex items-center gap-1 text-sm text-emerald-700 hover:underline"
          >
            <Plus className="h-4 w-4" /> Ajouter un numéro
          </button>
        )}
      </fieldset>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Adresse</span>
        <textarea
          className={`${inputClass} min-h-24 resize-y`}
          value={address}
          maxLength={500}
          onChange={(e) => {
            save.reset();
            setAddress(e.target.value);
          }}
          placeholder={"MJC de Chambéry\n311 Faubourg Montmélian\n73000 Chambéry"}
        />
        <span className="mt-1 block text-xs text-gray-400">Une ligne par élément.</span>
      </label>

      <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
        <button
          type="button"
          disabled={problem !== null || save.isPending}
          onClick={() => check.success && save.mutate(check.data)}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          {save.isPending ? "Enregistrement…" : "Enregistrer les coordonnées"}
        </button>
        {problem && <span className="text-sm text-amber-700">{problem}</span>}
        {save.isSuccess && <span className="text-sm text-emerald-700">Enregistré.</span>}
        {save.error && <span className="text-sm text-red-600">{save.error.message}</span>}
      </div>
    </div>
  );
}
