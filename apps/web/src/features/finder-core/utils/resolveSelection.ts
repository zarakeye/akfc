type Item = {
  id: string;
  path: string;
};

export function resolveSelection(params: {
  items: Item[];
  roots: Set<string>;
  excluded: Set<string>;
}): Set<string> {
  const { items, roots, excluded } = params;

  const result = new Set<string>();

  for (const item of items) {
    // sélection directe
    if (roots.has(item.id)) {
      result.add(item.id);
      continue;
    }

    // sélection via parent
    const isChildOfRoot = Array.from(roots).some((rootId) => {
      const root = items.find((i) => i.id === rootId);
      if (!root) return false;

      return item.path.startsWith(root.path + '/');
    });

    if (isChildOfRoot && !excluded.has(item.id)) {
      result.add(item.id);
    }
  }

  return result;
}