import type { FolderNode, TreeNode } from "@contracts/cloudinary/finder.types";

export type TriState = "checked" | "indeterminate" | "unchecked";

/**
 * Compute the tri-state of a folder node, given an isSelected function.
 *
 * The tri-state is computed as follows:
 * - If the folder has at least one selected child and one unselected child, the tri-state is 'indeterminate'.
 * - If the folder has at least one selected child, the tri-state is 'checked'.
 * - If the folder has no selected children, the tri-state is 'unchecked'.
 *
 * @param folder - The folder node to compute the tri-state for.
 * @param isSelected - A function that takes a path and returns true if the node at that path is selected, false otherwise.
 * @returns The tri-state of the folder node.
 */
function getFolderTriState(
  folder: FolderNode,
  isSelected: (path: string) => boolean
): TriState {
  let anySelected = false;
  let anyUnselected = false;

  const walk = (node: TreeNode) => {
    if (node.type === 'file') {
      if (isSelected(node.fullPath)) anySelected = true;
      else anyUnselected = true;
      return;
    }

    // node folder: on ne compte pas le node lui-même comme "élément sélectionné",
    // on regarde uniquement sa descendance
    for (const child of node.children) {
      walk(child);
      if (anySelected && anyUnselected) return;
    }
  };

  // ✅ IMPORTANT: on part des enfants du folder, pas du folder
  for (const child of folder.children) {
    walk(child);
    if (anySelected && anyUnselected) break;
  }

  if (!anySelected && !anyUnselected) return 'unchecked'; // folder vide

  if (anySelected && anyUnselected) return 'indeterminate';
  if (anySelected) return 'checked';
  return 'unchecked';
}