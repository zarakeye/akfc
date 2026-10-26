"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { DOCS_ACTIONS_ID } from "@features/docs/lib/docsActionsSlot";

/*
 * Les boutons flottants de la documentation (« Entités », « Sur cette page ») ne se placent pas
 * eux-mêmes : ils se rangent dans un emplacement que DocsLayout réserve en bas de la colonne de
 * lecture, à gauche de la flèche « fin » et du pourcentage, au-dessus des liens « Précédent /
 * Suivant ». Sur écran étroit, l'emplacement devient une colonne de pastilles dans la marge droite.
 */

/**
 * Pastille ronde (l'icône seule) ; son libellé se déplie vers la gauche au survol ou au focus
 * clavier. Le libellé reste dans le bouton : c'est son nom pour un lecteur d'écran.
 */
export const PILL =
  "group inline-flex h-10 min-w-10 items-center justify-center rounded-full border bg-background px-3 text-sm shadow-lg transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500";
export const PILL_LABEL =
  "max-w-0 overflow-hidden whitespace-nowrap transition-[max-width,margin] duration-200 group-hover:ml-2 group-hover:max-w-40 group-focus-visible:ml-2 group-focus-visible:max-w-40";

const noSubscribe = () => () => {};
const readSlot = () => document.getElementById(DOCS_ACTIONS_ID);

/** Rend ses enfants dans l'emplacement des boutons flottants (rien tant qu'il n'existe pas). */
export function DocsAction({ children }: { children: ReactNode }) {
  const slot = useSyncExternalStore(noSubscribe, readSlot, () => null);
  return slot ? createPortal(children, slot) : null;
}
