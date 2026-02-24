import type { FolderNode, TreeNode } from "@/components/cloudinary-finder/types";

export type TriState = "checked" | "indeterminate" | "unchecked";

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