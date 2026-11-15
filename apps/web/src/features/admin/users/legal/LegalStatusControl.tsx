"use client";

import { useState, type JSX } from "react";
import { useRouter } from "next/navigation";
import { FileDown } from "lucide-react";

import { trpc } from "#core/trpc/trpcClient.ts";
import { LEGAL_AGE_LABEL, type LegalAgeValue } from "@akfc/contracts/legal/imageConsent.ts";
import { GUARDIAN_RELATIONS } from "#features/admin/users/legal/CreationLegalFields.tsx";

/**
 * Fiche d'un membre (admin) : sa majorité.
 *
 * - Membre d'Administrateurs, Instructeurs ou Bureau : majeur d'office, rien à saisir.
 * - Sinon, la date de naissance décide quand elle est connue. La fiche ne l'AFFICHE jamais (seul le
 *   membre la voit) : elle dit seulement si elle est renseignée, et permet de la remplacer.
 * - Sans date : Majeur / Mineur au choix.
 * - Mineur : le parent référent, qui valide le droit à l'image.
 */
export type LegalStatusInitial = {
  legalAge: LegalAgeValue;
  hasBirthDate: boolean;
  guardianName: string;
  guardianRelation: string;
  guardianEmail: string;
  guardianPhone: string;
};

const input = "rounded border border-input bg-background px-2 py-1";

export function LegalStatusControl({
  userId,
  adultGroupName,
  initial,
}: {
  userId: string;
  /** Nom du groupe qui rend majeur d'office, ou null. */
  adultGroupName: string | null;
  initial: LegalStatusInitial;
}): JSX.Element {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [choice, setChoice] = useState<LegalAgeValue>(initial.legalAge);
  const [newBirthDate, setNewBirthDate] = useState<string | null>(null);
  const [g, setG] = useState({
    name: initial.guardianName,
    relation: initial.guardianRelation,
    email: initial.guardianEmail,
    phone: initial.guardianPhone,
  });
  const save = trpc.user.setLegalInfo.useMutation({
    onSuccess: async () => {
      setNewBirthDate(null);
      await utils.user.getAll.invalidate();
      router.refresh();
    },
  });

  if (adultGroupName) {
    return (
      <section aria-label="Majorité" className="mt-6 rounded-lg border border-border p-4 text-sm" data-tour="users.legal">
        <h3 className="font-medium">Majorité</h3>
        <p className="mt-1">
          <strong>Majeur d&apos;office</strong> : membre du groupe {adultGroupName}.
        </p>
      </section>
    );
  }

  const byBirthDate = initial.hasBirthDate && newBirthDate === null;
  const minor = choice === "MINOR";

  const submit = (): void => {
    save.mutate({
      userId,
      legal: {
        legalAge: choice,
        // Absente : le serveur garde la date enregistrée, qu'on ne connaît pas ici.
        ...(newBirthDate !== null ? { birthDate: newBirthDate || null } : {}),
        guardianName: minor ? g.name.trim() || null : null,
        guardianRelation: minor ? g.relation.trim() || null : null,
        guardianEmail: minor ? g.email.trim() || null : null,
        guardianPhone: minor ? g.phone.trim() || null : null,
      },
    });
  };

  return (
    <section aria-label="Majorité" className="mt-6 rounded-lg border border-border p-4 text-sm" data-tour="users.legal">
      <h3 className="font-medium">Majorité</h3>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span>Date de naissance :</span>
        {newBirthDate === null ? (
          <>
            <span className={initial.hasBirthDate ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"}>
              {initial.hasBirthDate ? "renseignée ✓" : "non renseignée"}
            </span>
            <button type="button" onClick={() => setNewBirthDate("")} className="text-emerald-700 hover:underline">
              {initial.hasBirthDate ? "Remplacer" : "Ajouter"}
            </button>
          </>
        ) : (
          <>
            <input
              type="date"
              aria-label="Nouvelle date de naissance"
              value={newBirthDate}
              onChange={(e) => setNewBirthDate(e.target.value)}
              className={`${input} max-w-[12rem]`}
            />
            <button type="button" onClick={() => setNewBirthDate(null)} className="text-muted-foreground hover:underline">
              Annuler
            </button>
          </>
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Seul le membre la voit. Elle décide de la majorité, et la fait passer d&apos;elle-même à 18 ans.
      </p>

      {byBirthDate ? (
        <p className="mt-3">
          D&apos;après sa date de naissance : <strong>{LEGAL_AGE_LABEL[initial.legalAge]}</strong>.
        </p>
      ) : newBirthDate ? (
        <p className="mt-3 text-muted-foreground">La majorité sera calculée d&apos;après la nouvelle date.</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-4" role="radiogroup" aria-label="Majorité">
          {(["UNKNOWN", "ADULT", "MINOR"] as const)
            .filter((a) => a !== "UNKNOWN" || initial.legalAge === "UNKNOWN")
            .map((a) => (
              <label key={a} className="flex cursor-pointer items-center gap-1.5">
                <input type="radio" name="legalAge" checked={choice === a} onChange={() => setChoice(a)} />
                {LEGAL_AGE_LABEL[a]}
              </label>
            ))}
        </div>
      )}

      {minor && (
        <fieldset className="mt-3 flex flex-col gap-2 rounded border border-border p-3">
          <legend className="px-1 font-medium">Parent référent</legend>
          <label className="flex flex-col gap-1">
            <span>Prénom et nom</span>
            <input value={g.name} onChange={(e) => setG({ ...g, name: e.target.value })} className={input} />
          </label>
          <label className="flex flex-col gap-1">
            <span>Qualité</span>
            <select value={g.relation} onChange={(e) => setG({ ...g, relation: e.target.value })} className={`${input} max-w-[12rem]`}>
              <option value="">— Choisir —</option>
              {[...new Set([...GUARDIAN_RELATIONS, ...(g.relation ? [g.relation] : [])])].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span>Adresse e-mail</span>
            <input type="email" value={g.email} onChange={(e) => setG({ ...g, email: e.target.value })} className={input} />
          </label>
          <label className="flex flex-col gap-1">
            <span>Téléphone (facultatif)</span>
            <input type="tel" value={g.phone} onChange={(e) => setG({ ...g, phone: e.target.value })} className={`${input} max-w-[14rem]`} />
          </label>
        </fieldset>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={save.isPending}
          onClick={submit}
          className="rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {save.isPending ? "Enregistrement…" : "Enregistrer"}
        </button>
        <a
          href={`/api/media/image-consent/prefilled?userId=${encodeURIComponent(userId)}`}
          className="inline-flex items-center gap-1.5 text-emerald-700 hover:underline"
        >
          <FileDown className="h-4 w-4" />
          Formulaire de droit à l&apos;image pré-rempli
        </a>
      </div>
      {save.isSuccess && <p className="mt-2 text-emerald-700">Enregistré.</p>}
      {save.error && <p className="mt-2 text-red-600">{save.error.message}</p>}
    </section>
  );
}
