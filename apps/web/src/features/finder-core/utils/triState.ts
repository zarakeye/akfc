type TriState = 'checked' | 'indeterminate' | 'unchecked';

type Item = {
  id: string;
  path: string;
};

export function getTriState(params: {
  item: Item;
  allItems: Item[];
  roots: Set<string>;
  excluded: Set<string>;
}): TriState {
  const { item, allItems, roots, excluded } = params;

  // 🔹 sélection directe
  if (roots.has(item.id)) {
    // si on a des exclusions dedans → indeterminate
    const hasExcludedDescendant = allItems.some(
      (i) =>
        i.path.startsWith(item.path + '/') &&
        excluded.has(i.id)
    );

    return hasExcludedDescendant ? 'indeterminate' : 'checked';
  }

  // 🔹 descendants sélectionnés ?
  const descendants = allItems.filter((i) =>
    i.path.startsWith(item.path + '/')
  );

  if (descendants.length === 0) {
    return 'unchecked';
  }

  const someSelected = descendants.some((i) => roots.has(i.id));
  const someExcluded = descendants.some((i) => excluded.has(i.id));

  if (someSelected) return 'indeterminate';
  if (someExcluded) return 'indeterminate';

  return 'unchecked';
}