'use client';

import { useCallback } from 'react';

import { trpc } from '@trpc/trpcClient';
import { APP_ROOT } from '@config/app';

import type { FinderNode } from '@contracts/finder';

import { useFinderStore } from '@features/finder-core/state/useFinderStore';
import {
  buildNodePool,
  resolveSelectedNodes,
} from '@features/finder-core/utils/selectionNodes';
import { storagePathOf } from '@features/finder-core/utils/storagePath';
import { baseNameOf } from '@features/finder-core/utils/fileType';

const BIN_PATH = `${APP_ROOT}/bin`;

/**
 * Hook centralisé pour les actions destructives/déplacement sur des
 * FinderNodes : "supprimer" (sens variable selon contexte).
 *
 * ─── Pourquoi un hook unique ─────────────────────────────────────────────
 *
 * Le mot "supprimer" ne signifie pas la même chose partout :
 *
 *   - Hors bin (pending, published, etc.) : "supprimer" = **mettre à la
 *     corbeille** (`trash.trashToBin`). Réversible.
 *   - Dans le bin : "supprimer" = **supprimer définitivement**
 *     (`trash.deleteForever`). Irréversible — nécessite confirmation.
 *
 * Plutôt que de dupliquer cette logique de dispatch dans chaque composant
 * (GridItem, FinderTreeFile, FinderTreeFolder, TrashEntryGrid, toolbars…),
 * on centralise ici :
 *   - `deleteNodes(nodes)` : action adaptative
 *   - `deleteLabel(count)` : libellé adaptatif pour le bouton/menu
 *   - `inBin` : booléen utile pour les composants qui veulent décorer
 *
 * ─── Invalidation des caches ─────────────────────────────────────────────
 *
 * Après mutation :
 *   - `reloadFolderContent()` : invalide le contentCache du finder
 *     (GridView + TreeView qui observe `reloadKey`)
 *   - `utils.trash.listBin.invalidate()` : invalide la query React Query
 *     qui alimente `FinderBinRootView` (vue plate du bin)
 *   - `exitMultiSelect()` : sort du mode sélection multiple (les ids
 *     supprimés deviendraient invalides sinon)
 */
