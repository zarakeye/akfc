import { create } from 'zustand';

import { SelectionState } from '@lib/selection/selection.types';

/**
 * useSelectionStore
 *
 * Modèle roots/excluded :
 * - roots    : éléments sélectionnés comme racines (un root couvre lui-même + ses descendants)
 * - excluded : éléments explicitement décochés DANS une zone couverte par un root
 *
 * Ex:
 * - roots = ["app/pending/a"] => tout "app/pending/a/**" est sélectionné
 * - excluded = ["app/pending/a/x"] => "x" et son sous-arbre sont retirés de la sélection
 *
 * ✅ Règles UX fixées ensemble :
 * - Le mode multiSelectActive NE DOIT JAMAIS se désactiver automatiquement.
 * - Même si la sélection devient vide, on reste en multiselect.
 * - On quitte uniquement via clearSelection() (action explicite).
 *
 * ✅ Règle UX (décoche dossier root mais garder descendance) :
 * - Si on décoche un dossier qui est un root explicite,
 *   on veut garder ses descendants cochés.
 *   => on remplace le root par SES ENFANTS DIRECTS en roots.
 */

type SelectionStore = {
  multiSelectActive: boolean;
  selection: SelectionState;

  /**
   * ✅ Bin selection (liste plate)
   *
   * Dans `AKFC/bin` (liste plate), la sélection ne se fait pas sur des fullPath réels,
   * mais sur des `trashId`.
   *
   * On garde donc un set dédié, pour éviter les hacks du type "__trash__/...".
   */
  binSelection: Set<string>;

  startSelection: (rootPath: string) => void;
  isSelected: (path: string) => boolean;
  toggleItem: (path: string) => void;

  /** Sélection dans le bin root (liste plate) */
  isBinSelected: (trashId: string) => boolean;
  toggleBinItem: (trashId: string) => void;

  /**
   * Décoche un dossier ROOT tout en gardant sa descendance cochée.
   *
   * - folderPath doit être présent dans selection.roots.
   * - directChildrenPaths = chemins des enfants directs (folders + files) connus côté UI.
   */
  uncheckFolderPreserveDescendants: (folderPath: string, directChildrenPaths: string[]) => void;

  clearSelection: () => void;
};

function normalizePath(p: string) {
  return p.replace(/^\/+|\/+$/g, '');
}

function normalizeSet(set: Set<string>) {
  return new Set(Array.from(set, normalizePath));
}

function isCoveredByRoots(path: string, roots: Set<string>) {
  for (const root of roots) {
    if (path === root || path.startsWith(`${root}/`)) return true;
  }
  return false;
}

function isBlockedByExcluded(path: string, excluded: Set<string>) {
  for (const ex of excluded) {
    if (path === ex || path.startsWith(`${ex}/`)) return true;
  }
  return false;
}

/** retire les exclusions sous `path` (compression locale) */
function removeExcludedUnder(path: string, excluded: Set<string>) {
  const next = new Set(excluded);
  for (const ex of excluded) {
    if (ex !== path && ex.startsWith(`${path}/`)) next.delete(ex);
  }
  return next;
}

/**
 * Compression roots :
 * - si un root est descendant d'un autre root => inutile
 * - si on ajoute un root parent => il absorbe les roots enfants
 */
function compressRoots(roots: Set<string>) {
  const arr = Array.from(roots).sort();
  const next = new Set<string>();

  for (const r of arr) {
    // déjà couvert par un root gardé ?
    if (isCoveredByRoots(r, next)) continue;
    next.add(r);

    // absorption des roots descendants
    for (const kept of Array.from(next)) {
      if (kept !== r && kept.startsWith(`${r}/`)) next.delete(kept);
    }
  }

  return next;
}

/**
 * Compression excluded :
 * - si un excluded est descendant d'un autre excluded => inutile
 */
function compressExcluded(excluded: Set<string>) {
  const arr = Array.from(excluded).sort();
  const next = new Set<string>();

  for (const ex of arr) {
    if (isBlockedByExcluded(ex, next)) continue;
    next.add(ex);

    // absorption exclusions descendantes
    for (const kept of Array.from(next)) {
      if (kept !== ex && kept.startsWith(`${ex}/`)) next.delete(kept);
    }
  }

  return next;
}

