import { create } from 'zustand';
import { APP_ROOT } from '@/config/app';

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type FinderFolder = {
  id: string;
  name: string;
  path: string;
};

export type FinderFile = {
  id: string;
  name: string;
  path: string;
};

type SelectionState = {
  selectedIds: Set<string>;
};

type FinderState = {
  /* -------------------------------------------------------------------------- */
  /*                                  NAVIGATION                                */
  /* -------------------------------------------------------------------------- */

  currentPath: string;
  setPath: (path: string) => void;

  /* -------------------------------------------------------------------------- */
  /*                                   CONTENT                                  */
  /* -------------------------------------------------------------------------- */

  folders: FinderFolder[];
  files: FinderFile[];

  setContent: (data: {
    folders: FinderFolder[];
    files: FinderFile[];
  }) => void;

  /* -------------------------------------------------------------------------- */
  /*                                  SELECTION                                 */
  /* -------------------------------------------------------------------------- */

  selection: SelectionState;
  setSelection: (ids: string[]) => void;
  toggleSelect: (id: string) => void;
  clearSelection: () => void;
};

/* -------------------------------------------------------------------------- */
/*                                   STORE                                    */
/* -------------------------------------------------------------------------- */

export const useFinderStore = create<FinderState>((set) => ({
  /* -------------------------------- NAV -------------------------------- */

  currentPath: `${APP_ROOT}`,

  setPath: (path) =>
    set(() => ({
      currentPath: path,
      selection: { selectedIds: new Set() }, // reset sélection
    })),

  /* ------------------------------ CONTENT -------------------------------- */

  folders: [],
  files: [],

  setContent: ({ folders, files }) =>
    set(() => ({
      folders,
      files,
    })),

  /* ----------------------------- SELECTION -------------------------------- */

  selection: {
    selectedIds: new Set<string>(),
  },

  setSelection: (ids) =>
    set(() => ({
      selection: {
        selectedIds: new Set(ids),
      },
    })),

  toggleSelect: (id) =>
    set((state) => {
      const next = new Set(state.selection.selectedIds);

      if (next.has(id)) next.delete(id);
      else next.add(id);

      return {
        selection: { selectedIds: next },
      };
    }),

  clearSelection: () =>
    set(() => ({
      selection: { selectedIds: new Set() },
    })),
}));