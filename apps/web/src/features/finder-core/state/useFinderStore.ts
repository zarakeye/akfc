import { create } from 'zustand';
import { APP_ROOT } from '@config/app';
import type { FinderNode } from '@contracts/finder';

/**
 * 🗂️ Store de gestion de l'état du Finder
 * Ce store gère :
 * - la navigation (currentPath)
 * - le contenu du dossier courant (folders, files)
 * - la sélection (selection.roots, selection.excluded)
 * 
 * La sélection est gérée via un système de "tri-state" avec :
 * - roots : les items explicitement sélectionnés
 * - excluded : les items explicitement exclus (dans le cas d'une sélection de masse)
 * - anchorId : pour gérer les sélections en range avec shift+click
 * 
 * Le store expose des méthodes pour mettre à jour ces états de manière cohérente.
 * 
 * Les chemins (path) utilisés dans le store sont des chemins logiques, qui sont la source de vérité pour le Finder.
 * Ils peuvent être différents des chemins physiques ou URLs selon l'adapter utilisé.
 * 
 * Ce store est indépendant de tout adapter ou UI spécifique, il gère uniquement la logique métier du Finder.
 * Les composants du Finder (ex: Finder, MediaPicker) utilisent ce store pour afficher les données et gérer les interactions.
 * Les adapters interagissent avec ce store pour mettre à jour le contenu et la navigation en fonction des actions de l'utilisateur.
 */


/* -------------------------------------------------------------------------- */
/*                                   SELECTION                                */
/* -------------------------------------------------------------------------- */
// La sélection est gérée via un système de "tri-state" avec :
// - roots : les items explicitement sélectionnés
// - excluded : les items explicitement exclus (dans le cas d'une sélection de masse)
// - anchorId : pour gérer les sélections en range avec shift+click
type SelectionState = {
  roots: Set<string>;
  excluded: Set<string>;
  anchorId: string | null; // 👈 pour shift+click
};

