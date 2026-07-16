import { APP_ROOT } from '@config/app';
import type { FinderNode } from '@contracts/finder';

import { storagePathOf } from '@features/finder-core/utils/storagePath';

/**
 * 🛡️ Status folders : les 3 dossiers racines intouchables.
 *
 *   - `${APP_ROOT}/pending`    — contenu en attente de publication
 *   - `${APP_ROOT}/published`  — contenu publié, visible côté front public
 *   - `${APP_ROOT}/bin`        — corbeille (poubelle des items trashed)
 *
 * Règles métier (appliquées dans les composants UI qui s'en servent) :
 *   1. Pas drag-source     — on ne déplace pas un status folder.
 *   2. Pas supprimables    — points d'ancrage permanents.
 *   3. Pas renommables     — nom sémantique côté code (path hard-codé).
 *   4. Pas sélectionnables — seuls leurs DESCENDANTS le sont (on agit sur
 *      le contenu, pas sur la classification).
 *
 * Les guards backend existent déjà ; ce helper anticipe côté UI.
 */

export const STATUS_FOLDER_NAMES = ['pending', 'published', 'bin'] as const;

/**
 * Statut applicatif de cycle de vie. Aligné sur le segment[1] des paths
 * (`${APP_ROOT}/<status>/...`) et sur `lifecycleStatusSchema` côté contracts.
 */
export type LifecycleStatus = (typeof STATUS_FOLDER_NAMES)[number];

/** Liste figée des paths qui sont des status folders. */
export const STATUS_FOLDER_PATHS: readonly string[] = STATUS_FOLDER_NAMES.map(
  (name) => `${APP_ROOT}/${name}`,
);

/**
 * Vrai si `path` désigne exactement un status folder de l'app.
 * Match strict — les descendants (`${APP_ROOT}/pending/cours`) renvoient false.
 */
export function isStatusFolder(path: string): boolean {
  return STATUS_FOLDER_PATHS.includes(path);
}

/**
 * Déduit le statut applicatif d'un node à partir de son path.
 *
 * Convention (cf. `resolveMoveIntent.service.ts`) : le statut est le SECOND
 * segment du path, juste après l'`APP_ROOT`.
 *   `AKFC/pending/cours/12/photo.jpg` → 'pending'
 *   `AKFC/published`                  → 'published'
 *
 * Renvoie `null` si le path n'est pas sous l'`APP_ROOT` ou si le segment de
 * statut n'est pas un statut connu (asset hors-pipeline) — le caller décide
 * quoi faire d'un `null` (typiquement : aucun radio coché).
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  ⚠️  N'APPELEZ PAS CETTE FONCTION SUR UN `node.path`.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Le chantier « arbre sans strate de statut » a INVERSÉ la dépendance que
 * cette fonction incarne.
 *
 * Avant : le chemin était la vérité, `MediaAsset.status` un cache dérivé.
 *         Conséquence — publier obligeait à DÉPLACER le binaire chez le
 *         provider, avec tout ce qui s'ensuivait : deux mécanismes de synchro
 *         au move, un publicId qui se désynchronise, un chemin construit à
 *         deux endroits devant s'accorder au caractère près.
 *
 * Après :  `MediaAsset.status` est la vérité. Publier est un `UPDATE`. Le
 *          binaire ne bouge plus. Et `node.path` est un chemin LOGIQUE — il
 *          ne porte plus de segment de statut, donc cette fonction y renvoie
 *          `null`.
 *
 * Ce `null` est SILENCIEUX. Il ne lève pas, il ne warn pas : il éteint. Un
 * badge qui n'apparaît plus, un picker où plus rien ne s'épingle. C'est
 * exactement ce qui a failli passer inaperçu en livrant cette étape.
 *
 * Pour connaître le statut d'un nœud, utilisez **`statusOf(node)`**, plus bas.
 *
 * Ce qui reste légitime ici : les chemins PHYSIQUES (`storagePathOf(node)`,
 * `MediaAsset.fullPath`), tant que la migration des binaires n'est pas faite.
 * Après elle, cette fonction n'aura plus aucun appelant et se supprimera avec
 * le reste du pliage.
 */
export function statusFromPath(path: string): LifecycleStatus | null {
  const parts = path.split('/').filter(Boolean);
  if (parts[0] !== APP_ROOT) return null;
  const segment = parts[1];
  return (STATUS_FOLDER_NAMES as readonly string[]).includes(segment)
    ? (segment as LifecycleStatus)
    : null;
}

