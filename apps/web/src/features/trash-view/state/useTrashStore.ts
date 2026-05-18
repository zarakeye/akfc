import { create } from 'zustand';

/**
 * 🗑️ Store de gestion de la vue Corbeille
 *
 * Gère :
 * - la sélection (set d'ids de TrashEntry)
 * - le mode d'affichage (grille / tableau / liste)
 * - la navigation drill-down (trashId courant + chemin relatif)
 *
 * Le mode d'affichage est persisté en localStorage (clé `akfc:trash:view-mode`)
 * pour respecter la préférence de l'utilisateur entre sessions.
 *
 * Note : pas de persistance pour la sélection ni le drill-down — ce sont
 * des états transitoires d'usage immédiat.
 */

export type ViewMode = 'grid' | 'table' | 'compact';

const VIEW_MODE_STORAGE_KEY = 'akfc:trash:view-mode';

function loadViewMode(): ViewMode {
  if (typeof window === 'undefined') return 'grid';
  try {
    const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (saved === 'grid' || saved === 'table' || saved === 'compact') {
      return saved;
    }
  } catch {
    // mode privé / quota — on ignore
  }
  return 'grid';
}

function saveViewMode(mode: ViewMode): void {
  try {
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
  } catch {
    // idem
  }
}

/**
 * État du drill-down : `null` = on est sur la liste plate racine.
 * Sinon on explore le contenu d'une trashEntry de type "folder".
 *
 * `relativePath` est vide ("") pour le contenu racine de l'entrée,
 * ou "subA/subB" pour un sous-dossier de l'entrée.
 */
export type DrilldownState = null | {
  trashId: string;
  /** Nom de l'entrée pour l'affichage du breadcrumb. */
  displayName: string;
  /** Chemin relatif à l'intérieur de l'entrée (vide à la racine de l'entrée) */
  relativePath: string;
};

interface TrashStore {
  /** Set des trashIds sélectionnés */
  selectedIds: Set<string>;
  /** Mode d'affichage de la liste */
  viewMode: ViewMode;
  /** État du drill-down (null = liste racine) */
  drilldown: DrilldownState;
  /** Texte de recherche actuel (filtre côté backend via listBin) */
  search: string;

  // Actions sélection
  toggleSelected: (id: string) => void;
  selectOnly: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;

  // Actions mode d'affichage
  setViewMode: (mode: ViewMode) => void;

  // Actions drill-down
  enterDrilldown: (trashId: string, displayName: string) => void;
  navigateInsideDrilldown: (relativePath: string) => void;
  exitDrilldown: () => void;

  // Recherche
  setSearch: (search: string) => void;
}

export const useTrashStore = create<TrashStore>((set) => ({
  selectedIds: new Set(),
  viewMode: loadViewMode(),
  drilldown: null,
  search: '',

  toggleSelected: (id) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { selectedIds: next };
    }),

  selectOnly: (id) => set({ selectedIds: new Set([id]) }),

  selectAll: (ids) => set({ selectedIds: new Set(ids) }),

  clearSelection: () => set({ selectedIds: new Set() }),

  setViewMode: (mode) => {
    saveViewMode(mode);
    set({ viewMode: mode });
  },

  enterDrilldown: (trashId, displayName) =>
    // À l'entrée d'un drill-down on clear la sélection — la sélection s'applique
    // à la vue plate racine et n'a pas de sens à l'intérieur d'une entrée.
    set({
      drilldown: { trashId, displayName, relativePath: '' },
      selectedIds: new Set(),
    }),

  navigateInsideDrilldown: (relativePath) =>
    set((state) =>
      state.drilldown
        ? { drilldown: { ...state.drilldown, relativePath } }
        : state
    ),

  exitDrilldown: () => set({ drilldown: null }),

  setSearch: (search) => set({ search, selectedIds: new Set() }),
}));
