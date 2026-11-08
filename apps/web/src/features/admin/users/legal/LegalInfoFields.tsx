"use client";

import type { JSX } from "react";

import { LEGAL_AGE_LABEL, type LegalAgeValue } from "@contracts/legal/imageConsent";

/** Majorité et parent référent, tels que saisis dans le formulaire (chaînes vides = non renseigné). */
export type LegalInfoValue = {
  legalAge: LegalAgeValue | null;
  birthDate: string;
  guardianName: string;
  guardianEmail: string;
  /** Qualité du parent vis-à-vis du membre (« mère », « père », « tuteur »…). */
  guardianRelation: string;
};

export const EMPTY_LEGAL_INFO: LegalInfoValue = {
  legalAge: null,
  birthDate: "",
  guardianName: "",
  guardianEmail: "",
  guardianRelation: "",
};

/** Charge utile de `user.create` / `user.setLegalInfo`. */
export function toLegalInput(v: LegalInfoValue & { legalAge: LegalAgeValue }) {
  return {
    legalAge: v.legalAge,
    birthDate: v.birthDate || null,
    guardianName: v.guardianName.trim() || null,
    guardianEmail: v.guardianEmail.trim() || null,
    guardianRelation: v.guardianRelation.trim() || null,
  };
}

/** Création : un mineur exige date de naissance, nom et adresse du parent. Renvoie l'erreur ou null. */
export function legalInfoError(v: LegalInfoValue): string | null {
  if (!v.legalAge || v.legalAge === "UNKNOWN") return "Indique si le membre est majeur ou mineur.";
  if (v.legalAge === "MINOR") {
    if (!v.birthDate) return "Pour un mineur, la date de naissance est obligatoire.";
    if (!v.guardianName.trim()) return "Pour un mineur, le nom du parent référent est obligatoire.";
    if (!v.guardianEmail.trim()) return "Pour un mineur, l'adresse e-mail du parent référent est obligatoire.";
  }
  return null;
}

const input = "rounded border border-input bg-background px-2 py-1";

/**
 * Majorité d'un membre et, pour un mineur, date de naissance et parent référent. Saisis par un
 * instructeur administrateur (dossier MJC, ou auprès du parent lui-même), jamais par le membre.
 * `allowUnknown` : la fiche d'un compte existant peut rester « non renseignée » le temps du tri.
 */
export function LegalInfoFields({
  value,
  onChange,
  allowUnknown = false,
  disabled = false,
}: {
  value: LegalInfoValue;
  onChange: (v: LegalInfoValue) => void;
  allowUnknown?: boolean;
  disabled?: boolean;
}): JSX.Element {
  const ages: LegalAgeValue[] = allowUnknown ? ["UNKNOWN", "ADULT", "MINOR"] : ["ADULT", "MINOR"];
  const minor = value.legalAge === "MINOR";
  const set = (patch: Partial<LegalInfoValue>): void => onChange({ ...value, ...patch });

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex flex-wrap gap-4" role="radiogroup" aria-label="Majorité">
        {ages.map((a) => (
          <label key={a} className="flex cursor-pointer items-center gap-1.5">
            <input
              type="radio"
              name="legalAge"
              checked={value.legalAge === a}
              disabled={disabled}
              onChange={() => set({ legalAge: a })}
            />
            {LEGAL_AGE_LABEL[a]}
          </label>
        ))}
      </div>

      <label className="flex flex-col gap-1">
        <span className="font-medium">
          Date de naissance{minor ? " (obligatoire)" : " (facultative)"}
        </span>
        <input
          type="date"
          value={value.birthDate}
          disabled={disabled}
          onChange={(e) => set({ birthDate: e.target.value })}
          className={`${input} max-w-[12rem]`}
        />
        <span className="text-xs text-muted-foreground">
          Saisie ici, elle n&apos;est plus modifiable par le membre.
        </span>
      </label>

      {minor && (
        <fieldset className="flex flex-col gap-2 rounded border border-border p-3">
          <legend className="px-1 font-medium">Parent référent</legend>
          <p className="text-xs text-muted-foreground">
            Il autorise le droit à l&apos;image pour le mineur. De préférence, demande-lui son adresse en personne, en
            lui expliquant qu&apos;elle ne sert qu&apos;à cette autorisation.
          </p>
          <label className="flex flex-col gap-1">
            <span>Nom et prénom</span>
            <input
              value={value.guardianName}
              disabled={disabled}
              onChange={(e) => set({ guardianName: e.target.value })}
              className={input}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span>Qualité (mère, père, tuteur…)</span>
            <input
              value={value.guardianRelation}
              disabled={disabled}
              list="guardian-relations"
              onChange={(e) => set({ guardianRelation: e.target.value })}
              className={`${input} max-w-[16rem]`}
            />
            <datalist id="guardian-relations">
              {["mère", "père", "tutrice", "tuteur"].map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </label>
          <label className="flex flex-col gap-1">
            <span>Adresse e-mail</span>
            <input
              type="email"
              value={value.guardianEmail}
              disabled={disabled}
              onChange={(e) => set({ guardianEmail: e.target.value })}
              className={input}
            />
          </label>
        </fieldset>
      )}
    </div>
  );
}
