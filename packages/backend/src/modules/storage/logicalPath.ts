/**
 * logicalPath.ts — traduction chemin LOGIQUE ↔ chemin PHYSIQUE.
 *
 * ─── Le problème qu'on démonte ────────────────────────────────────────────
 *
 * Historiquement, AKFC encode le statut de cycle de vie d'un asset DANS son
 * chemin : le segment juste après l'appRoot vaut `pending`, `published` ou
 * `bin`. Le chemin est donc la vérité et `MediaAsset.status` n'est qu'un
 * cache dérivé (`statusFromPath`). Conséquence directe : publier un asset
 * oblige à DÉPLACER son binaire chez le provider.
 *
 * Le chantier inverse la dépendance : `MediaAsset.status` devient la source
 * de vérité, publier devient un `UPDATE`, et le binaire ne bouge plus.
 *
 * ─── Ce que fait ce module ────────────────────────────────────────────────
 *
 * Il fournit le vocabulaire de la transition — rien de plus. Deux espaces
 * de chemins coexistent le temps du chantier :
 *
 *   LOGIQUE   ce que voit l'utilisateur      AKFC/cours/tchoy-lee-fut
 *   PHYSIQUE  où vit réellement le binaire   AKFC/pending/cours/tchoy-lee-fut
 *                                            AKFC/published/cours/tchoy-lee-fut
 *
 * ─── La règle de candidature, et pourquoi elle est uniforme ───────────────
 *
 *   candidats(P) = { P , P+pending , P+published }
 *
 * `P` lui-même figure dans la liste, et ce n'est pas un détail : c'est ce
 * qui rend le module compatible avec les DEUX bouts du chantier sans jamais
 * changer de règle.
 *
 *   - Aujourd'hui : `P` ne ramène rien (aucun asset n'est encore à plat),
 *     tout vient des deux candidats à strate.
 *   - Après l'étape 4 (uploads plats) : les nouveaux assets apparaissent via
 *     `P`, les anciens via les strates. Les deux mondes cohabitent, visibles
 *     dans le même dossier logique, sans code conditionnel.
 *   - Après l'étape 5 (migration des binaires) : les candidats à strate ne
 *     ramènent plus rien, `P` ramène tout. Le pliage devient l'identité et
 *     ce module — comme la vue qui l'utilise — peut être SUPPRIMÉ.
 *
 * Ce module est donc conçu pour mourir. Ne rien construire d'autre dessus.
 *
 * ─── La corbeille est hors-jeu ────────────────────────────────────────────
 *
 * `bin` reste un lieu, délibérément : la corbeille garde son système propre
 * (quarantaine physique sous `bin/.trash/<uuid>/` + `TrashEntry` en DB avec
 * `previousPath` pour la restauration). Aucun chemin sous `bin` n'est plié —
 * ce serait détruire l'information dont la restauration a besoin.
 */

/* -------------------------------------------------------------------------- */
/*  Vocabulaire                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Les strates de statut qui sont PLIÉES par ce module.
 *
 * `bin` en est volontairement absent (cf. en-tête) : il reste un lieu réel.
 */
export const FOLDABLE_STATUS_SEGMENTS = ['pending', 'published'] as const;

export type FoldableStatus = (typeof FOLDABLE_STATUS_SEGMENTS)[number];

/** Le segment de la corbeille — reconnu pour être EXCLU du pliage. */
export const BIN_SEGMENT = 'bin';

/** Un segment de strate reconnu par la convention de chemin actuelle. */
export type StratumSegment = FoldableStatus | typeof BIN_SEGMENT;

function segmentsOf(path: string): string[] {
  return path.split('/').filter(Boolean);
}

function isFoldable(segment: string | undefined): segment is FoldableStatus {
  return (FOLDABLE_STATUS_SEGMENTS as readonly string[]).includes(segment ?? '');
}

/* -------------------------------------------------------------------------- */
/*  Prédicats                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Vrai si `path` est sous l'appRoot (ou EST l'appRoot lui-même).
 *
 * Comparaison segment par segment, et pas `startsWith` : `AKFC-bis/x` ne
 * doit pas être considéré comme étant sous `AKFC`.
 */
export function isUnderAppRoot(path: string, appRoot: string): boolean {
  const rootParts = segmentsOf(appRoot);
  const parts = segmentsOf(path);
  if (parts.length < rootParts.length) return false;
  return rootParts.every((seg, i) => parts[i] === seg);
}

/**
 * Le segment de strate d'un chemin — celui qui suit immédiatement l'appRoot.
 *
 *   AKFC/pending/cours/x  → 'pending'
 *   AKFC/bin/.trash/…     → 'bin'
 *   AKFC/cours/x          → null   (déjà à plat, post-étape 4)
 *   AKFC                  → null   (la racine n'a pas de strate)
 *   autre-racine/x        → null   (hors périmètre)
 */
export function stratumSegmentOf(
  path: string,
  appRoot: string,
): StratumSegment | null {
  if (!isUnderAppRoot(path, appRoot)) return null;
  const segment = segmentsOf(path)[segmentsOf(appRoot).length];
  if (isFoldable(segment)) return segment;
  return segment === BIN_SEGMENT ? BIN_SEGMENT : null;
}