/**
 * Un node est « pickable » (sélectionnable pour épinglage dans une galerie)
 * s'il est un FICHIER et qu'il vit sous le dossier-statut `published`.
 *
 * Les dossiers ne sont jamais pickables (on épingle des médias, pas des
 * dossiers). Les fichiers pending/bin restent VISIBLES et navigables dans le
 * picker — et même multi-sélectionnables pour un changement de statut — mais
 * ne peuvent pas être retenus pour le pick tant qu'ils ne sont pas publiés.
 *
 * Centralisé ici pour que la règle vive au même endroit que le mapping
 * statut ↔ dossier : si la règle de pick évolue (autoriser un autre statut,
 * ajouter une condition), c'est l'unique point à toucher.
 */
export function isPickable(
  node: Pick<FinderNode, 'type' | 'path' | 'meta'>,
): boolean {
  return node.type === 'file' && statusOf(node) === 'published';
}

/**
 * Le statut d'un nœud. **Le seul point d'entrée.**
 *
 * ─── L'ordre de préséance, et pourquoi il est dans cet ordre ──────────────
 *
 *   1. `meta.status` — `MediaAsset.status`, servi par `media.getByPaths` via
 *      `useMediaAssetEnrichment`. C'est la VÉRITÉ.
 *
 *   2. `statusFromPath(storagePathOf(node))` — repli sur le chemin PHYSIQUE,
 *      pour les fichiers sans row DB (antérieurs au tracking). Noter le
 *      `storagePathOf` : c'est le chemin où vit le binaire, donc le seul qui
 *      porte encore un segment de statut. Appliqué à `node.path`, ce repli
 *      renverrait `null` dès la vue pliée levée — et s'éteindrait en silence.
 *
 * Le repli disparaîtra avec la strate elle-même (étape 5 du chantier) : à ce
 * moment-là, plus aucun chemin ne portera de statut, et `meta.status` sera la
 * seule réponse possible. Ce qui est déjà le cas dans les faits.
 *
 * ─── Pourquoi une fonction plutôt que l'expression recopiée ───────────────
 *
 * `n.meta?.status ?? statusFromPath(n.path)` était écrit à l'identique dans
 * `GridItem`, `FinderTableRow` et `StatusRadioGroup`, et sous une troisième
 * forme dans `isPickable`. Quatre copies d'une règle métier, qu'il fallait
 * penser à corriger quatre fois — et dont une seule oubliée aurait éteint le
 * picker sans un mot. C'est la même maladie que `MoveItem` / `DragItem`, et
 * que le type de `getAttentionCounts` recopié à la main dans la cloche.
 */
export function statusOf(
  node: Pick<FinderNode, 'path' | 'meta'>,
): LifecycleStatus | null {
  return node.meta?.status ?? statusFromPath(storagePathOf(node));
}

/* -------------------------------------------------------------------------- */
/*                          DÉTECTION MÉDIA VISUEL                            */
/* -------------------------------------------------------------------------- */

/**
 * Extensions reconnues comme média visuel (image / vidéo). Alignée sur
 * `pickBackendByExtension` (@contracts/storage) — même taxonomie que le
 * dispatch de provider. Utilisée seulement en dernier recours par
 * `isMediaNode` (les public_id Cloudinary étant extensionless).
 */
const IMAGE_VIDEO_EXTS = new Set([
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg', 'bmp', 'tiff', 'ico',
  'mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v', 'wmv', 'flv', 'ogv',
]);

/**
 * Vrai si le node est un MÉDIA visuel (image ou vidéo) — la famille qui vit
 * sur Cloudinary et qu'on épingle dans les galeries.
 *
 * Détection en cascade, du plus fiable au plus faible :
 *   1. `meta.kind` — info sémantique de l'enrichissement. Union fermée
 *      ('image' | 'video' | 'document') : 'document' couvre aussi l'audio
 *      (kind ne distingue pas l'audio, cf. GridItem). Donc tout kind connu
 *      ≠ image/video ⇒ non-média. Indépendant de l'extension, donc correct
 *      pour les public_id Cloudinary qui sont extensionless.
 *   2. `mimeType` — repli si kind absent (node pas encore enrichi).
 *   3. extension du name — dernier recours (utile côté R2 où le name porte
 *      l'extension ; inopérant sur Cloudinary, d'où l'ordre).
 *
 * Pensé pour n'être appelé que sur des fichiers (le caller garde les
 * dossiers à part), mais reste correct sur un dossier (kind/mime/ext absents
 * ⇒ false).
 */
export function isMediaNode(node: FinderNode): boolean {
  const kind = node.meta?.kind;
  if (kind != null) return kind === 'image' || kind === 'video';

  const mime = node.mimeType ?? node.meta?.mimeType;
  if (mime) return mime.startsWith('image/') || mime.startsWith('video/');

  const name = node.name.toLowerCase();
  const dot = name.lastIndexOf('.');
  if (dot <= 0) return false; // extensionless sans kind ni mime : indécidable ⇒ non
  return IMAGE_VIDEO_EXTS.has(name.slice(dot + 1));
}