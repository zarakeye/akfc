import { create } from "zustand";
import { SelectionState } from "@lib/selection/selection.types";

type SelectionStore = {
  multiSelectActive: boolean;
  selection: SelectionState;
  
  startSelection: (rootPath: string) => void;
  toggleItem: (path: string) => void;
  clearSelection: () => void;
};

export const useSelectionStore = create<SelectionStore>((set, get) => ({
  multiSelectActive: false,

  selection: {
    roots: new Set(),
    excluded: new Set(),
  },

  /**
   * Starts a new selection by setting the provided root path as
   * the only root of the selection.
   * @param {string} rootPath - the path of the node to start the selection from
   */
  startSelection: (rootPath: string) => {
    set({
      multiSelectActive: true,
      selection: {
        roots: new Set([rootPath]),
        excluded: new Set(),
      },
    });
  },

  toggleItem: (path: string) => {
    set((state) => {
      const { roots, excluded } = state.selection;

      const coveredByRoot = [...roots].some((root) =>
        path === root || path.startsWith(`${root}/`)
      );

      // 👉 Cas : l’item est déjà implicitement sélectionné
      if (coveredByRoot) {
        const newExcluded = new Set(excluded);

        newExcluded.has(path)
          ? newExcluded.delete(path)
          : newExcluded.add(path);

        return {
          selection: {
            roots,
            excluded: newExcluded,
          },
        };
      }

      // 👉 Cas : l’item n’est pas implicitement sélectionné (indépendant)
      const newRoots = new Set(roots);

      newRoots.has(path)
        ? newRoots.delete(path)
        : newRoots.add(path);

      return {
        selection: {
          roots: newRoots,
          excluded,
        },
      };
    });
  },

  clearSelection: () => {
    set({
      multiSelectActive: false,
      selection: {
        roots: new Set(),
        excluded: new Set(),
      },
    });
  },
}));