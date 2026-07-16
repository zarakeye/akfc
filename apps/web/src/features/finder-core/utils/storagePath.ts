import type { FinderNode } from '@contracts/finder';

/**
 * storagePathOf — où vit le binaire de ce nœud.
 *
 * ─── Deux chemins, deux métiers ───────────────────────────────────────────
 *
 * Depuis le chantier « arbre sans strate de statut », un nœud du finder porte
 * deux chemins qui ne coïncident plus :
 *
 *   node.path              AKFC/cours/tchoy-lee-fut/photo    ← ce que l'admin voit
 *   node.meta.storagePath  AKFC/pending/cours/…/photo        ← où est le binaire
 *
 * Règle : ce qui parle à l'UTILISATEUR (fil d'Ariane, arbre, navigation,
 * règles de drop) utilise `path`. Ce qui parle au PROVIDER ou à la DB (URL de
 * preview, métadonnées, source d'un move, mise en corbeille, jointure avec
 * `MediaAsset.fullPath`) passe par ici.
 *
 * ─── Pourquoi pas `node.id` ───────────────────────────────────────────────
 *
 * Parce que `id` n'est pas un localisateur. Le contrat dit « peut être path
 * ou uuid selon adapter », et c'est déjà le cas dans ce projet :
 *
 *   - remonté par le finder    → id = le chemin du fichier
 *   - remonté par la recherche → id = le cuid `MediaAsset.id`
 *   - dossier de recherche     → id = `folder:<path>`
 *
 * Les trois sont des identités d'unicité parfaitement valables ; aucune n'est
 * un chemin. Et comme les résultats de recherche sont sélectionnables et
 * atterrissent dans le même pool de nœuds que la grille, une action routée
 * sur `id` partirait avec un cuid une fois sur deux.
 *
 * ─── Le repli ─────────────────────────────────────────────────────────────
 *
 * `?? node.path` n'est pas de la prudence décorative : tant que le flag
 * `logical` n'est pas levé, le backend ne renseigne pas `storagePath` et le
 * repli EST le comportement — les deux chemins sont alors le même. C'est ce
 * qui rend la bascule réversible d'un booléen.
 *
 * ─── Durée de vie ─────────────────────────────────────────────────────────
 *
 * Transitoire. À l'étape 5 du chantier, `storagePath === path` pour tout le
 * monde ; ce helper devient l'identité et se supprime.
 */
export function storagePathOf(node: Pick<FinderNode, 'path' | 'meta'>): string {
  return node.meta?.storagePath ?? node.path;
}
