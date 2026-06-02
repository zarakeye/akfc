import type { FinderNode } from '@contracts/finder';
import type {
  SortField,
  SortDirection,
  SortState,
} from '@features/finder-core/state/useFinderStore';

/**
 * Trie un tableau de FinderNodes selon un critère primaire et un critère
 * secondaire optionnel (départage des items égaux sur le primaire).
 *
 * Pattern explorateurs OS (macOS Finder, Windows Explorer, Nautilus).
 *
 * ─── Champs supportés ──────────────────────────────────────────────────
 *
 *   - `name`   : comparaison locale (Intl.Collator FR par défaut, gère
 *                les accents, la casse, les nombres dans les noms).
 *   - `type`   : folders avant files (convention universelle des explorateurs).
 *                Pour les files, départage par `meta.kind` puis par `meta.format`.
 *   - `size`   : taille en octets. `undefined` traité comme 0 (folders
 *                n'ont typiquement pas de size — ils restent groupés en
 *                tête grâce au compareByType implicite si on ajoute un
 *                tie-break par name).
 *   - `date`   : ⚠️ placeholder — MediaMeta n'expose pas encore de date.
 *                Tombe sur stabilité d'Array.sort en attendant.
 *   - `sender` : ⚠️ idem placeholder.
 *
 * ─── Direction ─────────────────────────────────────────────────────────
 *
 * `asc` : alphanumérique croissant, taille croissante, dates anciennes
 * en premier. `desc` inverse.
 *
 * ─── Stabilité ─────────────────────────────────────────────────────────
 *
 * `Array.prototype.sort` est stable depuis ES2019 — l'ordre relatif des
 * items égaux sur (primary, secondary) est préservé depuis l'ordre du
 * tableau source (typiquement l'ordre d'insertion backend).
 */

// Collator unique : créer une instance par sort est inutile et coûteux.
// `numeric: true` trie correctement "photo2.jpg" < "photo10.jpg".
const COLLATOR = new Intl.Collator('fr', {
  numeric: true,
  sensitivity: 'base',
});

function compareNames(a: FinderNode, b: FinderNode): number {
  return COLLATOR.compare(a.name, b.name);
}

function compareSizes(a: FinderNode, b: FinderNode): number {
  // Folders n'ont pas de size — fallback à 0 pour qu'ils se groupent en tête.
  return (a.size ?? 0) - (b.size ?? 0);
}

function compareTypes(a: FinderNode, b: FinderNode): number {
  // Folders d'abord — convention universelle (KIND_ORDER.folder = 0).
  if (a.type !== b.type) {
    return a.type === 'folder' ? -1 : 1;
  }
  if (a.type === 'folder' && b.type === 'folder') {
    return compareNames(a, b);
  }

  // À type égal pour deux fichiers : compare par kind effectif, puis format,
  // puis nom. L'ordre des kinds est défini par KIND_ORDER (Q1=B).
  const kindA = deriveEffectiveKind(a);
  const kindB = deriveEffectiveKind(b);
  const orderA = KIND_ORDER[kindA] ?? 99;
  const orderB = KIND_ORDER[kindB] ?? 99;
  if (orderA !== orderB) return orderA - orderB;

  const aFormat = (a.meta?.format ?? '').toUpperCase();
  const bFormat = (b.meta?.format ?? '').toUpperCase();
  if (aFormat !== bFormat) return COLLATOR.compare(aFormat, bFormat);

  // Tie-break par nom
  return compareNames(a, b);
}

/**
 * Compare par date d'upload (`meta.createdAt`, ISO 8601).
 *
 * Folders : toujours considérés sans date → comparés entre eux par nom,
 * et placés en tête (folder.type → -1 dans `compareTypes`-like logic).
 * Sauf qu'ici on ne trie pas par type, on trie par date — donc les
 * folders tombent en tête comme "sans date" (= chaîne vide qui se trie
 * avant n'importe quelle date ISO).
 *
 * Files sans `createdAt` (MediaAsset DB absente — fichier orphelin) :
 * comparés entre eux par nom, et placés à la fin (after les dated files
 * en mode asc, before en mode desc — la logique est juste "missing data
 * → poussé en bout").
 */