export const useSelectionStore = create<SelectionStore>((set, get) => ({
  multiSelectActive: false,

  selection: {
    roots: new Set(),
    excluded: new Set(),
  },

  binSelection: new Set(),

  startSelection: (rootPath: string) => {
    const p = normalizePath(rootPath);

    set({
      multiSelectActive: true,
      selection: {
        roots: new Set([p]),
        excluded: new Set(),
      },

      // ✅ En mode "path selection", on vide la sélection bin.
      binSelection: new Set(),
    });
  },

  isSelected: (path: string) => {
    const p = normalizePath(path);
    const { roots, excluded } = get().selection;

    if (!isCoveredByRoots(p, roots)) return false;
    if (isBlockedByExcluded(p, excluded)) return false;
    return true;
  },

  toggleItem: (path: string) => {
    const p = normalizePath(path);

    set((state) => {
      let roots = compressRoots(normalizeSet(state.selection.roots));
      let excluded = compressExcluded(normalizeSet(state.selection.excluded));

      const isRoot = roots.has(p);
      const coveredByRoot = isCoveredByRoots(p, roots);

      // 1) toggle root explicite : retirer root
      // ⚠️ Par défaut, retirer un root retire implicitement sa descendance.
      // Le cas “retirer le dossier mais garder la descendance” se fait via
      // uncheckFolderPreserveDescendants().
      if (isRoot) {
        roots.delete(p);

        // purge exclusions sous ce root
        const nextExcluded = new Set<string>();
        for (const ex of excluded) {
          if (!(ex === p || ex.startsWith(`${p}/`))) nextExcluded.add(ex);
        }

        roots = compressRoots(roots);
        excluded = compressExcluded(nextExcluded);

        return {
          // ✅ ne pas auto-sortir du multiselect
          multiSelectActive: true,
          selection: { roots, excluded },
        };
      }

      // 2) couvert par root => toggle exclusion (exclut un sous-arbre)
      if (coveredByRoot) {
        if (excluded.has(p)) {
          excluded.delete(p);
          excluded = removeExcludedUnder(p, excluded);
        } else {
          excluded.add(p);
          excluded = removeExcludedUnder(p, excluded);
        }

        excluded = compressExcluded(excluded);

        return {
          multiSelectActive: true,
          selection: { roots, excluded },
        };
      }

      // 3) pas couvert => add root
      roots.add(p);
      roots = compressRoots(roots);
      excluded = compressExcluded(excluded);

      return {
        multiSelectActive: true,
        selection: { roots, excluded },

        // ✅ Toute action de sélection "path" vide la sélection bin.
        binSelection: new Set(),
      };
    });
  },

  isBinSelected: (trashId: string) => {
    const id = String(trashId);
    return get().binSelection.has(id);
  },

  toggleBinItem: (trashId: string) => {
    const id = String(trashId);

    set((state) => {
      const next = new Set(state.binSelection);
      if (next.has(id)) next.delete(id);
      else next.add(id);

      return {
        // ✅ ne pas auto-sortir du multiselect
        multiSelectActive: true,

        // ✅ En mode "bin selection", on vide la sélection "path".
        selection: { roots: new Set(), excluded: new Set() },
        binSelection: next,
      };
    });
  },

  uncheckFolderPreserveDescendants: (folderPath: string, directChildrenPaths: string[]) => {
    const folder = normalizePath(folderPath);
    const children = directChildrenPaths.map(normalizePath).filter(Boolean);

    set((state) => {
      let roots = compressRoots(normalizeSet(state.selection.roots));
      let excluded = compressExcluded(normalizeSet(state.selection.excluded));

      // On ne fait l'opération que si le dossier est un root explicite.
      if (!roots.has(folder)) return state;

      // 1) retirer le root dossier
      roots.delete(folder);

      // 2) ajouter ses enfants directs comme roots
      // Un descendant appartient forcément à UN enfant direct => on conserve tout le sous-arbre.
      for (const c of children) {
        if (c === folder || !c.startsWith(`${folder}/`)) continue;
        roots.add(c);
      }

      // 3) si excluded contenait exactement le folder, on l'enlève
      // (sinon ça irait à l'encontre de “garder les descendants sélectionnés”)
      if (excluded.has(folder)) excluded.delete(folder);

      roots = compressRoots(roots);
      excluded = compressExcluded(excluded);

      return {
        multiSelectActive: true,
        selection: { roots, excluded },
      };
    });
  },

  clearSelection: () => {
    set({
      multiSelectActive: false,
      selection: { roots: new Set(), excluded: new Set() },

      // ✅ clear bin selection aussi
      binSelection: new Set(),
    });
  },
}));
