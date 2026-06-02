/**
 * Virtual paths et dispatch de provider.
 *
 * Ce fichier introduit deux concepts qui rendent le finder vraiment
 * indépendant du provider de stockage : le **virtual path** (le path
 * tel que vu par la UI) et le **dispatcher** (la fonction qui décide
 * quel provider héberge quel asset).
 *
 * ─── Pourquoi un nouveau type `VirtualPath` distinct de `StoragePath` ? ───
 *
 * Aujourd'hui le contrat utilise `StoragePath = string` partout. Quand on
 * n'a qu'un seul provider, c'est suffisant : le path Cloudinary publié par
 * l'API tRPC est exactement le path utilisé en interne par l'adapter.
 *
 * Avec deux providers, on a une distinction sémantique importante :
 *
 *   ┌─────────────────────────────────────────────────────────────────┐
 *   │  VirtualPath  — vue UI, neutre, agnostique du provider          │
 *   │  ex: "AKFC/pending/Cours/12/intro.mp3"                          │
 *   └────────────────────────────┬────────────────────────────────────┘
 *                                │
 *               pickBackend(mimeType / extension)
 *                                │
 *                ┌───────────────┴───────────────┐
 *                ▼                               ▼
 *   ┌────────────────────────┐    ┌───────────────────────────────┐
 *   │ StoragePath Cloudinary │    │ StoragePath R2 (key bucket)   │
 *   │ "AKFC/pending/Cours/   │    │ "AKFC/pending/Cours/12/       │
 *   │  12/intro" (sans ext)  │    │  intro.mp3" (avec ext)        │
 *   └────────────────────────┘    └───────────────────────────────┘
 *
 * Le mapping virtual ↔ storage est responsabilité de chaque adapter. Pour
 * Cloudinary, ça peut être l'identité (ou presque — extension retirée
 * pour le publicId). Pour R2, ça peut aussi être l'identité (la clé R2
 * peut accepter la même structure). Mais le contrat ne tranche pas : on
 * laisse les adapters libres.
 *
 * Le bénéfice de cette distinction n'est pas tellement dans le runtime
 * (souvent l'identité) mais dans le **type system** : on encode dans les
 * signatures qu'un path manipulé côté UI n'est PAS interchangeable avec
 * un path stocké côté backend. Une erreur de conversion oubliée sera
 * détectée à la compilation.
 *
 * ─── Branded type ────────────────────────────────────────────────────────
 *
 * `VirtualPath` est un branded type : c'est essentiellement un `string`
 * mais avec un tag de phantom type qui empêche l'usage d'un `string`
 * quelconque sans passer par `toVirtualPath()`. C'est une discipline
 * pure-TypeScript, zéro overhead runtime.
 */

import type { StorageProvider } from './storage.types';

/* -------------------------------------------------------------------------- */
/*  Branded type VirtualPath                                                  */
/* -------------------------------------------------------------------------- */

declare const virtualPathBrand: unique symbol;

/**
 * Path tel que vu par l'UI du finder. Agnostique du provider.
 *
 * Format conventionnel : `${APP_ROOT}/<segments...>` avec `/` comme séparateur.
 * Pas de segment `.`, `..`, ou commençant par `.` (sauf cas internes comme
 * `.trash` — qui n'est jamais exposé à la UI précisément pour cette raison).
 *
 * Construit via `toVirtualPath()` après validation. Le cast direct
 * `as VirtualPath` est volontairement laissé possible pour les cas internes
 * documentés (mappers backend qui produisent un path déjà validé en amont).
 */
export type VirtualPath = string & { readonly [virtualPathBrand]: 'VirtualPath' };

/**
 * Construit un `VirtualPath` après validation des règles de bon formatage.
 *
 * Levée d'erreur si le path :
 *   - est vide
 *   - contient un segment vide (`//`)
 *   - contient `..` (tentative de traversal)
 *   - se termine par `/`
 *
 * Ce sont les invariants minimaux. La sémantique applicative (path doit
 * commencer par `APP_ROOT`, par exemple) est laissée aux consommateurs
 * qui peuvent ajouter leurs propres `assertXxx()` au-dessus.
 */
export function toVirtualPath(raw: string): VirtualPath {
  if (typeof raw !== 'string' || raw.length === 0) {
    throw new Error('toVirtualPath: path vide');
  }
  if (raw.endsWith('/')) {
    throw new Error(`toVirtualPath: path ne doit pas se terminer par "/" (reçu: "${raw}")`);
  }
  const segments = raw.split('/');
  for (const seg of segments) {
    if (seg.length === 0) {
      throw new Error(`toVirtualPath: segment vide dans "${raw}" (probable "//" consécutifs)`);
    }
    if (seg === '..') {
      throw new Error(`toVirtualPath: segment ".." interdit (path traversal) dans "${raw}"`);
    }
  }
  return raw as VirtualPath;
}

/**
 * Variante qui ne lève pas mais renvoie `null` en cas d'invalidité.
 * Pratique pour les filtres / parsers tolérants.
 */
export function tryToVirtualPath(raw: string): VirtualPath | null {
  try {
    return toVirtualPath(raw);
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/*  Dispatcher : quel backend pour quel asset ?                               */
/* -------------------------------------------------------------------------- */

/**
 * Décide quel provider de stockage héberge un asset selon son MIME type.
 *
 * Règle AKFC (synchronisée avec la documentation côté tutos) :
 *   - `cloudinary` : image/*, video/*
 *     → ces médias bénéficient des transformations à la volée et
 *       d'un CDN media-spécialisé
 *   - `r2`         : tout le reste (audio, doc, archive, etc.)
 *     → servis tels quels, zero egress fee
 *
 * Cette fonction est l'UNIQUE point où se décide le routage. Si la
 * stratégie change, c'est ici qu'on touche, nulle part ailleurs.
 *
 * Si on a un cas où le MIME est inconnu (`application/octet-stream` ou
 * vide), on bascule sur R2 par défaut — c'est le choix le plus sûr
 * économiquement (R2 a le zero-egress) et techniquement (un fichier
 * inconnu n'a pas de transformation Cloudinary à offrir de toute façon).
 */
export function pickBackend(mimeType: string | null | undefined): StorageProvider {
  if (!mimeType) return 'r2';
  if (mimeType.startsWith('image/')) return 'cloudinary';
  if (mimeType.startsWith('video/')) return 'cloudinary';
  return 'r2';
}

/**
 * Variante par extension de fichier (pour les cas où on n'a pas accès
 * au MIME type — par exemple en parsant un nom de fichier statique).
 *
 * La liste est intentionnellement courte : on couvre les formats
 * courants. Les cas exotiques tombent sur R2 par défaut (comportement
 * cohérent avec `pickBackend`).
 */
export function pickBackendByExtension(filename: string): StorageProvider {
  const dot = filename.lastIndexOf('.');
  if (dot === -1 || dot === filename.length - 1) return 'r2';
  const ext = filename.slice(dot + 1).toLowerCase();

  // Images
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg', 'bmp', 'tiff', 'ico'].includes(ext)) {
    return 'cloudinary';
  }
  // Vidéos
  if (['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v', 'wmv', 'flv', 'ogv'].includes(ext)) {
    return 'cloudinary';
  }
  // Tout le reste → R2 (audios, docs, archives, etc.)
  return 'r2';
}
