import { create } from "zustand";
import type { FinderNode } from "@contracts/finder";

/**
 * usePickerCartStore
 *
 * Panier de sélection média du picker — SOURCE DE VÉRITÉ UNIQUE, partagée par
 * toutes les surfaces qui permettent d'épingler un média (GridView, TreeView,
 * et plus tard les vues mobiles). Aucune dépendance au rendu : c'est un store
 * Zustand pur, consommable aussi bien par React DOM que par React Native.
 *
 * ─── Pourquoi un store séparé de `useFinderStore` ? ─────────────────────────
 *
 * `useFinderStore.setPath` PURGE la sélection (`selection.roots`) à chaque
 * navigation — c'est voulu pour le changement de statut. Le panier, lui, doit
 * SURVIVRE à la navigation : on pioche dans le dossier A, on navigue vers B, et
 * le panier garde le contenu de A. En vivant hors de `useFinderStore`, le
 * panier n'est jamais purgé par `setPath`. Les deux états coexistent sans se
 * gêner : multi-select Finder (statut) d'un côté, panier (pick) de l'autre.
 *
 * ─── Modèle de données ──────────────────────────────────────────────────────
 *
 * `items` est une `Map<path, FinderNode>` keyée par `node.path` (rappel :
 * `FinderNode.id === node.path` dans ce projet). On stocke le FinderNode
 * COMPLET (pas seulement le path) pour que le bandeau panier puisse afficher
 * une vignette + un nom sans re-résoudre chaque média. La `Map` préserve
 * l'ordre d'insertion → le panier s'affiche dans l'ordre où l'on a coché.
 *
 * À la validation, on extrait les `path` (`getPaths()`) pour les passer au
 * backend (`resolveByPaths`), qui reste la vérité finale. Les nodes stockés ne
 * servent qu'à l'affichage du bandeau le temps de la session picker.
 */

type PickerCartState = {
  /** Médias épinglés, keyés par path, dans l'ordre d'insertion. */
  items: Map<string, FinderNode>;

  /** Ajoute un média au panier (no-op s'il y est déjà). */
  addToCart: (node: FinderNode) => void;

  /** Retire un média du panier par son path (no-op s'il n'y est pas). */
  removeFromCart: (path: string) => void;

  /** Bascule la présence d'un média : l'ajoute s'il est absent, le retire sinon. */
  toggleCart: (node: FinderNode) => void;

  /** Vide entièrement le panier. */
  clearCart: () => void;

  /** Le path est-il dans le panier ? (sélecteur pour les surfaces de rendu) */
  isInCart: (path: string) => boolean;

  /** Liste ordonnée des paths — pour la validation (→ resolveByPaths). */
  getPaths: () => string[];

  /** Liste ordonnée des nodes — pour le rendu du bandeau panier. */
  getNodes: () => FinderNode[];
};

export const usePickerCartStore = create<PickerCartState>((set, get) => ({
  items: new Map<string, FinderNode>(),

  addToCart: (node) =>
    set((state) => {
      if (state.items.has(node.path)) return state; // déjà présent → no-op
      const next = new Map(state.items);
      next.set(node.path, node);
      return { items: next };
    }),

  removeFromCart: (path) =>
    set((state) => {
      if (!state.items.has(path)) return state; // absent → no-op
      const next = new Map(state.items);
      next.delete(path);
      return { items: next };
    }),

  toggleCart: (node) =>
    set((state) => {
      const next = new Map(state.items);
      if (next.has(node.path)) {
        next.delete(node.path);
      } else {
        next.set(node.path, node);
      }
      return { items: next };
    }),

  clearCart: () => set({ items: new Map<string, FinderNode>() }),

  isInCart: (path) => get().items.has(path),

  getPaths: () => Array.from(get().items.keys()),

  getNodes: () => Array.from(get().items.values()),
}));