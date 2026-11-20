"use client";

import { useState, type JSX } from "react";
import Link from "next/link";
import { UserCheck } from "lucide-react";

import { trpc } from "#core/trpc/trpcClient.ts";

interface Compte {
  id: string;
  email: string;
  name: string;
  isDemo: boolean;
}

/**
 * Liste des utilisateurs : le TRI de la majorité. Tant qu'un compte n'a pas sa majorité renseignée,
 * le formulaire de droit à l'image en ligne lui reste fermé. Le panneau les compte, les liste avec
 * une case chacun (toutes cochées), et passe la sélection en majeurs en un clic. Les mineurs se
 * renseignent fiche par fiche : il leur faut un parent référent et une date de naissance.
 */
export function LegalAgeSortPanel({ comptes }: { comptes: Compte[] }): JSX.Element | null {
  const utils = trpc.useUtils();
  const [ouvert, setOuvert] = useState(false);
  const [exclus, setExclus] = useState<Set<string>>(new Set());
  const [resultat, setResultat] = useState<number | null>(null);
  const marquer = trpc.user.markAdults.useMutation({
    onSuccess: async ({ count }) => {
      setResultat(count);
      setOuvert(false);
      setExclus(new Set());
      await utils.user.getAll.invalidate();
    },
  });

  if (comptes.length === 0) {
    return resultat === null ? null : (
      <p role="status" className="mb-3 text-sm text-success">
        {resultat} compte(s) passé(s) en majeurs. Tous les comptes ont leur majorité renseignée.
      </p>
    );
  }

  const choisis = comptes.filter((c) => !exclus.has(c.id));
  const basculer = (id: string) =>
    setExclus((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <section
      aria-label="Majorité à renseigner"
      className="mb-4 rounded-lg border border-warning/40 bg-warning-muted p-4 text-sm"
    >
      {resultat !== null && (
        <p role="status" className="mb-2 text-success">
          {resultat} compte(s) passé(s) en majeurs.
        </p>
      )}
      <p className="font-semibold">
        {comptes.length} compte(s) sans majorité renseignée
      </p>
      <p className="mt-1 text-warning">
        Tant qu&apos;elle ne l&apos;est pas, le membre ne peut pas donner son droit à l&apos;image en ligne.
      </p>
      {!ouvert ? (
        <button
          type="button"
          onClick={() => setOuvert(true)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-warning px-3 py-1.5 font-medium text-warning-muted hover:bg-warning/90"
        >
          <UserCheck aria-hidden="true" className="h-4 w-4" />
          Trier la majorité
        </button>
      ) : (
        <div className="mt-3 space-y-3">
          <p>
            Décochez les mineurs, puis passez les autres en majeurs. Un mineur se renseigne sur sa fiche (cliquez sur
            son nom) : il lui faut un parent référent et une date de naissance.
          </p>
          <ul className="max-h-72 space-y-1 overflow-y-auto rounded-md border border-border bg-background p-2">
            {comptes.map((c) => (
              <li key={c.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`majeur-${c.id}`}
                  checked={!exclus.has(c.id)}
                  onChange={() => basculer(c.id)}
                  aria-label={`Majeur : ${c.name || c.email}`}
                />
                <Link href={`/dashboard/users/${c.id}`} className="hover:underline">
                  {c.name || c.email}
                </Link>
                <span className="text-xs text-muted-foreground">{c.email}</span>
                {c.isDemo && <span className="rounded-full bg-muted px-2 text-xs">Démo</span>}
              </li>
            ))}
          </ul>
          {marquer.error && <p className="text-destructive">{marquer.error.message}</p>}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={choisis.length === 0 || marquer.isPending}
              onClick={() => marquer.mutate({ userIds: choisis.map((c) => c.id) })}
              className="rounded-md bg-brand px-3 py-1.5 font-medium text-brand-foreground hover:bg-brand/90 disabled:opacity-50"
            >
              {marquer.isPending ? "Enregistrement…" : `Marquer majeurs (${choisis.length})`}
            </button>
            <button
              type="button"
              onClick={() => setOuvert(false)}
              className="rounded-md border border-border px-3 py-1.5"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
