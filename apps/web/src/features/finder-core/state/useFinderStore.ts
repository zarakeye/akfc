import { create } from 'zustand';
import { APP_ROOT } from '@config/app';
import type { FinderNode } from '@contracts/finder';

/**
 * Les trois lentilles de statut. `'all'` n'est pas un statut — c'est
 * l'absence de lentille, d'où un type à part et non `LifecycleStatus | null`.
 */
export type StatusFilter = 'all' | 'pending' | 'published';

const STATUS_FILTER_KEY = 'akfc.finder.statusFilter';

/**
 * Persisté comme `viewMode` : c'est une préférence de travail, pas un état de
 * navigation. Un admin qui trie ses contenus en attente ne veut pas
 * recommencer à chaque rechargement.
 *
 * Défaut `'all'` — pour ne rien cacher à qui ne connaît pas encore le filtre.
 * Un admin qui ne voit pas ses photos ne se demande pas quel filtre est
 * actif : il pense qu'elles ont disparu.
 */
function loadStatusFilter(): StatusFilter {
  if (typeof window === 'undefined') return 'all';
  const stored = window.localStorage.getItem(STATUS_FILTER_KEY);
  return stored === 'pending' || stored === 'published' ? stored : 'all';
}

function saveStatusFilter(filter: StatusFilter): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STATUS_FILTER_KEY, filter);
}

/**
 * 🗂️ Store de gestion de l'état du Finder
 *
 * Gère navigation, contenu, sélection, multi-select, view mode, sort.
 * Phase 4 ajoute : état de recherche récursive (query, flags, résultats).
 *
 * La recherche est gérée comme un MODE de la vue principale : quand
 * `search.query` est non-vide, la GridView passe en mode "résultats" et
 * affiche `search.results` au lieu de `folders`+`files` du dossier courant.
 * La TreeView reste navigationnelle peu importe le mode.
 */

type SelectionState = {
  roots: Set<string>;
  excluded: Set<string>;
  anchorId: string | null;
};

export type SortField = 'name' | 'type' | 'size' | 'date' | 'sender';
export type SortDirection = 'asc' | 'desc';
export type SortState = {
  primary: SortField;
  primaryDirection: SortDirection;
  secondary: SortField | null;
  secondaryDirection: SortDirection;
};

/**
 * Un résultat de recherche est un FinderNode enrichi avec son `parentPath`.
 * Le parentPath permet au composant `SearchResultsView` d'afficher où le
 * fichier se trouve (sous-titre type "pending/Stage/karate") et de naviguer
 * vers ce dossier au click.
 */
export type SearchResultNode = FinderNode & {
  parentPath: string;
};

export type SearchFlags = {
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
};

export type SearchState = {
  query: string;
  flags: SearchFlags;
  results: SearchResultNode[];
  truncated: boolean;
  loading: boolean;
};

type FinderState = {
  currentPath: string;
  setPath: (path: string) => void;

  folders: FinderNode[];
  files: FinderNode[];
  contentCache: Map<string, { folders: FinderNode[]; files: FinderNode[] }>;
  setContent: (data: { folders: FinderNode[]; files: FinderNode[] }) => void;
  cacheChildrenAt: (path: string, children: FinderNode[]) => void;
  reloadKey: number;
  reloadFolderContent: () => void;

  selection: SelectionState;
  setSelection: (ids: string[], anchorId?: string | null) => void;
  toggleSelect: (id: string) => void;
  selectOnly: (id: string) => void;
  selectRange: (ids: string[]) => void;
  excludeItem: (id: string) => void;
  clearSelection: () => void;

  multiSelectActive: boolean;
  enterMultiSelect: (firstId: string) => void;
  exitMultiSelect: () => void;

  viewMode: FinderViewMode;
  setViewMode: (mode: FinderViewMode) => void;

  /**
   * La lentille de statut posée sur la GRILLE.
   *
   * Depuis le chantier « arbre sans strate de statut », un dossier contient
   * ses contenus en attente ET ses contenus publiés. Ce filtre rend ce que la
   * strate donnait gratuitement — sans la strate.
   *
   * ⚠️ Il ne touche PAS l'arbre, délibérément. Il n'est jamais transmis à
   * `FinderTree` : la structure reste stable quel que soit le filtre actif.
   * Un arbre qui change de forme quand on change de lentille rend
   * indécidable la question « ce dossier a-t-il disparu parce qu'il est
   * filtré, ou parce qu'il n'existe plus ? ».
   */
  statusFilter: StatusFilter;
  setStatusFilter: (filter: StatusFilter) => void;

  sort: SortState;
  setSortPrimary: (field: SortField, direction?: SortDirection) => void;
  setSortSecondary: (field: SortField | null, direction?: SortDirection) => void;
  toggleSortDirection: (level: 'primary' | 'secondary') => void;
  resetSort: () => void;

  search: SearchState;
  setSearchQuery: (query: string) => void;
  toggleSearchFlag: (flag: keyof SearchFlags) => void;
  setSearchResults: (results: SearchResultNode[], truncated: boolean) => void;
  setSearchLoading: (loading: boolean) => void;
  clearSearch: () => void;
};