/* -------------------------------------------------------------------------- */
/*                                   STATE                                    */
/* -------------------------------------------------------------------------- */
// Ce type représente l'état global du Finder, incluant la navigation, le contenu et la sélection.
// Les chemins (path) utilisés dans le store sont des chemins logiques, qui sont la source de vérité pour le finder.
// Ce type est utilisé pour définir le store Zustand qui gère l'état du Finder.
// Les méthodes exposées permettent de mettre à jour cet état de manière cohérente en fonction des interactions de l'utilisateur.
// Les composants du Finder utilisent ce store pour afficher les données et gérer les interactions, tandis que les adapters interagissent avec ce store pour mettre à jour le contenu et la navigation.
type FinderState = {
  /* -------------------------------------------------------------------------- */
  /*                                  NAVIGATION                                */
  /* -------------------------------------------------------------------------- */

  currentPath: string;
  setPath: (path: string) => void;

  /* -------------------------------------------------------------------------- */
  /*                                   CONTENT                                  */
  /* -------------------------------------------------------------------------- */

  folders: FinderNode[];  // les dossiers du path courant
  files: FinderNode[];   // les fichiers du path courant

  /**
   * Cache des contenus déjà chargés, par path.
   *
   * Optimisation perf : quand l'utilisateur navigue dans un dossier puis
   * remonte chez un parent qu'il a déjà visité, on évite le re-fetch en
   * appliquant directement le contenu mémorisé. Plus de spinner pour les
   * paths "connus".
   *
   * Invalidation : `reloadFolderContent()` purge tout le cache pour forcer
   * un re-fetch frais (typiquement après une mutation). Pas de TTL — le
   * cache vit le temps de la session, ce qui est OK pour les modifs locales
   * (les modifs distantes nécessiteront un reload manuel).
   */
  contentCache: Map<string, { folders: FinderNode[]; files: FinderNode[] }>;

  // setContent remplace le contenu actuel par de nouveaux dossiers et fichiers.
  setContent: (data: {
    folders: FinderNode[];
    files: FinderNode[];
  }) => void;

  /**
   * Met dans le cache les enfants d'un path arbitraire (PAS forcément
   * `currentPath`). Permet à la TreeView de partager le cache avec la
   * GridView : quand `FinderTreeFolder` charge les enfants d'un node via
   * `getTree`, il les met dans ce cache pour que la GridView (`useFinderData`)
   * en profite quand on navigue vers ce path — et inversement.
   *
   * `children` peut être un mix folders + files ; on les split en interne.
   */
  cacheChildrenAt: (path: string, children: FinderNode[]) => void;

  /**
   * Compteur incrémenté pour forcer un rechargement du contenu courant.
   *
   * Le hook `useFinderData` écoute ce compteur dans son `useEffect` ; chaque
   * incrément déclenche un nouveau `adapter.list({ path: currentPath })`.
   *
   * Utilisé typiquement après un drop DnD réussi (les items déplacés ne
   * sont plus dans le dossier courant, il faut rafraîchir la grille).
   * Pourra être réutilisé après n'importe quelle mutation côté backend
   * (suppression, renommage, etc.).
   */
  reloadKey: number;

  /**
   * Force un rechargement du contenu du dossier courant.
   * Incrémente `reloadKey` ; ne touche ni au path ni à la sélection.
   */
  reloadFolderContent: () => void;

  /* -------------------------------------------------------------------------- */
  /*                                  SELECTION                                 */
  /* -------------------------------------------------------------------------- */

  selection: SelectionState;

  setSelection: (ids: string[], anchorId?: string | null) => void;
  toggleSelect: (id: string) => void;
  selectOnly: (id: string) => void;
  selectRange: (ids: string[]) => void;
  excludeItem: (id: string) => void;
  clearSelection: () => void;

  /* -------------------------------------------------------------------------- */
  /*                               MULTI-SELECT MODE                            */
  /* -------------------------------------------------------------------------- */
  /**
   * Le finder fonctionne en deux modes :
   *
   * - **Mode normal** (`multiSelectActive: false`) : un clic sur un dossier
   *   navigue dedans, un clic sur un fichier le sélectionne pour preview.
   *   Aucune checkbox n'est affichée dans la grille.
   *
   * - **Mode multi-select** (`multiSelectActive: true`) : un clic toggle la
   *   sélection de l'item, un double-clic sur un dossier navigue dedans
   *   (et fait sortir du mode via `setPath`). Les checkboxes sont visibles.
   *
   * On entre en mode multi-select via un long-press sur un item de la grille
   * (cf. hook `useLongPress`). On en sort via le bouton "Tout désélectionner"
   * de la toolbar, ou implicitement en navigant ailleurs.
   */
  multiSelectActive: boolean;

  /**
   * Entre en mode multi-select avec un item déjà sélectionné comme amorce.
   * Typiquement appelé par le déclenchement d'un long-press.
   */
  enterMultiSelect: (firstId: string) => void;

  /**
   * Sort du mode multi-select : remet la sélection à zéro et désactive le mode.
   * Typiquement câblé sur le bouton "Tout désélectionner" de la toolbar.
   */
  exitMultiSelect: () => void;

  /* -------------------------------------------------------------------------- */
  /*                                  VIEW MODE                                 */
  /* -------------------------------------------------------------------------- */

  /**
   * Mode d'affichage de la grille du finder.
   *
   * - **grid** : cards carrées (mode historique, par défaut)
   * - **table** : tableau avec colonnes nom / type / taille
   * - **compact** : liste dense d'une ligne par item
   *
   * Persisté en localStorage (clé `akfc:finder:view-mode`) pour respecter
   * la préférence de l'utilisateur entre sessions.
   */
  viewMode: FinderViewMode;
  setViewMode: (mode: FinderViewMode) => void;
};

export type FinderViewMode = 'grid' | 'table' | 'compact';

const VIEW_MODE_STORAGE_KEY = 'akfc:finder:view-mode';

function loadViewMode(): FinderViewMode {
  if (typeof window === 'undefined') return 'grid';
  try {
    const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (saved === 'grid' || saved === 'table' || saved === 'compact') {
      return saved;
    }
  } catch {
    /* mode privé / quota — fallback silencieux sur grid */
  }
  return 'grid';
}

function saveViewMode(mode: FinderViewMode): void {
  try {
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
  } catch {
    /* idem */
  }
}

/* -------------------------------------------------------------------------- */
/*                                   STORE                                    */
/* -------------------------------------------------------------------------- */

