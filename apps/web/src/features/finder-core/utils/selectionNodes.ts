import type { FinderNode } from '@akfc/contracts/finder/index.ts';

/**
  * Construit un pool de nodes indexé par `id` et par `path`. Le pool est utilisé
  * pour résoudre la sélection courante (set de `roots`) en nodes réels, en
  * combinant les nodes du dossier courant, du contentCache et des résultats de
  * recherche.
  *
  * @param input.folders - nodes de type folder du dossier courant
  * @param input.files - nodes de type file du dossier courant
  * @param input.contentCache - cache des nodes préchauffés par la TreeView
  * @param input.searchResults - résultats de recherche (optionnel)
  * @returns Map<id|path, FinderNode>
  */

/**
  * Résout la sélection courante (set de `roots`) en nodes réels, en utilisant le
  * pool construit par `buildNodePool`.
  *
  * @param roots - set de ids ou paths des nodes sélectionnés
  * @param pool - pool de nodes indexé par id et path
  * @returns Liste des FinderNode correspondant aux ids/paths dans `roots`
  */
export function buildNodePool(input: {
  folders: FinderNode[];
  files: FinderNode[];
  contentCache?: Map<string, { folders?: FinderNode[]; files?: FinderNode[] }>;
  searchResults?: FinderNode[];
}): Map<string, FinderNode> {
  const pool = new Map<string, FinderNode>();

  const add = (n: FinderNode) => {
    // On indexe par id ET par path. L'`id` d'un node peut être réassigné
    // après coup (useMediaAssetEnrichment merge les metas et reconstruit les
    // nodes), alors que le `path` est stable. `selection.roots` retient la
    // valeur au moment du clic ; en indexant les deux, la résolution retrouve
    // le node que `roots` contienne l'ancien id, le nouvel id, ou le path.
    if (!pool.has(n.id)) pool.set(n.id, n);
    if (!pool.has(n.path)) pool.set(n.path, n);
  };

  for (const f of input.folders) add(f);
  for (const f of input.files) add(f);

  if (input.contentCache) {
    for (const entry of input.contentCache.values()) {
      for (const f of entry.folders ?? []) add(f);
      for (const f of entry.files ?? []) add(f);
    }
  }

  for (const r of input.searchResults ?? []) add(r);

  return pool;
}

/**
  * Résout la sélection courante (set de `roots`) en nodes réels, en utilisant le
  * pool construit par `buildNodePool`.
  *
  * @param roots - set de ids ou paths des nodes sélectionnés
  * @param pool - pool de nodes indexé par id et path
  * @returns Liste des FinderNode correspondant aux ids/paths dans `roots`
  */
export function resolveSelectedNodes(
  roots: ReadonlySet<string>,
  pool: Map<string, FinderNode>,
): FinderNode[] {
  const out: FinderNode[] = [];
  for (const id of roots) {
    const node = pool.get(id);
    if (node) out.push(node);
  }
  return out;
}

/**
 * Les exclusions qui concernent une action sur `nodes` : celles rangées sous
 * l'un d'eux. Elles ne valent que si `nodes` est la sélection elle-même (des
 * racines) : un clic droit sur un dossier PARENT d'une racine vise ce dossier
 * en entier, pas « ce dossier sauf ce qu'on a décoché plus bas ».
 */
export function exclusionsUnder(
  nodes: readonly { id: string; path: string }[],
  selection: { roots: ReadonlySet<string>; excluded: ReadonlySet<string> },
): string[] {
  if (!nodes.every((n) => selection.roots.has(n.id))) return [];
  return [...selection.excluded].filter((ex) =>
    nodes.some((n) => ex.startsWith(`${n.path}/`)),
  );
}