export type FinderViewMode = 'grid' | 'table' | 'compact';

const VIEW_MODE_STORAGE_KEY = 'akfc:finder:view-mode';

function loadViewMode(): FinderViewMode {
  if (typeof window === 'undefined') return 'grid';
  try {
    const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (saved === 'grid' || saved === 'table' || saved === 'compact') return saved;
  } catch { /* */ }
  return 'grid';
}

function saveViewMode(mode: FinderViewMode): void {
  try { localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode); } catch { /* */ }
}

const SORT_STORAGE_KEY = 'akfc:finder:sort';
const DEFAULT_SORT: SortState = {
  primary: 'name',
  primaryDirection: 'asc',
  secondary: null,
  secondaryDirection: 'asc',
};

function isValidSortField(v: unknown): v is SortField {
  return v === 'name' || v === 'type' || v === 'size' || v === 'date' || v === 'sender';
}
function isValidSortDirection(v: unknown): v is SortDirection {
  return v === 'asc' || v === 'desc';
}

function loadSort(): SortState {
  if (typeof window === 'undefined') return DEFAULT_SORT;
  try {
    const raw = localStorage.getItem(SORT_STORAGE_KEY);
    if (!raw) return DEFAULT_SORT;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return DEFAULT_SORT;
    const primary = isValidSortField(parsed.primary) ? parsed.primary : DEFAULT_SORT.primary;
    const primaryDirection = isValidSortDirection(parsed.primaryDirection)
      ? parsed.primaryDirection : DEFAULT_SORT.primaryDirection;
    const secondary = parsed.secondary === null ? null
      : isValidSortField(parsed.secondary) ? parsed.secondary : null;
    const secondaryDirection = isValidSortDirection(parsed.secondaryDirection)
      ? parsed.secondaryDirection : DEFAULT_SORT.secondaryDirection;
    return { primary, primaryDirection, secondary, secondaryDirection };
  } catch {
    return DEFAULT_SORT;
  }
}

function saveSort(sort: SortState): void {
  try { localStorage.setItem(SORT_STORAGE_KEY, JSON.stringify(sort)); } catch { /* */ }
}

/* ---- Search flags persistence ----
   La QUERY n'est pas persistée (éphémère) mais les FLAGS le sont
   (préférence user : si tu fais toujours du case-sensitive, tu ne veux
   pas le réactiver à chaque session). */
const SEARCH_FLAGS_STORAGE_KEY = 'akfc:finder:search-flags';
const DEFAULT_SEARCH_FLAGS: SearchFlags = {
  caseSensitive: false,
  wholeWord: false,
  useRegex: false,
};

