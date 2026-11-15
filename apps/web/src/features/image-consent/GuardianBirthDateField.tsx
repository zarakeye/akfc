"use client";

import type { JSX } from "react";

import { ageOn } from "@akfc/contracts/legal/imageConsent.ts";

/** La date saisie fait-elle du membre un majeur ? (date invalide ou vide : non) */
export function isAdultBirthDate(value: string, now: Date = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d <= now && ageOn(d, now) >= 18;
}

/**
 * Date de naissance saisie par le parent d'un mineur (pages du parent : droit à l'image, date
 * seule). Une date qui fait du membre un MAJEUR affiche une alerte : une faute de frappe le ferait
 * sortir de l'autorité de son parent. Le parent corrige la date, ou coche « Je confirme » ; le
 * serveur refait le contrôle.
 */
export function GuardianBirthDateField({
  memberName,
  label,
  value,
  onChange,
  confirmAdult,
  onConfirmAdult,
  hint,
  adultConsequence,
}: {
  memberName: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  confirmAdult: boolean;
  onConfirmAdult: (v: boolean) => void;
  hint?: string;
  /** Ce que la confirmation entraîne, propre à la page. */
  adultConsequence: string;
}): JSX.Element {
  const adult = isAdultBirthDate(value);
  return (
    <div className="space-y-2">
      <label className="flex max-w-xs flex-col gap-1">
        <span className="font-medium">{label}</span>
        <input
          type="date"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            onConfirmAdult(false);
          }}
          className="rounded border border-gray-300 px-2 py-1.5"
        />
        {hint && <span className="text-xs text-gray-500">{hint}</span>}
      </label>
      {adult && (
        <div className="space-y-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900" role="alert">
          <p>
            À cette date, {memberName} a 18 ans ou plus : il est <strong>majeur</strong>. Est-ce bien sa date de naissance ?
          </p>
          <p>{adultConsequence}</p>
          <label className="flex items-start gap-2">
            <input type="checkbox" className="mt-1" checked={confirmAdult} onChange={(e) => onConfirmAdult(e.target.checked)} />
            <span>Je confirme cette date de naissance.</span>
          </label>
        </div>
      )}
    </div>
  );
}
