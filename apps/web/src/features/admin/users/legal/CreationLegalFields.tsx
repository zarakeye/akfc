"use client";

import type { JSX } from "react";

import { ageOn, type LegalAgeValue } from "@akfc/contracts/legal/imageConsent.ts";

/**
 * Création d'un compte : la majorité d'un simple membre. La date de naissance, facultative, décide
 * si elle est donnée ; sinon, on choisit Majeur ou Mineur. Un mineur appelle les coordonnées de son
 * parent référent, qui validera ses choix de droit à l'image.
 */
export type CreationLegalValue = {
  birthDate: string;
  /** Choix sans date de naissance. */
  choice: "ADULT" | "MINOR" | null;
  guardianFirstName: string;
  guardianLastName: string;
  guardianRelation: string;
  guardianEmail: string;
  guardianPhone: string;
};

export const EMPTY_CREATION_LEGAL: CreationLegalValue = {
  birthDate: "",
  choice: null,
  guardianFirstName: "",
  guardianLastName: "",
  guardianRelation: "",
  guardianEmail: "",
  guardianPhone: "",
};

export const GUARDIAN_RELATIONS = ["mère", "père", "tutrice", "tuteur"] as const;

/** Âge à la date du jour, ou null si la date est absente ou invalide. */
export function ageFromInput(birthDate: string, now: Date = new Date()): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return null;
  const d = new Date(`${birthDate}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d > now) return null;
  return ageOn(d, now);
}

/** Majorité qui résulte de la saisie : la date d'abord, le choix ensuite. */
export function creationLegalAge(v: CreationLegalValue): "ADULT" | "MINOR" | null {
  const age = ageFromInput(v.birthDate);
  if (age !== null) return age >= 18 ? "ADULT" : "MINOR";
  return v.choice;
}

/** Ce qui manque avant de créer le compte, ou null. */
export function creationLegalError(v: CreationLegalValue): string | null {
  if (v.birthDate && ageFromInput(v.birthDate) === null) return "Date de naissance invalide.";
  const age = creationLegalAge(v);
  if (!age) return "Renseignez la date de naissance, ou indiquez si le membre est majeur ou mineur.";
  if (age === "MINOR") {
    if (!v.guardianFirstName.trim() || !v.guardianLastName.trim()) return "Indiquez le prénom et le nom du parent.";
    if (!v.guardianRelation.trim()) return "Indiquez la qualité du parent (mère, père…).";
    if (!v.guardianEmail.trim()) return "Indiquez l'adresse e-mail du parent.";
  }
  return null;
}

/** Charge utile `legal` de user.create. */
export function toCreationLegalInput(v: CreationLegalValue): {
  legalAge: LegalAgeValue;
  birthDate: string | null;
  guardianName: string | null;
  guardianEmail: string | null;
  guardianRelation: string | null;
  guardianPhone: string | null;
} {
  const minor = creationLegalAge(v) === "MINOR";
  const name = `${v.guardianFirstName.trim()} ${v.guardianLastName.trim()}`.trim();
  return {
    legalAge: creationLegalAge(v) ?? "UNKNOWN",
    birthDate: v.birthDate || null,
    guardianName: minor ? name || null : null,
    guardianEmail: minor ? v.guardianEmail.trim() || null : null,
    guardianRelation: minor ? v.guardianRelation.trim() || null : null,
    guardianPhone: minor ? v.guardianPhone.trim() || null : null,
  };
}

const input = "rounded border border-input bg-background px-2 py-1";

export function CreationLegalFields({
  value,
  onChange,
}: {
  value: CreationLegalValue;
  onChange: (v: CreationLegalValue) => void;
}): JSX.Element {
  const set = (patch: Partial<CreationLegalValue>): void => onChange({ ...value, ...patch });
  const age = ageFromInput(value.birthDate);
  const legalAge = creationLegalAge(value);

  return (
    <div className="flex flex-col gap-3 text-sm">
      <label className="flex flex-col gap-1">
        <span className="font-medium">Date de naissance (facultative)</span>
        <input
          type="date"
          value={value.birthDate}
          onChange={(e) => set({ birthDate: e.target.value })}
          className={`${input} max-w-[12rem]`}
        />
        <span className="text-xs text-muted-foreground">
          Elle décide de la majorité, et la fait passer d&apos;elle-même à 18 ans. Une fois le compte créé, elle
          n&apos;est plus affichée ici : seul le membre la voit.
        </span>
      </label>

      {age !== null ? (
        <p role="status" className="text-sm">
          {age} ans : <strong>{age >= 18 ? "majeur" : "mineur"}</strong>.
        </p>
      ) : (
        <div className="flex flex-wrap gap-4" role="radiogroup" aria-label="Majorité">
          {(["ADULT", "MINOR"] as const).map((a) => (
            <label key={a} className="flex cursor-pointer items-center gap-1.5">
              <input type="radio" name="legalAge" checked={value.choice === a} onChange={() => set({ choice: a })} />
              {a === "ADULT" ? "Majeur" : "Mineur"}
            </label>
          ))}
        </div>
      )}

      {legalAge === "MINOR" && (
        <fieldset className="flex flex-col gap-2 rounded border border-border p-3">
          <legend className="px-1 font-medium">Parent référent</legend>
          <p className="text-xs text-muted-foreground">
            Il reçoit les choix de droit à l&apos;image de son enfant, et les valide ou les corrige : seule sa réponse
            compte.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span>Prénom</span>
              <input value={value.guardianFirstName} onChange={(e) => set({ guardianFirstName: e.target.value })} className={input} />
            </label>
            <label className="flex flex-col gap-1">
              <span>Nom</span>
              <input value={value.guardianLastName} onChange={(e) => set({ guardianLastName: e.target.value })} className={input} />
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span>Qualité</span>
            <select
              value={value.guardianRelation}
              onChange={(e) => set({ guardianRelation: e.target.value })}
              className={`${input} max-w-[12rem]`}
            >
              <option value="">— Choisir —</option>
              {GUARDIAN_RELATIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span>Adresse e-mail</span>
            <input type="email" value={value.guardianEmail} onChange={(e) => set({ guardianEmail: e.target.value })} className={input} />
          </label>
          <label className="flex flex-col gap-1">
            <span>Téléphone (facultatif)</span>
            <input type="tel" value={value.guardianPhone} onChange={(e) => set({ guardianPhone: e.target.value })} className={`${input} max-w-[14rem]`} />
          </label>
        </fieldset>
      )}
    </div>
  );
}
