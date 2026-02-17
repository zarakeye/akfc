import { create } from "zustand";
import { SelectionState } from "@lib/selection/selection.types";

type SelectionStore = {
  multiSelectActive: boolean;
  selection: SelectionState;
  
  startSelection: (rootPath: string) => void;
  isSelected: (path: string) => boolean;
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

  /**
   * Determines whether the given path is selected in the current selection.
   * An item is considered selected if it is a root of the selection or
   * if it is a descendant of a root that is not excluded from the selection.
   * @param {string} path - the path of the item to check
   * @returns {boolean} true if the item is selected, false otherwise
   */
  isSelected: (path: string) => {
    const { roots, excluded } = get().selection;
    
    const coveredByRoot = [...roots].some((root) =>
      path === root || path.startsWith(`${root}/`)
    );

    if (!coveredByRoot) {
      return false;
    }

    return !excluded.has(path);
  },

  /**
   * Toggles the selection of a node by either adding or removing it
   * from the roots of the selection.
   * If the node is already implicitly selected (i.e. it is a root of the
   * selection or a descendant of a root that is not excluded from the
   * selection), this function toggles the exclusion of the node.
   * If the node is not implicitly selected, this function adds or removes
   * the node from the roots of the selection.
   * @param {string} path - the path of the node to toggle
   * @returns {object} the new selection state
   */
  toggleItem: (path: string): void => {
    set((state) => {
      const { roots, excluded } = state.selection;

      const coveredByRoot = [...roots].some((root) =>
        path === root || path.startsWith(`${root}/`)
      );

      // 👉 Cas : l’item est déjà implicitement sélectionné
      if (coveredByRoot) {
        const newExcluded = new Set(excluded);

        if (newExcluded.has(path)) {
          newExcluded.delete(path);
        } else {
          newExcluded.add(path);
        }

        return {
          selection: {
            roots,
            excluded: newExcluded,
          },
        };
      }

      // 👉 Cas : l’item n’est pas implicitement sélectionné (indépendant)
      const newRoots = new Set(roots);

      if (newRoots.has(path)) {
        newRoots.delete(path);
      } else {
        newRoots.add(path);
      }

      return {
        selection: {
          roots: newRoots,
          excluded,
        },
      };
    });
  },

  /**
   * Clears the current selection by setting the roots and excluded sets to empty.
   */
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