/**
 * Vrai si le chemin appartient au sous-arbre de la corbeille. Ces chemins
 * traversent le pliage sans être touchés.
 */
export function isBinPath(path: string, appRoot: string): boolean {
  return stratumSegmentOf(path, appRoot) === BIN_SEGMENT;
}

/**
 * Vrai si `path` désigne EXACTEMENT une strate pliable (`AKFC/pending` ou
 * `AKFC/published`) — pas un de leurs descendants.
 *
 * Sert à une seule chose : quand on liste le candidat `AKFC` lui-même, ses
 * enfants directs sont `pending`, `published` et `bin`. Les deux premiers
 * sont des lieux qui n'existent plus dans l'espace logique — il faut les
 * masquer (leur CONTENU, lui, remonte via les deux autres candidats).
 * `bin` est gardé : c'est un vrai dossier.
 */
export function isFoldedStratumPath(path: string, appRoot: string): boolean {
  if (!isUnderAppRoot(path, appRoot)) return false;
  const rootLength = segmentsOf(appRoot).length;
  const parts = segmentsOf(path);
  return parts.length === rootLength + 1 && isFoldable(parts[rootLength]);
}

/* -------------------------------------------------------------------------- */
/*  Traductions                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Chemin physique → chemin logique : on retire le segment de strate.
 *
 *   AKFC/pending/cours/x/photo  → AKFC/cours/x/photo
 *   AKFC/published              → AKFC
 *   AKFC/bin/.trash/u/photo     → inchangé (corbeille)
 *   AKFC/cours/x/photo          → inchangé (déjà à plat)
 *   autre-racine/x              → inchangé (hors périmètre)
 *
 * Idempotente : appliquer deux fois ne change rien. C'est ce qui rend le
 * module tolérant aux chemins d'origine indéterminée (cache client d'une
 * session précédente, lien mis en favori, path recopié à la main).
 */
export function toLogicalPath(physicalPath: string, appRoot: string): string {
  const stratum = stratumSegmentOf(physicalPath, appRoot);
  if (stratum === null || stratum === BIN_SEGMENT) return physicalPath;

  const parts = segmentsOf(physicalPath);
  parts.splice(segmentsOf(appRoot).length, 1);
  return parts.join('/');
}

/**
 * Chemin logique → chemin physique dans une strate donnée : on insère le
 * segment de statut juste après l'appRoot.
 *
 *   (AKFC/cours/x, 'published')  → AKFC/published/cours/x
 *   (AKFC, 'pending')            → AKFC/pending
 *
 * Les chemins de corbeille et hors-périmètre traversent sans être touchés —
 * il n'existe pas de version « en attente » d'un chemin de corbeille.
 */
export function toPhysicalPath(
  logicalPath: string,
  appRoot: string,
  status: FoldableStatus,
): string {
  // Normalisation défensive : si on nous passe déjà un chemin physique, on
  // le ramène d'abord en logique pour ne pas empiler deux strates.
  const logical = toLogicalPath(logicalPath, appRoot);

  if (!isUnderAppRoot(logical, appRoot)) return logical;
  if (isBinPath(logical, appRoot)) return logical;

  const parts = segmentsOf(logical);
  parts.splice(segmentsOf(appRoot).length, 0, status);
  return parts.join('/');
}

/**
 * Les emplacements physiques où chercher le contenu d'un chemin logique.
 *
 * ORDRE SIGNIFICATIF — le chemin logique lui-même vient toujours en premier.
 * À la racine (`AKFC`), il est aussi le préfixe ANCÊTRE des deux autres, et
 * `resourcesCache` a un hit HIÉRARCHIQUE : lire `AKFC` d'abord met en cache
 * tout le sous-arbre, et les deux candidats suivants sont alors servis par
 * un simple filtrage en mémoire. Un aller-retour Cloudinary au lieu de trois.
 * Le finder monte toujours sur la racine en premier, donc ce réchauffage
 * bénéficie ensuite à toute la navigation.
 *
 * Un chemin de corbeille ou hors-périmètre n'a qu'un seul candidat : lui-même.
 */
export function physicalCandidates(logicalPath: string, appRoot: string): string[] {
  const logical = toLogicalPath(logicalPath, appRoot);

  if (!isUnderAppRoot(logical, appRoot)) return [logical];
  if (isBinPath(logical, appRoot)) return [logical];

  return [
    logical,
    ...FOLDABLE_STATUS_SEGMENTS.map((status) =>
      toPhysicalPath(logical, appRoot, status),
    ),
  ];
}

/**
 * Les emplacements à essayer pour RÉSOUDRE un chemin dont on ignore l'espace
 * d'origine (logique ou physique).
 *
 * Différence avec `physicalCandidates` : on essaie le chemin TEL QUEL en
 * premier. Un appelant qui détient déjà un chemin physique (le cas normal —
 * `FinderNode.id` porte le `storagePath`) est donc servi au premier essai,
 * sans payer la résolution. Les autres candidats ne sont là que comme filet
 * pour un chemin logique ou périmé.
 */
export function physicalResolutionOrder(path: string, appRoot: string): string[] {
  const candidates = physicalCandidates(path, appRoot);
  return [path, ...candidates.filter((candidate) => candidate !== path)];
}
