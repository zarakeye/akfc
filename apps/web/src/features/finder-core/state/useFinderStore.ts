import { create } from "zustand";
import type { FinderNode } from "@features/finder-core/types";
import { APP_ROOT } from "@/config/app";

type SelectionMode = 'single' | 'multiple';

interface FinderState {
  // navigation
  currentPath: string;
  setPath: (path: string) => void;

  // currennt content
  folders: FinderNode[];
  files: FinderNode[];
  setContent: (data: { folders: FinderNode[]; files: FinderNode[] }) => void;

  // selection
  selectionMode: SelectionMode;
  selected: Set<string>;

  select: (id: string) => void;
  toggleSelect: (id: string) => void;
  clearSelection: () => void;

  setSelectionMode: (mode: SelectionMode) => void;
};

export const useFinderStore = create<FinderState>((set, get) => ({
  // navigation
  currentPath: `${APP_ROOT}`, // point de départ configurable
  setPath: (path) => set({ currentPath: path }),

  // content
  folders: [],
  files: [],
  setContent: ({ folders, files }) => set({ folders, files }),

  // selection
  selectionMode: 'single',
  selected: new Set(),

  select: (id) => {
    const { selectionMode } = get();

    if (selectionMode === 'single') {
      set({ selected: new Set([id]) });
    } else {
      set((state) => {
        const next = new Set(state.selected);
        next.add(id);
        return { selected: next };
      });
    }
  },

  toggleSelect: (id) => {
    set((state) => {
      const next = new Set(state.selected);

      if (next.has(id)) {
        next.delete(id);
      } else {
        if (state.selectionMode === 'single') {
          return { selected: new Set([id]) };
        }
        next.add(id);
      }

      return { selected: next };
    });
  },

  clearSelection: () => set({ selected: new Set() }),

  setSelectionMode: (mode) => set({ selectionMode: mode }),
}));