// Ce store gère l'état global du Finder, incluant la navigation, le contenu et la sélection.
// Les chemins (path) utilisés dans le store sont des chemins logiques, qui sont la source de vérité pour le finder.
// Ce store est utilisé par les composants du Finder pour afficher les données et gérer les interactions, tandis que les adapters interagissent avec ce store pour mettre à jour le contenu et la navigation.
export const useFinderStore = create<FinderState>((set) => ({
  /* -------------------------------- NAV -------------------------------- */

  currentPath: `${APP_ROOT}`,

  // setPath remplace le path actuel et reset la sélection (ex: lors d'une navigation).
  // Naviguer fait également sortir du mode multi-select : c'est un choix produit
  // pour éviter de se retrouver avec des checkboxes vides dans un nouveau dossier.
  //
  // ─── Reset folders/files au changement de path ────────────────────────────
  //
  // Sans ça, on observe un "flash" du contenu précédent pendant la phase de
  // chargement du nouveau path : `useFinderData` lance un fetch async qui
  // ne setContent() qu'à la fin, donc entre le clic et le retour de la
  // requête, la grille rend les `folders`/`files` du path PRÉCÉDENT.
  //
  // Cas concret : si l'utilisateur passe de `AKFC/bin` (où folders contient
  // `.trash` côté store, même si on rend FinderBinRootView) à
  // `AKFC/pending/Cours`, la grille montre brièvement `.trash` avant
  // d'afficher le contenu de `Cours`.
  //
  // Le reset immédiat à `[]` rend la grille temporairement vide pendant le
  // chargement — c'est le comportement attendu (l'overlay de loading prend
  // le relais visuel).
  setPath: (path) =>
    set((state) => {
      // Cache hit : on applique directement le contenu mémorisé.
      // Cache miss : on reset à [] (l'overlay de loading prend le relais
      // pendant que `useFinderData` lance le fetch).
      const cached = state.contentCache.get(path);
      return {
        currentPath: path,
        folders: cached?.folders ?? [],
        files: cached?.files ?? [],
        selection: {
          roots: new Set(),
          excluded: new Set(),
          anchorId: null,
        },
        multiSelectActive: false,
      };
    }),

  /* ------------------------------ CONTENT -------------------------------- */

  folders: [],
  files: [],

  contentCache: new Map(),

  // setContent remplace le contenu actuel ET mémorise dans le cache pour
  // le path courant. Sans cette mise en cache, la nav vers un parent déjà
  // visité re-déclencherait un fetch.
  setContent: ({ folders, files }) =>
    set((state) => {
      const newCache = new Map(state.contentCache);
      newCache.set(state.currentPath, { folders, files });
      return {
        folders,
        files,
        contentCache: newCache,
      };
    }),

  // Met dans le cache les children d'un path arbitraire (utilisé par
  // FinderTree / FinderTreeFolder pour mutualiser avec la GridView).
  cacheChildrenAt: (path, children) =>
    set((state) => {
      const folders = children.filter((c) => c.type === 'folder');
      const files = children.filter((c) => c.type === 'file');
      const newCache = new Map(state.contentCache);
      newCache.set(path, { folders, files });
      return { contentCache: newCache };
    }),

  reloadKey: 0,

  // Incrémente reloadKey ET purge tout le cache, pour que le re-fetch
  // soit garanti frais. Conservateur (purge globale) mais simple — pour
  // l'instant les mutations sont rares dans le finder, donc OK.
  reloadFolderContent: () =>
    set((state) => ({
      reloadKey: state.reloadKey + 1,
      contentCache: new Map(),
    })),

  /* ----------------------------- SELECTION -------------------------------- */
  /**
   * La sélection est gérée via un système de "tri-state" avec :
   * - roots : les items explicitement sélectionnés
   * - excluded : les items explicitement exclus (dans le cas d'une sélection de masse)
   * - anchorId : pour gérer les sélections en range avec shift+click
   * 
   * Ce système permet de gérer efficacement les sélections de masse (ex: "select all") sans avoir à stocker tous les ids sélectionnés, en utilisant les "roots" pour les items explicitement sélectionnés et les "excluded" pour les items explicitement exclus dans le cas d'une sélection de masse.
   * L'anchorId permet de gérer les sélections en range avec shift+click en gardant une référence à l'item de départ de la sélection.
   * 
   * Les méthodes exposées permettent de mettre à jour cette sélection de manière cohérente en fonction des interactions de l'utilisateur (clic simple, clic avec metaKey pour multi-sélection, clic avec shiftKey pour sélection en range).
   * La méthode clearSelection permet de réinitialiser la sélection, par exemple après une action de déplacement ou suppression pour éviter que des items sélectionnés soient dans un état incohérent.
   */
  selection: {
    roots: new Set<string>(),
    excluded: new Set<string>(),
    anchorId: null,
  },

  /**
   * Définit la sélection avec une liste d'ids et un anchorId optionnel pour les sélections en range.
   * Les ids fournis sont ajoutés aux "roots" de la sélection, et l'anchorId est mis à jour pour permettre les sélections en range avec shift+click.
   * Si aucun anchorId n'est fourni, il reste inchangé.
   * @param ids 
   * @param anchorId 
   * @returns 
   * @description Cette méthode est utilisée pour définir la sélection de manière explicite, par exemple lors d'une action de sélection en masse ou pour réinitialiser la sélection à un ensemble spécifique d'ids.
   */
  setSelection: (ids, anchorId = null): void =>
    set(() => ({
      selection: {
        roots: new Set(ids),
        excluded: new Set(),
        anchorId,
      },
    })),

  /**
   * Toggle la sélection d'un item. Si l'item est déjà sélectionné, il sera désélectionné, et inversement.
   * Si l'item est sélectionné, il est ajouté aux "roots" et retiré des "excluded". 
   * Si l'item est désélectionné, il est retiré des "roots".
   * L'anchorId est mis à jour avec l'id de l'item cliqué pour permettre les sélections en range avec shift+click.
   * @param id 
   * @returns 
   * @description Cette méthode est utilisée pour les clics avec metaKey (cmd/ctrl) pour permettre de sélectionner ou désélectionner des items de manière individuelle sans affecter les autres sélections.
   */
  toggleSelect: (id): void =>
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

  /**
   * Sélectionne uniquement l'item spécifié, en désélectionnant tous les autres.
   * @param id 
   * @returns 
   * @description Cette méthode est utilisée pour les clics simples sur un item, où l'on veut que seul cet item soit sélectionné.
   */
  selectOnly: (id): void =>
    set(() => ({
      selection: {
        roots: new Set([id]),
        excluded: new Set(),
        anchorId: id,
      },
    })),

  /**
   * Sélectionne une plage d'items
   * @param ids 
   * @returns void
   * @description Cette méthode est utilisée pour les sélections en range avec shift+click. 
   * Elle ajoute tous les ids de la plage à la sélection (roots) et met à jour l'anchorId avec le dernier id de la plage.
   */
  selectRange: (ids): void => 
    set((state) => {
      if (!ids.length) return state;

      const nextRoots = new Set(state.selection.roots);

      for (const id of ids) {
        nextRoots.add(id);
      }

      return {
        selection: {
          ...state.selection,
          roots: nextRoots,
          anchorId: ids[ids.length - 1] ?? state.selection.anchorId,
        },
      };
    }),

  /**
   * Exclut un item de la sélection (utilisé pour les sélections en range avec shift+click pour exclure certains items du range)
   * @param id 
   * @returns void
   */
  excludeItem: (id): void =>
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

  /**
   * Clear la sélection (utilisé par exemple après une action de déplacement ou suppression pour éviter que des items sélectionnés soient dans un état incohérent)
   * @returns void
   */
  clearSelection: (): void =>
    set(() => ({
      selection: {
        roots: new Set<string>(),
        excluded: new Set<string>(),
        anchorId: null,
      },
    })),

  /* ----------------------------- MULTI-SELECT ----------------------------- */

  multiSelectActive: false,

  /**
   * Entre en mode multi-select et amorce la sélection avec `firstId`.
   *
   * On sélectionne immédiatement l'item à l'origine du long-press : c'est
   * conforme à l'attente de l'utilisateur ("j'ai appuyé sur cet item, il
   * doit être sélectionné") et ça donne aussi un anchor pour shift+click
   * dans la foulée.
   */
  enterMultiSelect: (firstId): void =>
    set(() => ({
      multiSelectActive: true,
      selection: {
        roots: new Set([firstId]),
        excluded: new Set(),
        anchorId: firstId,
      },
    })),

  /**
   * Sort du mode multi-select et vide la sélection.
   *
   * Câblé sur le bouton "Tout désélectionner" de la toolbar. On a fait le
   * choix de ne pas garder le mode actif avec une sélection vide : ça évite
   * un état "checkboxes partout, rien de coché" qu'on jugerait désorientant.
   */
  exitMultiSelect: (): void =>
    set(() => ({
      multiSelectActive: false,
      selection: {
        roots: new Set<string>(),
        excluded: new Set<string>(),
        anchorId: null,
      },
    })),

  /* ------------------------------ VIEW MODE ------------------------------- */

  viewMode: loadViewMode(),

  setViewMode: (mode) => {
    saveViewMode(mode);
    set({ viewMode: mode });
  },
}));