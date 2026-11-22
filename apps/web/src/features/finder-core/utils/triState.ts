/**
 * La sélection du finder se décrit par des racines (ce qui a été coché) et des
 * exclusions (ce qui a été décoché sous une racine). Les identifiants des
 * nœuds sont leurs chemins : ces fonctions travaillent donc sur les seuls
 * chemins, sans avoir besoin du contenu des dossiers (qui n'est peut-être
 * pas chargé).
 *
 * Règle unique : parmi les marques (racines, exclusions) posées sur un chemin
 * ou sur l'un de ses ancêtres, la plus profonde décide. Une racine : coché.
 * Une exclusion : décoché. Aucune : décoché.
 */
export type TriState = 'checked' | 'indeterminate' | 'unchecked';

export type SelectionSets = {
  roots: ReadonlySet<string>;
  excluded: ReadonlySet<string>;
};

/** `path` est-il `ancestor`, ou rangé dessous ? Le `/` évite que `stages-2026` passe pour un enfant de `stages`. */
export function isSelfOrUnder(path: string, ancestor: string): boolean {
  return path === ancestor || path.startsWith(`${ancestor}/`);
}

export function isPathSelected(path: string, { roots, excluded }: SelectionSets): boolean {
  let depth = -1;
  let selected = false;
  for (const root of roots) {
    if (isSelfOrUnder(path, root) && root.length > depth) {
      depth = root.length;
      selected = true;
    }
  }
  for (const ex of excluded) {
    if (isSelfOrUnder(path, ex) && ex.length > depth) {
      depth = ex.length;
      selected = false;
    }
  }
  return selected;
}

/**
 * État de la case : cochée, à moitié (quelque chose dessous est dans l'autre
 * état), ou vide.
 */
export function getTriState(path: string, sets: SelectionSets): TriState {
  const below = (marks: ReadonlySet<string>): boolean =>
    [...marks].some((m) => m.startsWith(`${path}/`));
  if (isPathSelected(path, sets)) {
    return below(sets.excluded) ? 'indeterminate' : 'checked';
  }
  return below(sets.roots) ? 'indeterminate' : 'unchecked';
}

/**
 * Cocher ou décocher un élément, en gardant le moins de marques possible :
 * - coché par une racine posée sur lui : on retire la racine ;
 * - coché parce qu'un dossier au-dessus l'est : on l'exclut ;
 * - décoché : on le coche (on lève son exclusion, ou on en fait une racine).
 * Les marques posées SOUS lui disparaissent : il devient entièrement coché,
 * ou entièrement décoché.
 */
export function toggleInSelection(
  path: string,
  sets: SelectionSets,
): { roots: Set<string>; excluded: Set<string> } {
  const wasSelected = isPathSelected(path, sets);
  const roots = new Set([...sets.roots].filter((r) => !r.startsWith(`${path}/`)));
  const excluded = new Set([...sets.excluded].filter((e) => !e.startsWith(`${path}/`)));
  roots.delete(path);
  excluded.delete(path);
  const next = { roots, excluded };
  // Sans sa propre marque, il hérite de son ancêtre : on ne pose une marque
  // que si cet héritage ne donne pas l'état voulu.
  if (isPathSelected(path, next) === wasSelected) {
    (wasSelected ? excluded : roots).add(path);
  }
  return next;
}

/** Cocher (sans jamais décocher) : la plage Maj + clic. */
export function selectInSelection(path: string, sets: SelectionSets): SelectionSets {
  if (isPathSelected(path, sets)) return sets;
  return toggleInSelection(path, sets);
}
