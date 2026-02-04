import type {
  TreeNode,
  StatusRootNode,
} from '@/components/cloudinary-finder/types';
import type {
  DragSource,
  MoveTarget,
} from '@/shared/cloudinary/move.types';

/* ----- DRAG ----- */
export function explorerNodeToDragSource(
  node: TreeNode
): DragSource {
  return {
    type: node.type,
    fullPath: node.fullPath,
  };
}

/* ----- DROP ----- */
export function explorerNodeToMoveTarget(
  node: TreeNode | StatusRootNode
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