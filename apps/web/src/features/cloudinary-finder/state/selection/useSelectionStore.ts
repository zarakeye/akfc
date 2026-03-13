// src/lib/stores/useSelectionStore.ts
import { create } from 'zustand';

import { SelectionState } from '@/features/cloudinary-finder/model/selection/selection.types';

/**
 * useSelectionStore
 *
 * ✅ Normal selection (pending/published/...):
 * - multiSelectActive + selection {roots, excluded}
 *
 * ✅ Bin selection (root /bin only):
 * - binMultiSelectActive + binSelection (Set<trashId>)
 *
 * ⚠️ Important:
 * - un longPress dans le bin ne doit PAS activer multiSelectActive normal
 * - un longPress hors bin ne doit PAS activer binMultiSelectActive
 */

type SelectionStore = {
  // -----------------------------
  // NORMAL
  // -----------------------------
  multiSelectActive: boolean;
  selection: SelectionState;

  startSelection: (rootPath: string) => void;
  isSelected: (path: string) => boolean;
  toggleItem: (path: string) => void;
  uncheckFolderPreserveDescendants: (folderPath: string, directChildrenPaths: string[]) => void;

  // -----------------------------
  // BIN
  // -----------------------------
  binMultiSelectActive: boolean;
  binSelection: Set<string>;

  startBinSelection: (trashId: string) => void;
  toggleBinSelection: (trashId: string) => void;

  // Aliases (compat)
  startBinItem: (trashId: string) => void;
  toggleBinItem: (trashId: string) => void;
  isBinSelected: (trashId: string) => boolean;

  // -----------------------------
  // CLEAR
  // -----------------------------
  clearNormalSelection: () => void;
  clearBinSelection: () => void;

  /**
   * Compat: beaucoup de code appelle clearSelection()
   * => on clear tout (normal + bin) pour rester safe.
   */
  clearSelection: () => void;
};

// -----------------------------
// Helpers selection normal
// -----------------------------
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

function removeExcludedUnder(path: string, excluded: Set<string>) {
  const next = new Set(excluded);
  for (const ex of excluded) {
    if (ex !== path && ex.startsWith(`${path}/`)) next.delete(ex);
  }
  return next;
}

function compressRoots(roots: Set<string>) {
  const arr = Array.from(roots).sort();
  const next = new Set<string>();

  for (const r of arr) {
    if (isCoveredByRoots(r, next)) continue;
    next.add(r);

    for (const kept of Array.from(next)) {
      if (kept !== r && kept.startsWith(`${r}/`)) next.delete(kept);
    }
  }

  return next;
}

function compressExcluded(excluded: Set<string>) {
  const arr = Array.from(excluded).sort();
  const next = new Set<string>();

  for (const ex of arr) {
    if (isBlockedByExcluded(ex, next)) continue;
    next.add(ex);

    for (const kept of Array.from(next)) {
      if (kept !== ex && kept.startsWith(`${ex}/`)) next.delete(kept);
    }
  }

  return next;
}

export const useSelectionStore = create<SelectionStore>((set, get) => ({
  // -----------------------------
  // NORMAL
  // -----------------------------
  multiSelectActive: false,
  selection: {
    roots: new Set(),
    excluded: new Set(),
  },

  startSelection: (rootPath: string) => {
    const p = normalizePath(rootPath);

    set({
      multiSelectActive: true,
      selection: {
        roots: new Set([p]),
        excluded: new Set(),
      },
      // ✅ ne pas mélanger
      binMultiSelectActive: false,
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

      // 1) root explicite -> remove root + exclusions dessous
      if (isRoot) {
        roots.delete(p);

        const nextExcluded = new Set<string>();
        for (const ex of excluded) {
          if (!(ex === p || ex.startsWith(`${p}/`))) nextExcluded.add(ex);
        }

        roots = compressRoots(roots);
        excluded = compressExcluded(nextExcluded);

        return {
          multiSelectActive: true,
          selection: { roots, excluded },
          // ✅ bin intact
          binMultiSelectActive: state.binMultiSelectActive,
          binSelection: state.binSelection,
        };
      }

      // 2) couvert -> toggle exclusion
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
          binMultiSelectActive: state.binMultiSelectActive,
          binSelection: state.binSelection,
        };
      }

      // 3) pas couvert -> add root
      roots.add(p);
      roots = compressRoots(roots);
      excluded = compressExcluded(excluded);

      return {
        multiSelectActive: true,
        selection: { roots, excluded },
        binMultiSelectActive: state.binMultiSelectActive,
        binSelection: state.binSelection,
      };
    });
  },

  uncheckFolderPreserveDescendants: (folderPath: string, directChildrenPaths: string[]) => {
    const folder = normalizePath(folderPath);
    const children = directChildrenPaths.map(normalizePath).filter(Boolean);

    set((state) => {
      let roots = compressRoots(normalizeSet(state.selection.roots));
      let excluded = compressExcluded(normalizeSet(state.selection.excluded));

      if (!roots.has(folder)) return state;

      roots.delete(folder);

      for (const c of children) {
        if (c === folder || !c.startsWith(`${folder}/`)) continue;
        roots.add(c);
      }

      if (excluded.has(folder)) excluded.delete(folder);

      roots = compressRoots(roots);
      excluded = compressExcluded(excluded);

      return {
        multiSelectActive: true,
        selection: { roots, excluded },
        binMultiSelectActive: state.binMultiSelectActive,
        binSelection: state.binSelection,
      };
    });
  },

  // -----------------------------
  // BIN
  // -----------------------------
  binMultiSelectActive: false,
  binSelection: new Set(),

  startBinSelection: (trashId: string) => {
    set({
      binMultiSelectActive: true,
      binSelection: new Set([trashId]),
      // ✅ ne pas mélanger
      multiSelectActive: false,
      selection: { roots: new Set(), excluded: new Set() },
    });
  },

  toggleBinSelection: (trashId: string) => {
    set((state) => {
      const next = new Set(state.binSelection);
      if (next.has(trashId)) next.delete(trashId);
      else next.add(trashId);

      return {
        binMultiSelectActive: true,
        binSelection: next,
        multiSelectActive: state.multiSelectActive,
        selection: state.selection,
      };
    });
  },

  // Aliases (compat)
  startBinItem: (trashId: string) => get().startBinSelection(trashId),
  toggleBinItem: (trashId: string) => get().toggleBinSelection(trashId),
  isBinSelected: (trashId: string) => get().binSelection.has(trashId),

  // -----------------------------
  // CLEAR
  // -----------------------------
  clearNormalSelection: () => {
    set({
      multiSelectActive: false,
      selection: { roots: new Set(), excluded: new Set() },
    });
  },

  clearBinSelection: () => {
    set({
      binMultiSelectActive: false,
      binSelection: new Set(),
    });
  },

  clearSelection: () => {
    set({
      multiSelectActive: false,
      selection: { roots: new Set(), excluded: new Set() },
      binMultiSelectActive: false,
      binSelection: new Set(),
    });
  },
}));