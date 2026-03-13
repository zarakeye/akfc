import { SelectionState } from "@/features/cloudinary-finder/model/selection/selection.types";

function normalize(path: string): string {
  return path.replace(/^\/+|\/+$/g, "");
}

function isCoveredByRoot(path: string, roots: Set<string>): boolean {
  for (const root of roots) {
    if (path === root || path.startsWith(`${root}/`)) {
      return true;
    }
  }
  return false;
}

function isBlockedByExcluded(path: string, excluded: Set<string>): boolean {
  for (const ex of excluded) {
    if (path === ex || path.startsWith(`${ex}/`)) {
      return true;
    }
  }
  return false;
}

export function isItemSelected(
  itemPath: string,
  selection: SelectionState
): boolean {
  const path = normalize(itemPath);

  if (!isCoveredByRoot(path, selection.roots)) {
    return false;
  }

  if (isBlockedByExcluded(path, selection.excluded)) {
    return false;
  }

  return true;
}