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
  url?: string; // URL d'accès au fichier (peut être signé ou public selon l'adapter)
};

type SelectionState = {
  selectedIds: Set<string>;
  anchorId: string | null; // 👈 pour shift+click
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

  setSelection: (ids: string[], anchorId?: string | null) => void;
  toggleSelect: (id: string) => void;
  selectOnly: (id: string) => void;
  selectRange: (ids: string) => void;
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
      selection: {
        selectedIds: new Set(),
        anchorId: null,
      },
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
    anchorId: null,
  },

  setSelection: (ids, anchorId = null) =>
    set(() => ({
      selection: {
        selectedIds: new Set(ids),
        anchorId,
      },
    })),

  toggleSelect: (id) =>
    set((state) => {
      const next = new Set(state.selection.selectedIds);

      if (next.has(id)) next.delete(id);
      else next.add(id);

      return {
        selection: {
          selectedIds: next,
          anchorId: id,
        },
      };
    }),

  selectOnly: (id) =>
    set(() => ({
      selection: {
        selectedIds: new Set([id]),
        anchorId: id,
      },
    })),

  selectRange: (ids) =>
    set((state) => {
      const next = new Set(state.selection.selectedIds);

      for (const id of ids) {
        next.add(id);
      }

      return {
        selection: {
          selectedIds: next,
          anchorId: ids[ids.length - 1] ?? state.selection.anchorId,
        },
      };
    }),

  clearSelection: () =>
    set(() => ({
      selection: {
        selectedIds: new Set<string>(),
        anchorId: null,
      },
    })),
}));