function loadSearchFlags(): SearchFlags {
  if (typeof window === 'undefined') return DEFAULT_SEARCH_FLAGS;
  try {
    const raw = localStorage.getItem(SEARCH_FLAGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SEARCH_FLAGS;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return DEFAULT_SEARCH_FLAGS;
    return {
      caseSensitive: Boolean(parsed.caseSensitive),
      wholeWord: Boolean(parsed.wholeWord),
      useRegex: Boolean(parsed.useRegex),
    };
  } catch {
    return DEFAULT_SEARCH_FLAGS;
  }
}

function saveSearchFlags(flags: SearchFlags): void {
  try {
    localStorage.setItem(SEARCH_FLAGS_STORAGE_KEY, JSON.stringify(flags));
  } catch { /* */ }
}

export const useFinderStore = create<FinderState>((set) => ({
  currentPath: `${APP_ROOT}`,

  setPath: (path) =>
    set((state) => {
      const cached = state.contentCache.get(path);
      return {
        currentPath: path,
        folders: cached?.folders ?? [],
        files: cached?.files ?? [],
        selection: { roots: new Set(), excluded: new Set(), anchorId: null },
        multiSelectActive: false,
        // Sortie de la recherche au changement de path : la query est attachée
        // au prefix actuel, ça n'a plus de sens de la garder active.
        search: {
          ...state.search,
          query: '',
          results: [],
          truncated: false,
          loading: false,
        },
      };
    }),

  folders: [],
  files: [],
  contentCache: new Map(),

  setContent: ({ folders, files }) =>
    set((state) => {
      const newCache = new Map(state.contentCache);
      newCache.set(state.currentPath, { folders, files });
      return { folders, files, contentCache: newCache };
    }),

  cacheChildrenAt: (path, children) =>
    set((state) => {
      const folders = children.filter((c) => c.type === 'folder');
      const files = children.filter((c) => c.type === 'file');
      const newCache = new Map(state.contentCache);
      newCache.set(path, { folders, files });
      return { contentCache: newCache };
    }),

  reloadKey: 0,

  reloadFolderContent: () =>
    set((state) => ({
      reloadKey: state.reloadKey + 1,
      contentCache: new Map(),
    })),

  selection: {
    roots: new Set<string>(),
    excluded: new Set<string>(),
    anchorId: null,
  },

  setSelection: (ids, anchorId = null): void =>
    set(() => ({ selection: { roots: new Set(ids), excluded: new Set(), anchorId } })),

  toggleSelect: (id): void =>
    set((state) => {
      const { roots, excluded } = state.selection;
      const nextRoots = new Set(roots);
      const nextExcluded = new Set(excluded);
      if (nextRoots.has(id)) {
        nextRoots.delete(id);
      } else {
        nextRoots.add(id);
        nextExcluded.delete(id);
      }
      return { selection: { roots: nextRoots, excluded: nextExcluded, anchorId: id } };
    }),

  selectOnly: (id): void =>
    set(() => ({ selection: { roots: new Set([id]), excluded: new Set(), anchorId: id } })),

  selectRange: (ids): void =>
    set((state) => {
      if (!ids.length) return state;
      const nextRoots = new Set(state.selection.roots);
      for (const id of ids) nextRoots.add(id);
      return {
        selection: {
          ...state.selection,
          roots: nextRoots,
          anchorId: ids[ids.length - 1] ?? state.selection.anchorId,
        },
      };
    }),

  excludeItem: (id): void =>
    set((state) => {
      const nextExcluded = new Set(state.selection.excluded);
      nextExcluded.add(id);
      return { selection: { ...state.selection, excluded: nextExcluded } };
    }),

  clearSelection: (): void =>
    set(() => ({
      selection: {
        roots: new Set<string>(),
        excluded: new Set<string>(),
        anchorId: null,
      },
    })),

  multiSelectActive: false,

  enterMultiSelect: (firstId): void =>
    set(() => ({
      multiSelectActive: true,
      selection: {
        roots: new Set([firstId]),
        excluded: new Set(),
        anchorId: firstId,
      },
    })),

  exitMultiSelect: (): void =>
    set(() => ({
      multiSelectActive: false,
      selection: {
        roots: new Set<string>(),
        excluded: new Set<string>(),
        anchorId: null,
      },
    })),

  viewMode: loadViewMode(),
  statusFilter: loadStatusFilter(),

  setStatusFilter: (filter) => {
    saveStatusFilter(filter);
    set({ statusFilter: filter });
  },

  setViewMode: (mode) => {
    saveViewMode(mode);
    set({ viewMode: mode });
  },

  sort: loadSort(),

  setSortPrimary: (field, direction) => {
    set((state) => {
      let nextDirection: SortDirection;
      if (direction) nextDirection = direction;
      else if (state.sort.primary === field)
        nextDirection = state.sort.primaryDirection === 'asc' ? 'desc' : 'asc';
      else nextDirection = state.sort.primaryDirection;
      const next: SortState = {
        ...state.sort, primary: field, primaryDirection: nextDirection,
      };
      saveSort(next);
      return { sort: next };
    });
  },

  setSortSecondary: (field, direction) => {
    set((state) => {
      let nextDirection: SortDirection;
      if (direction) nextDirection = direction;
      else if (field !== null && state.sort.secondary === field)
        nextDirection = state.sort.secondaryDirection === 'asc' ? 'desc' : 'asc';
      else nextDirection = state.sort.secondaryDirection;
      const next: SortState = {
        ...state.sort, secondary: field, secondaryDirection: nextDirection,
      };
      saveSort(next);
      return { sort: next };
    });
  },

  toggleSortDirection: (level) => {
    set((state) => {
      const next: SortState = { ...state.sort };
      if (level === 'primary')
        next.primaryDirection = state.sort.primaryDirection === 'asc' ? 'desc' : 'asc';
      else
        next.secondaryDirection = state.sort.secondaryDirection === 'asc' ? 'desc' : 'asc';
      saveSort(next);
      return { sort: next };
    });
  },

  resetSort: () => {
    saveSort(DEFAULT_SORT);
    set({ sort: DEFAULT_SORT });
  },

  /* -------------------------------- SEARCH -------------------------------- */
  search: {
    query: '',
    flags: loadSearchFlags(),
    results: [],
    truncated: false,
    loading: false,
  },

  setSearchQuery: (query) =>
    set((state) => ({ search: { ...state.search, query } })),

  toggleSearchFlag: (flag) =>
    set((state) => {
      const nextFlags = { ...state.search.flags, [flag]: !state.search.flags[flag] };
      saveSearchFlags(nextFlags);
      return { search: { ...state.search, flags: nextFlags } };
    }),

  setSearchResults: (results, truncated) =>
    set((state) => ({
      search: { ...state.search, results, truncated, loading: false },
    })),

  setSearchLoading: (loading) =>
    set((state) => ({ search: { ...state.search, loading } })),

  clearSearch: () =>
    set((state) => ({
      search: {
        ...state.search,
        query: '',
        results: [],
        truncated: false,
        loading: false,
      },
    })),
}));