function compareDates(a: FinderNode, b: FinderNode): number {
  // Folders en tête peu importe la direction — pas de date applicable.
  if (a.type === 'folder' && b.type !== 'folder') return -1;
  if (a.type !== 'folder' && b.type === 'folder') return 1;
  if (a.type === 'folder' && b.type === 'folder') {
    return compareNames(a, b);
  }

  const aDate = a.meta?.createdAt;
  const bDate = b.meta?.createdAt;

  // Les deux sans date → tie-break par nom
  if (!aDate && !bDate) return compareNames(a, b);
  // L'un sans date → poussé en queue (always negative comparator val
  // = "a first"; on veut "missing last" donc on retourne +1 pour `a` missing)
  if (!aDate) return 1;
  if (!bDate) return -1;

  // ISO 8601 se compare correctement comme string (l'ordre lexico est
  // identique à l'ordre chronologique). On reste sur string compare pour
  // éviter de parser N Dates.
  if (aDate < bDate) return -1;
  if (aDate > bDate) return 1;
  return compareNames(a, b); // tie-break
}

/**
 * Compare par expéditeur (`meta.uploadedBy`).
 *
 * Pareil que dates : folders en tête, files sans uploader en queue.
 */
function compareSenders(a: FinderNode, b: FinderNode): number {
  if (a.type === 'folder' && b.type !== 'folder') return -1;
  if (a.type !== 'folder' && b.type === 'folder') return 1;
  if (a.type === 'folder' && b.type === 'folder') {
    return compareNames(a, b);
  }

  const aSender = a.meta?.uploadedBy;
  const bSender = b.meta?.uploadedBy;

  if (!aSender && !bSender) return compareNames(a, b);
  if (!aSender) return 1;
  if (!bSender) return -1;

  const senderCmp = COLLATOR.compare(aSender, bSender);
  if (senderCmp !== 0) return senderCmp;
  return compareNames(a, b);
}

/**
 * Dispatch sur le bon comparateur pour un field donné.
 * Retourne 0 si le field n'est pas exploitable (genre `date` quand le
 * meta n'a pas encore ce champ) — le tri secondaire ou la stabilité
 * native d'`Array.sort` prendront le relais.
 */
function compareByField(
  a: FinderNode,
  b: FinderNode,
  field: SortField,
): number {
  switch (field) {
    case 'name':
      return compareNames(a, b);
    case 'size':
      return compareSizes(a, b);
    case 'type':
      return compareTypes(a, b);
    case 'date':
      return compareDates(a, b);
    case 'sender':
      return compareSenders(a, b);
    default: {
      // exhaustive check — TS attrape si un nouveau SortField est ajouté
      // sans branche correspondante.
      const _exhaustive: never = field;
      void _exhaustive;
      return 0;
    }
  }
}

/**
 * Applique un comparateur avec une direction.
 * `desc` inverse simplement le résultat — pas besoin d'un comparateur
 * spécifique par sens.
 */
function applyDirection(cmp: number, direction: SortDirection): number {
  return direction === 'asc' ? cmp : -cmp;
}

/**
 * Trie une liste de FinderNodes selon l'état de sort fourni.
 *
 * **Non-mutating** : retourne une nouvelle liste (copie via `[...nodes]`
 * avant `.sort()`). Le caller peut conserver sa source intacte (utile
 * pour useMemo ou tester si le tri a effectivement changé l'ordre).
 */
export function sortNodes(
  nodes: FinderNode[],
  sort: SortState,
): FinderNode[] {
  const sorted = [...nodes];
  sorted.sort((a, b) => {
    const primary = applyDirection(
      compareByField(a, b, sort.primary),
      sort.primaryDirection,
    );
    if (primary !== 0) return primary;

    if (sort.secondary !== null) {
      const secondary = applyDirection(
        compareByField(a, b, sort.secondary),
        sort.secondaryDirection,
      );
      if (secondary !== 0) return secondary;
    }

    return 0; // stable sort prend le relais
  });
  return sorted;
}

/* -------------------------------------------------------------------------- */
/*                              GROUP BY TRI                                  */
/* -------------------------------------------------------------------------- */

/**
 * Métadonnées d'un groupe de nodes consécutifs (pour les headers de section
 * dans la grid view).
 *
 * `key` : identifiant interne stable (clé React), insensible à la
 *         localisation.
 * `label` : libellé affiché à l'utilisateur (FR, déjà capitalisé). Vide
 *           si la field ne supporte pas le groupage (date, sender pour
 *           l'instant) — le caller ne rend pas de header dans ce cas.
 */
export type GroupInfo = {
  key: string;
  label: string;
  /**
   * Pour le groupage hiérarchique (utilisé par 'type') : la catégorie parent
   * sous laquelle ce groupe se range. Par exemple, le format `pdf` a pour
   * parent `document` ; le format `mp3` a pour parent `audio`.
   *
   * Si absent, le groupe est top-level — pas de header parent rendu.
   */
  parentKey?: string;
  parentLabel?: string;
};

