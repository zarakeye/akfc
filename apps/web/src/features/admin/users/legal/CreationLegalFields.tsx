"use client";

import type { JSX } from "react";

import {
  GUARDIAN_RELATIONS,
  ageFromInput,
  creationLegalAge,
  type CreationLegalValue,
} from "@akfc/contracts/legal/creationLegal.ts";

const input = "rounded border border-input bg-background px-2 py-1";

/**
 * Création d'un compte : la majorité d'un simple membre (date de naissance, ou Majeur / Mineur, et
 * pour un mineur son parent référent). Les règles sont dans contracts (legal/creationLegal.ts),
 * partagées avec la server action. Chaque champ porte un `name` : le formulaire est envoyé tel quel.
 */

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
          name="birthDate"
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
              <input type="radio" name="legalChoice" value={a} checked={value.choice === a} onChange={() => set({ choice: a })} />
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
              <input name="guardianFirstName" value={value.guardianFirstName} onChange={(e) => set({ guardianFirstName: e.target.value })} className={input} />
            </label>
            <label className="flex flex-col gap-1">
              <span>Nom</span>
              <input name="guardianLastName" value={value.guardianLastName} onChange={(e) => set({ guardianLastName: e.target.value })} className={input} />
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span>Qualité</span>
            <select
              name="guardianRelation"
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
            <input type="email" name="guardianEmail" value={value.guardianEmail} onChange={(e) => set({ guardianEmail: e.target.value })} className={input} />
          </label>
          <label className="flex flex-col gap-1">
            <span>Téléphone (facultatif)</span>
            <input type="tel" name="guardianPhone" value={value.guardianPhone} onChange={(e) => set({ guardianPhone: e.target.value })} className={`${input} max-w-[14rem]`} />
          </label>
        </fieldset>
      )}
    </div>
  );
}
