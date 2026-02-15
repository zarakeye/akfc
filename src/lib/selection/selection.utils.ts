import { SelectionState } from "@lib/selection/selection.types";

/**
 * Checks if the given item path is selected in the selection state.
 * An item is considered selected if it is a root of the selection or
 * if it is a descendant of a root that is not excluded from the selection.
 * @param itemPath the path of the item to check
 * @param selection the selection state
 * @returns true if the item is selected, false otherwise
 */
export function isItemSelected(
  itemPath: string,
  selection: SelectionState
): boolean {
  for (const root of selection.roots) {
    if (root === itemPath || itemPath.startsWith(`${root}/`)) {
      return !selection.excluded.has(itemPath);
    }
  }

  return false;
}