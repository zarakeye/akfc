import { isPathSelected } from '#features/finder-core/utils/triState.ts';

type Item = {
  id: string;
  path: string;
};

/** Parmi `items`, les identifiants réellement sélectionnés (racines, et ce qu'elles couvrent sauf exclusions). */
export function resolveSelection(params: {
  items: Item[];
  roots: Set<string>;
  excluded: Set<string>;
}): Set<string> {
  const { items, roots, excluded } = params;
  const result = new Set<string>();
  for (const item of items) {
    if (isPathSelected(item.path, { roots, excluded })) result.add(item.id);
  }
  return result;
}