export type NodeGroup = {
  key: string;
  label: string;
  parentKey?: string;
  parentLabel?: string;
  nodes: FinderNode[];
};

// Libellés des types fichier en français.
//
// Ordre logique (utilisé par compareTypes) : folder → document → image → video → audio
// L'ordre alphabétique (préférence Stéphane Q1=B) est respecté en remplaçant
// le tableau KIND_ORDER plus bas.
const TYPE_LABELS: Record<string, string> = {
  folder: 'Dossiers',
  image: 'Images',
  video: 'Vidéos',
  audio: 'Audios',
  document: 'Documents',
};

/**
 * Ordre des kinds dans le tri (Q1=B — alphabétique sur les labels FR).
 *
 *   folder → Documents → Images → Vidéos → Audios
 *
 * Cet ordre détermine l'index de chaque kind dans compareTypes (folders en
 * tête puis ordre alphabétique des autres). Modifier ici si tu veux changer
 * la séquence visuelle.
 */
const KIND_ORDER: Record<string, number> = {
  folder: 0,
  document: 1,
  image: 2,
  video: 3,
  audio: 4,
};

/**
 * 🧭 Dérive le `kind` effectif d'un node en consultant plusieurs sources.
 *
 * ─── Pourquoi cette fonction ───────────────────────────────────────────
 *
 * Le champ `meta.kind` est posé par l'adapter de stockage au moment du list().
 * Mais sa fiabilité varie selon le backend :
 *   - Cloudinary : pose 'image' ou 'video' selon resource_type. Or les audios
 *     Cloudinary sont stockés en resource_type='video' (convention Cloudinary),
 *     ce qui donne un kind 'video' incorrect pour de l'audio.
 *   - R2 : ne pose PAS du tout `meta.kind` (juste `mimeType` et `format`).
 *
 * Plutôt que de toucher à 2 adapters pour aligner leur output, on dérive
 * ici depuis `meta.mimeType` (plus fiable, posé partout) avec fallback
 * sur `meta.kind` legacy.
 */
function deriveEffectiveKind(node: FinderNode): 'image' | 'video' | 'audio' | 'document' {
  const mime = node.meta?.mimeType ?? '';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';

  // Fallback sur meta.kind si pas de mimeType
  const k = node.meta?.kind;
  if (k === 'image' || k === 'video') return k;

  // Tout le reste (PDF, docx, txt, md, zip, etc.) → document
  return 'document';
}

/**
 * Calcule la clé et le libellé du groupe auquel appartient un node, selon
 * le critère de tri primaire.
 *
 * ─── Conventions par champ ─────────────────────────────────────────────
 *
 *   - `name`  : 1ère lettre du nom, capitalisée et désaccentuée (é/è/ê → E).
 *               Les noms qui ne commencent pas par une lettre A-Z (chiffres,
 *               caractères spéciaux, emojis) sont regroupés sous "#".
 *   - `type`  : un groupe par kind reconnu (Dossiers, Images, Vidéos,
 *               Documents). Pour les fichiers d'un kind inconnu, on tombe
 *               sur leur `format` en majuscules (PDF, MP3, etc.). Dernier
 *               fallback "Autres".
 *   - `size`  : buckets fixes (< 1 MB / 1–10 MB / 10–100 MB / > 100 MB).
 *               Folders considérés comme size = 0 → groupe "< 1 MB".
 *   - `date` / `sender` : pas encore exploitables → label vide pour
 *               signaler "ne pas afficher de header".
 */
