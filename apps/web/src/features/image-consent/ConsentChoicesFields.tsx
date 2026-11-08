"use client";

import type { JSX } from "react";

import {
  IMAGE_USAGE_LABEL,
  IMAGE_USAGE_VALUES,
  type ConsentChoices,
  type ImageUsageValue,
} from "@contracts/legal/imageConsent";

/** Détail de chaque usage, tel que sur le formulaire papier. */
export const USAGE_DETAIL: Record<ImageUsageValue, string> = {
  MEMBER_SPACE: "galeries réservées aux membres connectés",
  PUBLIC_SITE: "visible par tous",
  SOCIAL_NETWORKS: "pages ou comptes officiels du club",
  PRINT: "affiches, plaquettes, supports de la MJC de Chambéry",
  PRESS: "lors d'un article sur le club ou d'une manifestation",
};

/**
 * Les choix d'une autorisation de droit à l'image : Oui / Non pour chaque usage, puis le choix
 * « après le départ ». Partagé par le membre majeur (qui signe), le mineur (qui indique ses
 * souhaits) et son parent (qui valide).
 * - `subject` : « self » parle à la première personne (« mon départ »), « child » du membre
 *   (« son départ »), pour le parent.
 * - `wishes` : souhaits du membre, montrés en regard (page du parent) ; une ligne dont le choix
 *   s'en écarte est marquée « modifié ».
 */
export function ConsentChoicesFields({
  usages,
  onUsages,
  keep,
  onKeep,
  subject,
  wishes,
}: {
  usages: readonly ImageUsageValue[];
  onUsages: (next: ImageUsageValue[]) => void;
  keep: boolean;
  onKeep: (next: boolean) => void;
  subject: "self" | "child";
  wishes?: ConsentChoices;
}): JSX.Element {
  const self = subject === "self";
  const keepChanged = wishes ? (wishes.keepAfterLeave ?? false) !== keep : false;
  return (
    <>
      <table className="w-full text-left">
        <thead>
          <tr className="text-xs text-gray-500">
            <th className="py-1 font-normal">Usage</th>
            {wishes && <th className="w-24 py-1 text-center font-normal">Souhait du membre</th>}
            <th className="w-14 py-1 text-center font-normal">Oui</th>
            <th className="w-14 py-1 text-center font-normal">Non</th>
          </tr>
        </thead>
        <tbody>
          {IMAGE_USAGE_VALUES.map((u) => {
            const yes = usages.includes(u);
            const wished = wishes?.usages.includes(u);
            const changed = wishes !== undefined && wished !== yes;
            const set = (v: boolean): void =>
              onUsages(v ? [...usages.filter((x) => x !== u), u] : usages.filter((x) => x !== u));
            return (
              <tr key={u} className={`border-t border-border ${changed ? "bg-amber-50" : ""}`}>
                <td className="py-2">
                  <span className="font-medium">{IMAGE_USAGE_LABEL[u]}</span>
                  <span className="block text-xs text-gray-500">{USAGE_DETAIL[u]}</span>
                  {changed && <span className="text-xs font-medium text-amber-800">modifié</span>}
                </td>
                {wishes && <td className="text-center text-gray-600">{wished ? "Oui" : "Non"}</td>}
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

      <fieldset className={`space-y-1.5 ${keepChanged ? "rounded bg-amber-50 p-2" : ""}`}>
        <legend className="mb-1 font-medium">
          {self ? "Après mon départ du club" : "Après le départ du membre"}
          {keepChanged && <span className="ml-2 text-xs font-medium text-amber-800">modifié</span>}
        </legend>
        {wishes && (
          <p className="text-xs text-gray-600">
            Souhait du membre : {wishes.keepAfterLeave === null ? "non précisé" : wishes.keepAfterLeave ? "images conservées" : "retrait sous un an"}
          </p>
        )}
        <label className="flex items-start gap-2">
          <input type="radio" name="keep" className="mt-1" checked={!keep} onChange={() => onKeep(false)} />
          <span>
            Les photos et vidéos où {self ? "j'apparais" : "il ou elle apparaît"} sont retirées et supprimées au plus tard un an
            après {self ? "mon" : "son"} départ.
          </span>
        </label>
        <label className="flex items-start gap-2">
          <input type="radio" name="keep" className="mt-1" checked={keep} onChange={() => onKeep(true)} />
          <span>
            Le club peut continuer à utiliser celles déjà prises, pour les seuls usages cochés, afin de garder la mémoire de sa
            vie. {self ? "Je peux" : "Vous pouvez"} retirer cet accord à tout moment.
          </span>
        </label>
      </fieldset>
    </>
  );
}
