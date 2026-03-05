/**
 * explorer.move.mapper.ts
 *
 * Actions effectuées :
 * - Adaptation de explorerNodeToDragSource pour supporter 2 cas explicites :
 *   1) Drag unitaire (file/folder)
 *   2) Drag multi-select (type 'selection' + roots/excluded depuis le store)
 * - Garder explorerNodeToMoveTarget compatible avec RootNode (virtual-folder) et TreeNode (folder réel).
 */

import type { SelectionState } from '@/features/cloudinary-finder/model/selection/selection.types';

import type {
  TreeNode,
  RootNode,
} from '@/features/cloudinary-finder/model/explorer/finder-ui.types';
import type {
  DragSource,
  MoveTarget,
} from '@/shared/cloudinary/move.types';

function normalizePath(p: string) {
  return p.replace(/^\/+|\/+$/g, '');
}

/**
 * ✅ Filtre “actionnable” (validé) pour roots/excluded.
 *
 * Spécification UX (fixée) :
 * - Les éléments indéterminés ne doivent PAS subir d'actions (move/delete).
 *
 * Dans roots/excluded, un root devient “indéterminé” dès qu'il possède au moins
 * une exclusion sous lui.
 *
 * => on retire donc des roots tout root qui a une exclusion (ex === root ou ex sous root/)
 * => on retire aussi les exclusions qui ne sont pas sous un root conservé
 */
function filterSelectionForActions(selection: SelectionState): SelectionState {
  const roots = Array.from(selection.roots, normalizePath);
  const excluded = Array.from(selection.excluded, normalizePath);

  const validRoots: string[] = [];

  for (const r of roots) {
    const hasExcludedUnder = excluded.some((ex) => ex === r || ex.startsWith(`${r}/`));
    if (!hasExcludedUnder) validRoots.push(r);
  }

  const validRootsSet = new Set(validRoots);
  const validExcluded = excluded.filter((ex) => {
    for (const r of validRootsSet) {
      if (ex === r || ex.startsWith(`${r}/`)) return true;
    }
    return false;
  });

  return {
    roots: new Set(validRoots),
    excluded: new Set(validExcluded),
  };
}

type DragInput =
  | {
      kind: 'single';
      node: TreeNode; // file | folder only in the explorer
    }
  | {
      kind: 'selection';
      selection: SelectionState; // roots + excluded (from zustand store)
    } 

/* ----- DRAG SOURCE ----- */
export function explorerNodeToDragSource(
  input: DragInput
): DragSource {
  /**
   * ✅ CAS mlti-select : payload Zod "selection"
   */
  if (input.kind === 'selection') {
    // ✅ On n'envoie que la partie “validée / actionnable”
    // (les roots indéterminés ne doivent pas subir d'action)
    const actionable = filterSelectionForActions(input.selection);
    const roots = Array.from(actionable.roots);
    const excludedArr = Array.from(actionable.excluded);

    return {
      type: 'selection',
      roots,
      // 👇 Action : n'envoyer excluded que si non-vide (sinon on laisse undefined)
      excluded: excludedArr.length ? excludedArr : undefined,
    }
  }

  /**
   * ✅ CAS unitaire : payload Zod "file" ou "folder"
   */
  const node = input.node;

  if (node.type === 'file' || node.type === 'folder') {
    return {
      type: node.type,
      fullPath: node.fullPath,
    };
  }

  // ⚠️ Sécurité : TreeNode ne devrait pas contenir 'virtual-folder' de toute façon
  throw new Error(`Invalid node type for drag: ${(node as TreeNode).type}`);
}

/* ----- DROP ----- */
export function explorerNodeToMoveTarget(
  node: TreeNode | RootNode
): MoveTarget {
  if (node.type === 'virtual-folder') {
    return {
      type: 'virtual-folder',
      status: node.status,
    };
  }

  // folder réel
  return {
    type: 'folder',
    fullPath: node.fullPath,
  };
}