export function useNodeActions(): {
  /** Action delete sur une liste explicite de nodes. */
  deleteNodes: (nodes: FinderNode[]) => Promise<void>;
  /**
   * Renomme un node (move vers le même dossier). Retourne `null` en cas de
   * succès, sinon le message d'erreur à afficher — le projet n'a pas de
   * système de toast, l'appelant l'affiche inline.
   */
  renameNode: (
    node: FinderNode,
    newBaseName: string,
  ) => Promise<string | null>;
  /**
   * Déplace des nodes vers un dossier. Retourne `null` en cas de succès,
   * sinon le message d'erreur à afficher.
   */
  moveNodes: (
    nodes: FinderNode[],
    destination: string,
  ) => Promise<string | null>;
  /**
   * Résout la "sélection effective" autour d'un node focused :
   *   - Si multi-select actif ET le node est dans la sélection → tous les
   *     nodes sélectionnés sont retournés.
   *   - Sinon → juste le node focused.
   * Reflète la sémantique du DnD : drag depuis un node "sélectionné" drag
   * toute la sélection ; sinon drag juste l'item visé.
   */
  effectiveNodesFor: (focusedNode: FinderNode) => FinderNode[];
  /**
   * Label du bouton/menu selon le nombre d'items affectés et le contexte
   * (bin → "Supprimer définitivement" ; ailleurs → "Mettre à la corbeille").
   *
   * Passer les nodes en second argument pour matcher la sémantique de
   * `deleteNodes` (détection par node.path, pas par currentPath).
   * Sans nodes, on retombe sur le contexte global de la GridView.
   */
  deleteLabel: (count: number, nodes?: FinderNode[]) => string;
  inBin: boolean;
  isPending: boolean;
} {
  const currentPath = useFinderStore((s) => s.currentPath);
  const folders = useFinderStore((s) => s.folders);
  const files = useFinderStore((s) => s.files);
  const contentCache = useFinderStore((s) => s.contentCache);
  const searchResults = useFinderStore((s) => s.search.results);
  const selection = useFinderStore((s) => s.selection);
  const multiSelectActive = useFinderStore((s) => s.multiSelectActive);
  const reloadFolderContent = useFinderStore((s) => s.reloadFolderContent);
  const exitMultiSelect = useFinderStore((s) => s.exitMultiSelect);

  const utils = trpc.useUtils();
  const trashToBinMutation = trpc.trash.trashToBin.useMutation();
  // ─── purge (path-based) au lieu de deleteForever (id-based) ──────────
  //
  // `trash.deleteForever` exige des TrashEntry.id et plante si une id
  // n'existe pas en DB. Or l'UI finder n'a accès qu'aux **paths** des
  // nodes (extraire un uuid via regex ne garantit pas qu'il y ait une
  // TrashEntry derrière — cas typique : vestiges Cloudinary post-rollback).
  //
  // `trash.purge` accepte directement des paths et gère les deux cas
  // (TrashEntry existante → flow standard ; vestige → suppression physique).
  // Cf. purge.service.ts pour le détail des garde-fous.
  const purgeMutation = trpc.trash.purge.useMutation();
  const renameMutation = trpc.storage.rename.useMutation();
  const moveMutation = trpc.storage.move.useMutation();

  // Détection du contexte global : on est "dans le bin" si le path courant
  // est exactement la racine du bin OU un descendant (drilldown). Utilisé
  // pour les composants de **toolbar** (MultiSelectToolbar, etc.) qui n'ont
  // pas de node de référence et qui veulent décorer leur bouton selon le
  // contexte global de la GridView.
  //
  // ⚠️ Pour les composants qui ont un node sous la main (ContextMenu sur un
  // GridItem ou un node TreeView), préférer passer les nodes à `deleteLabel`
  // pour avoir la cohérence label ↔ action — `deleteNodes` détecte aussi
  // par node.path, pas par currentPath.
  const inBin =
    currentPath === BIN_PATH || currentPath.startsWith(`${BIN_PATH}/`);

  const deleteLabel = useCallback(
    (count: number, nodes?: FinderNode[]): string => {
      // Si on a des nodes en référence, on détecte par leur path (cohérent
      // avec ce que deleteNodes fait). Sinon on retombe sur inBin global.
      const targetInBin =
        nodes && nodes.length > 0
          ? nodes[0].path === BIN_PATH ||
            nodes[0].path.startsWith(`${BIN_PATH}/`)
          : inBin;

      if (targetInBin) {
        if (count <= 1) return 'Supprimer définitivement';
        return `Supprimer la sélection (${count})`;
      }
      // Hors bin : on "supprime" en mettant à la corbeille
      if (count <= 1) return 'Mettre à la corbeille';
      return `Mettre la sélection à la corbeille (${count})`;
    },
    [inBin],
  );

  const deleteNodes = useCallback(
    async (nodes: FinderNode[]) => {
      if (nodes.length === 0) return;

      // ─── Détection contextuelle par les paths des nodes ───────────────
      //
      // ⚠️ NE PAS utiliser `inBin` ici (qui est calculé sur `currentPath`,
      // c-à-d où se trouve la GridView principale). Un right-click sur un
      // node TreeView du bin alors que la GridView est sur `pending/` doit
      // dispatcher vers `purge`, pas vers `trashToBin`.
      //
      // Convention : on détecte par le **premier node** de la sélection.
      // En pratique, une sélection est toujours homogène (tous dans le bin
      // ou tous hors bin) parce qu'on sélectionne dans une même vue. Le cas
      // mixed est une sélection cross-context construite manuellement, rare
      // et probablement déjà brisée par d'autres invariants UI.
      const firstNodeInBin =
        nodes[0].path === BIN_PATH ||
        nodes[0].path.startsWith(`${BIN_PATH}/`);

      if (firstNodeInBin) {
        // ─── Bin → trash.purge (path-based, tolérant) ────────────────
        //
        // On envoie les **paths complets** des nodes (pas d'extraction
        // d'uuid). Le backend dérive lui-même les wrapper paths et
        // dédoublonne. Couvre :
        //   - Les TrashEntry connues (flow standard, deleteForever logic)
        //   - Les vestiges Cloudinary sans TrashEntry (suppression physique)
        //
        // Plus aucune erreur "missing TrashEntry ids" même avec un mix de
        // TrashEntry valides et de vestiges dans la sélection.
        const paths = nodes.map((n) => n.path);

        await purgeMutation.mutateAsync({
          appRoot: APP_ROOT,
          paths,
        });

        // Invalidation supplémentaire pour la vue plate du bin (qui utilise
        // une React Query séparée du contentCache du finder).
        utils.trash.listBin.invalidate();
      } else {
        // ─── Hors bin → trashToBin ──────────────────────────────────────
        const sources = nodes.map((n) => ({
          kind: n.type === 'folder' ? ('folder' as const) : ('file' as const),
          fullPath: storagePathOf(n),
        }));
        await trashToBinMutation.mutateAsync({
          appRoot: APP_ROOT,
          sources,
          logical: true,
        });
        utils.storage.getAttentionCounts.invalidate();
      }

      reloadFolderContent();
      exitMultiSelect();
    },
    [
      // `inBin` n'est plus listé : on lit `nodes[0].path` qui n'est pas
      // une dépendance React (vient de l'argument runtime).
      trashToBinMutation,
      purgeMutation,
      utils.trash.listBin,
      reloadFolderContent,
      exitMultiSelect,
    ],
  );

  const effectiveNodesFor = useCallback(
    (focusedNode: FinderNode): FinderNode[] => {
      if (multiSelectActive && selection.roots.has(focusedNode.id)) {
        // Multi-select avec focusedNode dedans → toute la sélection.
        //
        // ⚠️ La sélection est partagée Grid + Tree (même `selection.roots`).
        // On reconstitue donc depuis le POOL GLOBAL (dossier courant + tout
        // le contentCache préchauffé par la TreeView + résultats de
        // recherche), pas depuis le seul dossier grid courant — sinon un
        // item coché dans l'arbre serait compté mais introuvable, et l'action
        // s'appliquerait à un sous-ensemble (voire à rien).
        const pool = buildNodePool({
          folders,
          files,
          contentCache,
          searchResults,
        });
        return resolveSelectedNodes(selection.roots, pool);
      }
      return [focusedNode];
    },
    [multiSelectActive, selection.roots, folders, files, contentCache, searchResults],
  );

  /**
   * Renomme un node. Retourne `null` si tout s'est bien passé, sinon le
   * message d'erreur à afficher (collision de nom, nom invalide…) — le
   * projet n'a pas de système de toast, l'appelant l'affiche inline.
   */
  const renameNode = useCallback(
    async (node: FinderNode, newBaseName: string): Promise<string | null> => {
      const clean = newBaseName.trim();
      if (!clean) return 'Le nom ne peut pas être vide.';
      if (clean === baseNameOf(node.name, node.meta?.format)) return null;

      try {
        await renameMutation.mutateAsync({
          path: storagePathOf(node),
          type: node.type === 'folder' ? 'folder' : 'file',
          newBaseName: clean,
        });
        reloadFolderContent();
        return null;
      } catch (err) {
        return err instanceof Error ? err.message : 'Le renommage a échoué.';
      }
    },
    [renameMutation, reloadFolderContent],
  );

  /**
   * Déplacement via `storage.move` — un seul node donne une source
   * `file`/`folder`, plusieurs donnent une source `selection`.
   */
  const moveNodes = useCallback(
    async (
      nodes: FinderNode[],
      destination: string,
    ): Promise<string | null> => {
      if (nodes.length === 0) return null;

      const source =
        nodes.length === 1
          ? {
              type: (nodes[0].type === 'folder' ? 'folder' : 'file') as
                | 'folder'
                | 'file',
              path: storagePathOf(nodes[0]),
            }
          : {
              type: 'selection' as const,
              roots: nodes.map(storagePathOf),
            };

      try {
        await moveMutation.mutateAsync({
          intent: {
            source,
            target: { type: 'folder', path: destination },
          },
        });
        reloadFolderContent();
        return null;
      } catch (err) {
        return err instanceof Error
          ? err.message
          : 'Le déplacement a échoué.';
      }
    },
    [moveMutation, reloadFolderContent],
  );

  return {
    deleteNodes,
    renameNode,
    moveNodes,
    effectiveNodesFor,
    deleteLabel,
    inBin,
    isPending:
      trashToBinMutation.isPending ||
      purgeMutation.isPending ||
      renameMutation.isPending ||
      moveMutation.isPending,
  };
}