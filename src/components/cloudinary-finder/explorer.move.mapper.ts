/**
 * explorer.move.mapper.ts
 *
 * Actions effectuées :
 * - Adaptation de explorerNodeToDragSource pour supporter 2 cas explicites :
 *   1) Drag unitaire (file/folder)
 *   2) Drag multi-select (type 'selection' + roots/excluded depuis le store)
 * - Garder explorerNodeToMoveTarget compatible avec RootNode (virtual-folder) et TreeNode (folder réel).
 */

import type { SelectionState } from '@/lib/selection/selection.types';

import type {
  TreeNode,
  RootNode,
} from '@/components/cloudinary-finder/types';
import type {
  DragSource,
  MoveTarget,
} from '@/shared/cloudinary/move.types';

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
    const roots = Array.from(input.selection.roots);
    const excludedArr = Array.from(input.selection.excluded);

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