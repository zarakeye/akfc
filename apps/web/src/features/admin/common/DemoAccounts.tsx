"use client";

import { type JSX } from "react";

/** Texte d'explication commun aux listes qui peuvent afficher des comptes de démonstration. */
export const DEMO_EXPLANATION =
  "Comptes de démonstration (adresses en @akfc.demo) : ils servent à tester le site " +
  "et ne correspondent à aucun membre réel. Le site ne leur envoie aucun e-mail.";

/** Pastille « Démo » (ambre) accolée au nom d'un compte de démonstration. */
export function DemoBadge(): JSX.Element {
  return (
    <span
      className="rounded-full border border-amber-300 bg-amber-100 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-amber-800"
      title={DEMO_EXPLANATION}
    >
      Démo
    </span>
  );
}

/** Nom d'un membre, sa pastille « Démo » le cas échéant, et son adresse en dessous. */
export function MemberLabel({
  name,
  email,
  isDemo,
}: {
  name: string;
  email?: string | null;
  isDemo?: boolean;
}): JSX.Element {
  return (
    <span className="flex min-w-0 flex-col">
      <span className={`flex items-center gap-1.5 ${isDemo ? "text-amber-800" : ""}`}>
        {name}
        {isDemo && <DemoBadge />}
      </span>
      {email && email !== name && (
        <span className="truncate text-xs text-muted-foreground">{email}</span>
      )}
    </span>
  );
}

/**
 * Lien « Afficher / Masquer les comptes de démonstration (n) », et bandeau d'explication quand
 * ils sont affichés. Rien n'est rendu s'il n'y a aucun compte de démonstration.
 */
export function DemoAccountsToggle({
  count,
  shown,
  onToggle,
}: {
  count: number;
  shown: boolean;
  onToggle: () => void;
}): JSX.Element | null {
  if (count === 0) return null;
  return (
    <div className="mb-3 space-y-2">
      <button
        type="button"
        onClick={onToggle}
        className="text-xs font-medium text-amber-800 underline-offset-2 hover:underline"
      >
        {shown
          ? `Masquer les comptes de démonstration (${count})`
          : `Afficher les comptes de démonstration (${count})`}
      </button>
      {shown && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          {DEMO_EXPLANATION}
        </p>
      )}
    </div>
  );
}
