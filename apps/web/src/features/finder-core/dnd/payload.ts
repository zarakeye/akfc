/**
 * 📦 Schéma du payload de drag-and-drop du finder.
 *
 * Ce module définit le contrat éphémère qui transite via `DataTransfer`
 * pendant un drag : la liste des items déplacés, leur identifiant, leur
 * path logique et leur type (folder|file).
 *
 * 🔑 Pourquoi un MIME custom (`application/x-finder-drag`) plutôt que
 * `application/json` ?
 *
 * Pour distinguer **nos** drags des drags génériques (fichier glissé
 * depuis l'OS, image glissée depuis un autre onglet, etc.). Un drop
 * handler du finder qui voit un payload non-finder peut l'ignorer
 * proprement plutôt que d'essayer de le parser et planter.
 */

import type { FinderNode } from '@contracts/finder';

export const FINDER_DRAG_MIME = 'application/x-finder-drag';

/* -------------------------------------------------------------------------- */
/*                                   PAYLOAD                                  */
/* -------------------------------------------------------------------------- */

export type DragItem = {
  id: string;
  path: string;
  type: 'folder' | 'file';
};

export type DragPayload = {
  items: DragItem[];
};

/**
 * Sérialise un payload pour `dataTransfer.setData`.
 */
export function serializePayload(payload: DragPayload): string {
  return JSON.stringify(payload);
}

/**
 * Tente de désérialiser un payload reçu via `dataTransfer.getData`.
 *
 * Retourne `null` si :
 *   - la chaîne est vide ou indéfinie
 *   - le JSON est invalide
 *   - la structure ne correspond pas au schéma attendu
 *
 * Cette validation défensive nous protège des drops venus d'ailleurs
 * (fichier OS, contenu copié depuis une autre app, etc.) qui pourraient
 * coïncider par hasard avec le même MIME.
 */
export function tryParsePayload(raw: string | undefined | null): DragPayload | null {
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!parsed || typeof parsed !== 'object') return null;
    const candidate = parsed as { items?: unknown };

    if (!Array.isArray(candidate.items)) return null;

    for (const item of candidate.items) {
      if (!item || typeof item !== 'object') return null;
      const i = item as { id?: unknown; path?: unknown; type?: unknown };
      if (typeof i.id !== 'string') return null;
      if (typeof i.path !== 'string') return null;
      if (i.type !== 'folder' && i.type !== 'file') return null;
    }

    return candidate as DragPayload;
  } catch {
    return null;
  }
}

/**
 * Construit un `DragItem` à partir d'un `FinderNode`.
 *
 * Helper de confort : on n'a besoin que d'un sous-ensemble des champs
 * du node pour traverser le DnD. Ça garde le payload compact (utile
 * quand on drag plusieurs dizaines d'items).
 */
export function dragItemFromNode(node: FinderNode): DragItem {
  return {
    id: node.id,
    path: node.path,
    type: node.type,
  };
}

/* -------------------------------------------------------------------------- */
/*                              VALIDATION RULES                              */
/* -------------------------------------------------------------------------- */

/**
 * Détermine si déposer `items` dans le dossier `targetPath` est autorisé.
 *
 * Règles communes au ghost (calcul du badge "allowed/forbidden") et au
 * drop handler du `FinderTreeFolder` (court-circuite l'appel API).
 *
 * Les règles sont volontairement minimales et structurelles — pas de
 * logique métier (statuts, permissions, etc.) qui reste l'affaire du
 * backend via `resolveMoveIntent`.
 *
 * Règles :
 *   1. **Pas de drop sur soi-même** : on n'autorise pas de déplacer un
 *      item dans son propre path (no-op qui prêterait à confusion).
 *   2. **Pas de drop dans un descendant** : un dossier ne peut pas être
 *      déplacé dans son propre sous-arbre (cycle invalide).
 *
 * Note : la règle "drop dans le parent direct = no-op" est gérée
 * séparément dans `isDropEffective` ci-dessous : c'est un drop techniquement
 * autorisé, mais qu'on évite pour ne pas faire d'aller-retour réseau inutile.
 */
export function isDropAllowed(targetPath: string, items: DragItem[]): boolean {
  for (const item of items) {
    // Pas de drop sur soi-même
    if (targetPath === item.path) return false;
    // Pas de drop dans un descendant de soi-même
    if (targetPath.startsWith(item.path + '/')) return false;
  }
  return true;
}

/**
 * Détermine si un drop autorisé aurait un effet réel.
 *
 * Si tous les items sont déjà directement dans `targetPath`, le drop ne
 * change rien : on l'évite pour ne pas faire d'aller-retour réseau.
 * À utiliser comme garde côté drop handler **après** `isDropAllowed`.
 */
export function isDropEffective(targetPath: string, items: DragItem[]): boolean {
  return items.some((item) => parentPath(item.path) !== targetPath);
}

function parentPath(p: string): string {
  const idx = p.lastIndexOf('/');
  return idx === -1 ? '' : p.slice(0, idx);
}
