import { APP_ROOT } from '@config/app';
import type { FinderNode } from '@contracts/finder';

/**
 * Statut de cycle de vie d'un fichier : `MediaAsset.status` (`pending`, `published`), plus `bin`
 * pour ce qui est dans la corbeille. Le statut n'est PAS un lieu : aucun chemin ne le porte.
 */
export type LifecycleStatus = 'pending' | 'published' | 'bin';

/**
 * 🛡️ La corbeille, `${APP_ROOT}/bin` : seul dossier racine « de statut » qui subsiste (les
 * dossiers `pending/` et `published/` de l'époque Cloudinary ont disparu avec le statut dans le
 * chemin).
 *
 * Règles appliquées par les composants qui s'en servent :
 *   1. Pas drag-source     — on ne déplace pas la corbeille.
 *   2. Pas supprimable     — point d'ancrage permanent.
 *   3. Pas renommable      — son chemin est fixe ; seul son libellé s'édite.
 *   4. Pas sélectionnable  — on agit sur son contenu (vue dédiée), pas sur elle.
 *
 * Les gardes backend existent déjà (trashToBin refuse la corbeille) ; ce helper anticipe côté UI.
 */
export function isStatusFolder(path: string): boolean {
  return path === `${APP_ROOT}/bin`;
}

/**
 * Un nœud est-il retenable dans le picker (galerie, image d'une page) ? Un FICHIER publié.
 *
 * Les dossiers ne sont jamais pickables (on épingle des médias, pas des dossiers). Les fichiers
 * en attente restent visibles et navigables dans le picker — et multi-sélectionnables pour un
 * changement de statut — mais ne peuvent pas être retenus tant qu'ils ne sont pas validés.
 */
export function isPickable(
  node: Pick<FinderNode, 'type' | 'path' | 'meta'>,
): boolean {
  return node.type === 'file' && statusOf(node) === 'published';
}

/**
 * Le statut d'un nœud. **Le seul point d'entrée** : `meta.status`, c'est-à-dire
 * `MediaAsset.status`, servi par le listing ou par `useMediaAssetEnrichment`. Un fichier sans
 * ligne en base n'a pas de statut (null) : il n'est ni pickable, ni compté.
 */
export function statusOf(
  node: Pick<FinderNode, 'path' | 'meta'>,
): LifecycleStatus | null {
  return node.meta?.status ?? null;
}

/* -------------------------------------------------------------------------- */
/*                          DÉTECTION MÉDIA VISUEL                            */
/* -------------------------------------------------------------------------- */

/**
 * Extensions reconnues comme média visuel (image / vidéo). Utilisée
 * seulement en dernier recours par `isMediaNode`.
 */
const IMAGE_VIDEO_EXTS = new Set([
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg', 'bmp', 'tiff', 'ico',
  'mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v', 'wmv', 'flv', 'ogv',
]);

/**
 * Vrai si le node est un MÉDIA visuel (image ou vidéo) — la famille qu'on
 * épingle dans les galeries.
 *
 * Détection en cascade, du plus fiable au plus faible :
 *   1. `meta.kind` — info sémantique de l'enrichissement. Union fermée
 *      ('image' | 'video' | 'document') : 'document' couvre aussi l'audio
 *      (kind ne distingue pas l'audio, cf. GridItem). Donc tout kind connu
 *      ≠ image/video ⇒ non-média. Indépendant de l'extension.
 *   2. `mimeType` — repli si kind absent (node pas encore enrichi).
 *   3. extension du name — dernier recours.
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