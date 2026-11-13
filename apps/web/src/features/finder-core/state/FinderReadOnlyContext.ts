import { createContext, useContext } from "react";

/**
 * Finder en LECTURE SEULE (« Mes espaces ») : les éléments n'ouvrent pas de menu contextuel
 * (Renommer, Déplacer…, Mettre à la corbeille) et ne se glissent pas. Posé par `Finder` d'après
 * sa prop `readOnly`, lu par les lignes, vignettes et nœuds de l'arbre.
 */
export const FinderReadOnlyContext = createContext(false);

export function useFinderReadOnly(): boolean {
  return useContext(FinderReadOnlyContext);
}
