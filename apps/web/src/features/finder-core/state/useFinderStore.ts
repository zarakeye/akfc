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
  roots: Set<string>;
  excluded: Set<string>;
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
  excludeItem: (id: string) => void;
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
        roots: new Set(),
        excluded: new Set(),
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
    roots: new Set<string>(),
    excluded: new Set<string>(),
    anchorId: null,
  },

  setSelection: (ids, anchorId = null) =>
    set(() => ({
      selection: {
        roots: new Set(ids),
        excluded: new Set(),
        anchorId,
      },
    })),

  toggleSelect: (id) =>
    set((state) => {
      const { roots, excluded } = state.selection;

      const nextRoots = new Set(roots);
      const nextExcluded = new Set(excluded);

      if (nextRoots.has(id)) {
        nextRoots.delete(id);
      }else {
        nextRoots.add(id);
        nextExcluded.delete(id);
      }

      return {
        selection: {
          roots: nextRoots,
          excluded: nextExcluded,
          anchorId: id,
        },
      };
    }),

  selectOnly: (id) =>
    set(() => ({
      selection: {
        roots: new Set([id]),
        excluded: new Set(),
        anchorId: id,
      },
    })),

  selectRange: (ids) =>
    set((state) => {
      const nextRoots = new Set(state.selection.roots);

      for (const id of ids) {
        nextRoots.add(id);
      }

      return {
        selection: {
          roots: nextRoots,
          excluded: new Set(),
          anchorId: ids[ids.length - 1] ?? state.selection.anchorId,
        },
      };
    }),

  excludeItem: (id) =>
    set((state) => {
      const nextExcluded = new Set(state.selection.excluded);
      nextExcluded.add(id);

      return {
        selection: {
          ...state.selection,
          excluded: nextExcluded,
        },
      };
    }),

  clearSelection: () =>
    set(() => ({
      selection: {
        roots: new Set<string>(),
        excluded: new Set<string>(),
        anchorId: null,
      },
    })),
}));