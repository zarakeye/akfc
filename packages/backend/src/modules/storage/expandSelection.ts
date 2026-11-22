/**
 * expandSelection.ts
 *
 * Une sélection du finder se décrit par des racines et des exclusions :
 * « ce dossier, sauf cette photo ». Les services qui agissent par morceaux
 * entiers (la corbeille jette un dossier d'un bloc) ont besoin de l'inverse :
 * la liste des morceaux à prendre.
 *
 * Le découpage garde les morceaux aussi gros que possible : une racine sans
 * exclusion sous elle reste entière ; sinon on descend d'un niveau, et
 * seulement là où une exclusion se cache. Une photo exclue dans
 * `stages/2026/jour-1` laisse donc `stages/2026/jour-2` partir en un bloc.
 *
 * Fonction pure : la liste des descendants est fournie par l'appelant
 * (objets du stockage, dossiers connus en base), pour qu'elle reste testable
 * et indépendante du stockage.
 */

/** Chemin exclu, ou rangé sous un chemin exclu. */
export function isUnderExcluded(path: string, excluded: readonly string[]): boolean {
  return excluded.some((ex) => path === ex || path.startsWith(`${ex}/`));
}

export async function expandSelection(params: {
  roots: readonly string[];
  excluded: readonly string[];
  /** Tous les chemins sous `prefix` (qui finit par `/`) : fichiers et dossiers, à toute profondeur. */
  listDescendants: (prefix: string) => Promise<string[]>;
}): Promise<string[]> {
  const excluded = params.excluded.map(trimSlashes);
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (path: string): void => {
    if (seen.has(path)) return;
    seen.add(path);
    out.push(path);
  };

  for (const root of params.roots.map(trimSlashes)) {
    // Seule une exclusion EXACTE écarte une racine : une racine cochée à
    // nouveau dans un dossier exclu est voulue.
    if (excluded.includes(root)) continue;
    if (!excluded.some((ex) => ex.startsWith(`${root}/`))) {
      push(root);
      continue;
    }
    const descendants = (await params.listDescendants(`${root}/`)).map(trimSlashes);
    split(root, descendants, excluded, push);
  }
  return out;
}

function split(
  folder: string,
  descendants: readonly string[],
  excluded: readonly string[],
  push: (path: string) => void,
): void {
  const prefix = `${folder}/`;
  const children = new Set<string>();
  for (const path of descendants) {
    if (!path.startsWith(prefix)) continue;
    const name = path.slice(prefix.length).split("/")[0];
    if (name) children.add(`${prefix}${name}`);
  }
  for (const child of [...children].sort()) {
    if (isUnderExcluded(child, excluded)) continue;
    if (excluded.some((ex) => ex.startsWith(`${child}/`))) {
      split(child, descendants, excluded, push);
    } else {
      push(child);
    }
  }
}

function trimSlashes(path: string): string {
  return path.replace(/^\/+|\/+$/g, "");
}