export function getGroupInfo(node: FinderNode, field: SortField): GroupInfo {
  switch (field) {
    case 'name': {
      const firstChar = node.name.trim().charAt(0).toUpperCase();
      // Normalisation NFD pour décomposer les accents puis on les supprime.
      // Ainsi "Émile" → "E" → groupe "E" (et pas "É" tout seul).
      const normalized = firstChar.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const key = /[A-Z]/.test(normalized) ? normalized : '#';
      return { key, label: key };
    }

    case 'type': {
      if (node.type === 'folder') {
        // Folders : "Dossiers" en macro-catégorie, pas de sous-groupe par format.
        // Le parentLabel/parentKey identique au key signale "pas de subdivision".
        return {
          key: 'folder',
          label: TYPE_LABELS.folder,
          parentKey: 'folder',
          parentLabel: TYPE_LABELS.folder,
        };
      }

      // Files : kind effectif (parent) + format (enfant).
      const kind = deriveEffectiveKind(node);
      const parentLabel = TYPE_LABELS[kind] ?? 'Autres';

      const format = node.meta?.format;
      if (format) {
        const upperFormat = format.toUpperCase();
        return {
          key: `${kind}:${upperFormat}`,
          label: upperFormat,
          parentKey: kind,
          parentLabel,
        };
      }

      // Fichier sans extension reconnue : un seul niveau "Autres" sous le kind.
      return {
        key: `${kind}:unknown`,
        label: 'Sans extension',
        parentKey: kind,
        parentLabel,
      };
    }

    case 'size': {
      const size = node.size ?? 0;
      // Folders (size === 0) tombent dans le bucket "< 1 MB" — discutable
      // mais cohérent : ils n'ont pas de poids propre.
      if (size < 1024 * 1024) return { key: 'small', label: '< 1 MB' };
      if (size < 10 * 1024 * 1024) return { key: 'medium', label: '1 – 10 MB' };
      if (size < 100 * 1024 * 1024) return { key: 'large', label: '10 – 100 MB' };
      return { key: 'huge', label: '> 100 MB' };
    }

    case 'date': {
      // Folders : pas de date pertinente → groupe "Dossiers" en tête (cohérent
      // avec compareDates qui les place en premier).
      if (node.type === 'folder') {
        return { key: 'folder', label: 'Dossiers' };
      }
      const iso = node.meta?.createdAt;
      if (!iso) return { key: 'date-unknown', label: 'Date inconnue' };

      // Buckets temporels relatifs à aujourd'hui — pattern macOS Finder.
      // On compare en ms depuis epoch (rapide, pas de parsing complexe).
      const d = new Date(iso).getTime();
      if (isNaN(d)) return { key: 'date-unknown', label: 'Date inconnue' };

      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const startOfYesterday = startOfToday - 86_400_000;
      // "Cette semaine" : lundi 00h00 (semaine FR). Calculé à partir d'aujourd'hui.
      const dayOfWeek = (now.getDay() + 6) % 7; // 0=lundi, 6=dimanche
      const startOfThisWeek = startOfToday - dayOfWeek * 86_400_000;
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      const startOfThisYear = new Date(now.getFullYear(), 0, 1).getTime();

      if (d >= startOfToday) return { key: 'date-today', label: "Aujourd'hui" };
      if (d >= startOfYesterday) return { key: 'date-yesterday', label: 'Hier' };
      if (d >= startOfThisWeek) return { key: 'date-this-week', label: 'Cette semaine' };
      if (d >= startOfThisMonth) return { key: 'date-this-month', label: 'Ce mois-ci' };
      if (d >= startOfThisYear) return { key: 'date-this-year', label: 'Cette année' };

      // Avant l'année courante → par année (genre "2025", "2024").
      const year = new Date(iso).getFullYear();
      return { key: `date-y${year}`, label: String(year) };
    }

    case 'sender': {
      if (node.type === 'folder') {
        return { key: 'folder', label: 'Dossiers' };
      }
      const sender = node.meta?.uploadedBy;
      if (!sender) return { key: 'sender-unknown', label: 'Expéditeur inconnu' };
      return { key: `sender-${sender}`, label: sender };
    }

    default: {
      const _exhaustive: never = field;
      void _exhaustive;
      return { key: 'all', label: '' };
    }
  }
}

/**
 * Regroupe une liste **déjà triée** de nodes en groupes consécutifs selon
 * le critère donné. Repose sur l'invariant que `sortNodes` regroupe déjà
 * les items de même clé — donc une passe linéaire suffit pour les détecter.
 *
 * Retourne toujours au moins un groupe quand la liste n'est pas vide.
 * Si le field ne produit pas de labels (date/sender), tous les nodes vont
 * dans un unique groupe avec label vide (le caller ne rend pas de header).
 */
export function groupNodes(
  sortedNodes: FinderNode[],
  field: SortField,
): NodeGroup[] {
  const groups: NodeGroup[] = [];
  let current: NodeGroup | null = null;

  for (const node of sortedNodes) {
    const info = getGroupInfo(node, field);
    if (!current || current.key !== info.key) {
      current = {
        key: info.key,
        label: info.label,
        parentKey: info.parentKey,
        parentLabel: info.parentLabel,
        nodes: [],
      };
      groups.push(current);
    }
    current.nodes.push(node);
  }

  return groups;
}
