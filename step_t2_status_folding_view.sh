#!/usr/bin/env bash
#
# ═══════════════════════════════════════════════════════════════════════════
#  AKFC — T2 : la vue logique qui plie la strate de statut (NON MONTÉE)
# ═══════════════════════════════════════════════════════════════════════════
#
#  Chantier « arbre sans strate de statut », étape 1 : le nœud logique
#  `AKFC/cours/x` doit fusionner les physiques `AKFC/pending/cours/x` et
#  `AKFC/published/cours/x`.
#
#  CE QUE FAIT CE SCRIPT
#  ---------------------
#   1. `StorageFileNode.storagePath?` — champ ADDITIF au contrat.
#   2. `storage/logicalPath.ts` (NEUF) — le mapping pur logique ↔ physique.
#   3. `storage/statusFoldingReadView.ts` (NEUF) — le décorateur de LECTURE.
#
#  Le décorateur n'est branché NULLE PART. Aucun comportement runtime ne
#  change : le router continue d'utiliser `VirtualStorage` directement.
#  Le montage derrière un flag est l'incrément suivant.
#
#  AUCUNE migration Prisma. `git revert` suffit.
#
#  PRÉREQUIS : T0 (frontière de profondeur dans mergeFolderTrees). Le pliage
#  fait converger pending/<x> et published/<x> sur un même path logique, donc
#  « présent des deux côtés » y devient le cas normal — sans T0, tout dossier
#  à la frontière de profondeur ressortirait vide et indépliable.
#
#  USAGE
#  -----
#     bash step_t2_status_folding_view.sh
#     AKFC_APPLY_ONLY=1 bash step_t2_status_folding_view.sh   # usage Claude
#
set -euo pipefail

echo "▶ AKFC — T2 : vue logique de pliage du statut (non montée)"

if [ ! -f "pnpm-workspace.yaml" ] || [ ! -d "packages/backend" ]; then
  echo "✗ À lancer depuis la RACINE du monorepo AKFC."
  exit 1
fi

TYPES="packages/contracts/src/storage/storage.types.ts"
LOGICAL="packages/backend/src/modules/storage/logicalPath.ts"
VIEW="packages/backend/src/modules/storage/statusFoldingReadView.ts"

[ -f "$TYPES" ] || { echo "✗ Fichier introuvable : $TYPES"; exit 1; }

# ─── Garde : T0 appliqué ? ────────────────────────────────────────────────
if ! grep -q "Frontière de profondeur : ne JAMAIS matérialiser" \
     "packages/backend/src/modules/storage/virtualStorage.ts"; then
  echo "✗ T0 n'est pas appliqué (mergeFolderTrees écrase encore la frontière"
  echo "  de profondeur). Lance step_t0_merge_frontier.sh d'abord."
  exit 1
fi

# ─── Garde anti-double-application ────────────────────────────────────────
if [ -f "$LOGICAL" ] || [ -f "$VIEW" ]; then
  echo "✓ Déjà appliqué (logicalPath.ts / statusFoldingReadView.ts présent)."
  exit 0
fi

# ─── 1. Contrat : storagePath sur StorageFileNode ─────────────────────────
python3 - <<'PYEOF'
import io

def sub_once(path, old, new, label):
    with io.open(path, encoding="utf-8") as f:
        s = f.read()
    n = s.count(old)
    assert n == 1, f"[{label}] ancre trouvée {n} fois dans {path} (attendu 1)"
    with io.open(path, "w", encoding="utf-8") as f:
        f.write(s.replace(old, new, 1))
    print(f"  ✓ {label}")

TYPES = "packages/contracts/src/storage/storage.types.ts"

old = '''export interface StorageFileNode {
  type: 'file';
  name: string;
  path: StoragePath;
  metadata?: StorageMetadata;
}'''

new = '''export interface StorageFileNode {
  type: 'file';
  name: string;
  path: StoragePath;
  metadata?: StorageMetadata;

  /**
   * Emplacement RÉEL du binaire chez le provider, quand il diffère de `path`.
   *
   * ─── Pourquoi ce champ existe ────────────────────────────────────────────
   *
   * `path` est le chemin LOGIQUE : celui par lequel la UI navigue, construit
   * son fil d'Ariane et rattache un fichier à son dossier. Le contrat le dit
   * depuis toujours (« le path est logique, il peut différer du chemin
   * physique selon l'adapter ») — mais tant qu'il n'y avait qu'une seule
   * convention de chemin, les deux étaient confondus partout.
   *
   * Le chantier « arbre sans strate de statut » les sépare pour de bon : le
   * segment `pending`/`published` disparaît du chemin logique alors que le
   * binaire, lui, vit encore dessous chez le provider.
   *
   *   path         : AKFC/cours/tchoy-lee-fut/photo
   *   storagePath  : AKFC/pending/cours/tchoy-lee-fut/photo
   *
   * Les consommateurs qui parlent au PROVIDER (URL de preview, lecture de
   * métadonnées, source d'un move, jointure avec `MediaAsset.fullPath`)
   * doivent utiliser `storagePath`. Ceux qui parlent à l'UTILISATEUR
   * (navigation, fil d'Ariane, arbre) utilisent `path`.
   *
   * ─── Le champ règle aussi les collisions ─────────────────────────────────
   *
   * Une photo publiée et une photo homonyme fraîchement uploadée vivent
   * aujourd'hui dans deux dossiers distincts ; une fois la strate pliée,
   * elles partagent le MÊME `path` logique. `storagePath` reste, lui,
   * unique — c'est donc lui qui sert d'identité (`FinderNode.id`) côté UI.
   * Sans ça, dédupliquer par path cacherait un des deux fichiers.
   *
   * ─── Durée de vie ────────────────────────────────────────────────────────
   *
   * Ce champ est TRANSITOIRE. À l'étape 5 du chantier (migration des
   * binaires en chemins plats), `storagePath === path` pour tout le monde
   * et le champ peut être supprimé sans rien casser. Il ne doit donc pas
   * devenir un point d'appui pour autre chose que cette transition.
   */
  storagePath?: StoragePath;
}'''
sub_once(TYPES, old, new, "StorageFileNode.storagePath (additif)")
PYEOF

# ─── 2. logicalPath.ts ────────────────────────────────────────────────────
cat > "$LOGICAL" <<'TSEOF'
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
TSEOF
echo "  ✓ $LOGICAL (neuf)"

# ─── 3. statusFoldingReadView.ts ──────────────────────────────────────────
cat > "$VIEW" <<'TSEOF'
import type {
  StorageAdapter,
  ListOptions,
  ListResult,
  GetTreeOptions,
  GetTreeResult,
  StorageNode,
  StorageFolderNode,
  StorageFileNode,
  StorageMetadata,
  StoragePath,
} from '@contracts/storage';

import {
  isFoldedStratumPath,
  physicalCandidates,
  physicalResolutionOrder,
  toLogicalPath,
} from '@backend/modules/storage/logicalPath';

/**
 * StatusFoldingReadView — la strate de statut cesse d'être un lieu.
 *
 * ─── Ce que c'est ─────────────────────────────────────────────────────────
 *
 * Un décorateur `StorageAdapter` qui enveloppe un autre `StorageAdapter`
 * (en pratique `VirtualStorage`) et présente une vue où le nœud logique
 * `AKFC/cours/x` FUSIONNE les nœuds physiques `AKFC/pending/cours/x` et
 * `AKFC/published/cours/x`.
 *
 *   AKFC                          AKFC
 *   ├── pending                   ├── cours
 *   │   └── cours                 │   └── tchoy-lee-fut
 *   │       └── tchoy-lee-fut     │       ├── photo-1   (pending)
 *   │           └── photo-1       │       └── photo-2   (published)
 *   ├── published                 ├── general
 *   │   └── cours                 └── bin
 *   │       └── tchoy-lee-fut
 *   │           └── photo-2
 *   ├── general
 *   └── bin
 *
 * Le statut ne disparaît pas de l'écran : il redevient ce qu'il aurait
 * toujours dû être, une MÉTADONNÉE portée par `MediaAsset.status` (déjà
 * exposée en `MediaMeta.status` depuis l'étape S1). Le badge « En attente »
 * et la colonne Statut continuent de la lire ; le filtre segmenté à venir
 * filtrera dessus. Simplement, le statut n'est plus un DOSSIER.
 *
 * ─── LECTURE UNIQUEMENT — et ce n'est pas un oubli ────────────────────────
 *
 * `move()` et `delete()` ne sont VOLONTAIREMENT pas implémentés. Le contrat
 * `StorageAdapter` les déclare optionnels, donc cette vue reste conforme.
 *
 * La raison est structurelle, pas un manque de temps. `planMoveOperations`
 * lit la source via l'adapter qu'on lui passe, puis calcule la cible avec
 * `resolveTargetPath`. Or `resolveTargetPath`, pour une cible
 * `status-folder`, exige que `segment[1]` du chemin source soit un statut
 * connu — et LÈVE une erreur explicite sinon. Lui donner des chemins
 * logiques (où ce segment n'existe plus, par construction) casserait
 * `useStatusChange`, c'est-à-dire précisément la publication.
 *
 * ⚠️ NE PAS passer cette vue à `planMoveOperations` / `resolveMoveIntent`.
 * La traduction des intentions de move logique → physique est un incrément
 * à part, avec sa propre logique (une réorganisation doit hériter de la
 * strate de sa source, sinon déplacer une photo la publierait par accident).
 *
 * ─── Coût ─────────────────────────────────────────────────────────────────
 *
 * Chaque lecture interroge jusqu'à trois emplacements. Sur Cloudinary c'est
 * quasi gratuit : `resourcesCache` a un hit hiérarchique, et le premier
 * candidat (le chemin logique lui-même, donc l'ancêtre des deux autres à la
 * racine) est lu SÉQUENTIELLEMENT pour réchauffer le cache avant les deux
 * suivants. Cf. `physicalCandidates` pour le raisonnement complet.
 *
 * ─── Durée de vie ─────────────────────────────────────────────────────────
 *
 * Transitoire, comme `logicalPath.ts`. À l'étape 5 du chantier, tous les
 * binaires sont à plat, le pliage devient l'identité, et ce fichier se
 * supprime.
 */
export class StatusFoldingReadView implements StorageAdapter {
  constructor(
    private readonly inner: StorageAdapter,
    private readonly appRoot: string,
  ) {}

  /* ====================================================================== */
  /*  Lecture                                                               */
  /* ====================================================================== */

  async list(options: ListOptions): Promise<ListResult> {
    const results = await this.readCandidates(
      (path) => this.inner.list({ ...options, path }),
      options.path,
      'list',
    );

    // Les dossiers fusionnent par path logique ; les fichiers, JAMAIS.
    // Cf. `mergeFoldedFolders` pour le raisonnement sur les collisions.
    const folders = new Map<string, StorageFolderNode>();
    const files: StorageFileNode[] = [];

    for (const result of results) {
      for (const folder of result.folders) {
        if (isFoldedStratumPath(folder.path, this.appRoot)) continue;
        const folded = this.foldFolder(folder);
        const existing = folders.get(folded.path);
        folders.set(
          folded.path,
          existing ? mergeFoldedFolders(existing, folded) : folded,
        );
      }
      for (const file of result.files) {
        files.push(this.foldFile(file));
      }
    }

    return {
      folders: [...folders.values()],
      files,
      // Les candidats sont consommés intégralement avant retour, comme dans
      // les adapters sous-jacents. Pas de pagination composée à ce stade.
      nextCursor: null,
    };
  }

  async getTree(options: GetTreeOptions): Promise<GetTreeResult> {
    const results = await this.readCandidates(
      (path) => this.inner.getTree({ ...options, path }),
      options.path,
      'getTree',
    );

    const folded = results.map((result) => this.foldFolder(result.root));

    // Tous les candidats repliés partagent désormais le même path logique
    // (celui demandé) : la réduction les empile deux à deux.
    return {
      root: folded.reduce((accumulator, tree) =>
        mergeFoldedFolders(accumulator, tree),
      ),
    };
  }

  async getNode(path: StoragePath): Promise<StorageNode | null> {
    const innerGetNode = this.inner.getNode?.bind(this.inner);
    if (!innerGetNode) return null;

    const answers: StorageNode[] = [];
    for (const candidate of physicalResolutionOrder(path, this.appRoot)) {
      const outcome = await this.settle(
        () => innerGetNode(candidate),
        `getNode(${candidate})`,
      );
      if (outcome.ok && outcome.value) answers.push(outcome.value);
    }

    // ⚠️ On PRÉFÈRE une réponse `file` concrète à une réponse `folder`, pour
    // la même raison que `VirtualStorage.getNode` : un provider répond
    // volontiers « folder » sur un simple préfixe. Ici le risque est même
    // plus grand — le premier candidat est le chemin à plat, qui n'existe
    // pas encore avant l'étape 5 mais dont Cloudinary peut rapporter le
    // préfixe de façon optimiste, masquant le vrai fichier sous sa strate.
    const file = answers.find((node) => node.type === 'file');
    const resolved = file ?? answers[0];
    return resolved ? this.foldNode(resolved) : null;
  }

  async getMetadata(path: StoragePath): Promise<StorageMetadata | null> {
    const innerGetMetadata = this.inner.getMetadata?.bind(this.inner);
    if (!innerGetMetadata) return null;

    // `physicalResolutionOrder` essaie le chemin TEL QUEL en premier : un
    // appelant qui détient déjà le `storagePath` (le cas normal) paie un
    // seul aller-retour. Les autres candidats sont un filet, pas la règle.
    for (const candidate of physicalResolutionOrder(path, this.appRoot)) {
      const outcome = await this.settle(
        () => innerGetMetadata(candidate),
        `getMetadata(${candidate})`,
      );
      if (outcome.ok && outcome.value) return outcome.value;
    }
    return null;
  }

  /* ====================================================================== */
  /*  Interrogation des candidats                                           */
  /* ====================================================================== */

  /**
   * Lit les emplacements physiques d'un chemin logique et retourne les
   * réponses obtenues.
   *
   * Le premier candidat est lu SÉQUENTIELLEMENT, les suivants en parallèle :
   * à la racine le premier est l'ancêtre des autres, donc il réchauffe le
   * cache hiérarchique de `resourcesCache` et les deux suivants sont servis
   * en mémoire.
   *
   * Un candidat en échec est ignoré (un emplacement peut légitimement ne pas
   * exister — c'est même le cas normal pendant toute la transition). On ne
   * propage l'erreur que si AUCUN candidat n'a répondu : même discipline de
   * tolérance aux pannes que `VirtualStorage`.
   */
  private async readCandidates<T>(
    read: (path: string) => Promise<T>,
    requestedPath: string,
    label: string,
  ): Promise<T[]> {
    const [first, ...rest] = physicalCandidates(requestedPath, this.appRoot);

    const firstOutcome = await this.settle(
      () => read(first),
      `${label}(${first})`,
    );
    const restOutcomes = await Promise.all(
      rest.map((path) => this.settle(() => read(path), `${label}(${path})`)),
    );

    const outcomes = [firstOutcome, ...restOutcomes];
    const values = outcomes
      .filter((outcome): outcome is { ok: true; value: T } => outcome.ok)
      .map((outcome) => outcome.value);

    if (values.length === 0) {
      const firstFailure = outcomes.find((outcome) => !outcome.ok);
      throw firstFailure && !firstFailure.ok
        ? firstFailure.reason
        : new Error(`[StatusFoldingReadView] ${label}: aucun candidat lisible.`);
    }

    return values;
  }

  private async settle<T>(
    run: () => Promise<T>,
    context: string,
  ): Promise<{ ok: true; value: T } | { ok: false; reason: unknown }> {
    try {
      return { ok: true, value: await run() };
    } catch (reason) {
      console.warn(
        `[StatusFoldingReadView] ${context} a échoué — candidat ignoré.`,
        reason,
      );
      return { ok: false, reason };
    }
  }

  /* ====================================================================== */
  /*  Pliage des nodes                                                      */
  /* ====================================================================== */

  private foldNode(node: StorageNode): StorageNode {
    return node.type === 'file' ? this.foldFile(node) : this.foldFolder(node);
  }

  /**
   * Un fichier garde son emplacement réel dans `storagePath` et prend son
   * chemin logique dans `path`.
   *
   * `storagePath` est renseigné SYSTÉMATIQUEMENT, même quand il est déjà
   * égal à `path` (asset à plat, ou fichier de corbeille). L'invariant
   * « tout fichier sorti de cette vue porte son storagePath » évite aux
   * consommateurs un `?? path` défensif, et rend la suppression du champ
   * à l'étape 5 mécanique.
   */
  private foldFile(file: StorageFileNode): StorageFileNode {
    return {
      ...file,
      path: toLogicalPath(file.path, this.appRoot),
      storagePath: file.path,
    };
  }

  /**
   * Un dossier prend son chemin logique — et PAS de `storagePath`.
   *
   * C'est délibéré : un dossier logique correspond à plusieurs dossiers
   * physiques (un par strate), il n'a donc pas d'emplacement réel unique à
   * désigner. Poser un `storagePath` arbitraire serait un mensonge sur
   * lequel du code finirait par s'appuyer.
   *
   * Deux dossiers logiques ne peuvent pas entrer en collision (ils
   * fusionnent), donc leur `path` suffit comme identité côté UI.
   */
  private foldFolder(folder: StorageFolderNode): StorageFolderNode {
    const path = toLogicalPath(folder.path, this.appRoot);
    const name = path.split('/').filter(Boolean).pop() ?? folder.name;

    // Les strates elles-mêmes (`AKFC/pending`, `AKFC/published`) sont des
    // lieux qui n'existent plus dans l'espace logique : on les masque quand
    // elles apparaissent comme enfants directs de la racine. Leur contenu
    // remonte par ailleurs, via les autres candidats. `bin` n'est pas
    // concerné — c'est un vrai dossier, il reste.
    const children = folder.children
      ?.filter(
        (child) =>
          !(
            child.type === 'folder' &&
            isFoldedStratumPath(child.path, this.appRoot)
          ),
      )
      .map((child) => this.foldNode(child));

    return {
      type: 'folder',
      name,
      path,
      children,
      hasChildren: folder.hasChildren,
    };
  }
}

/* -------------------------------------------------------------------------- */
/*  Fusion des arbres repliés                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Fusionne deux arbres qui partagent le même path logique.
 *
 * Cousin de `mergeFolderTrees` (virtualStorage.ts), qui fusionne DEUX
 * PROVIDERS. Celui-ci fusionne DEUX STRATES du même provider. Deux règles
 * les distinguent, et elles comptent :
 *
 * ─── 1. Les fichiers ne sont JAMAIS dédupliqués ───────────────────────────
 *
 * Entre providers, un fichier n'appartient qu'à un seul backend : une
 * concaténation suffit. Entre strates, `pending/cours/x/photo` et
 * `published/cours/x/photo` sont DEUX fichiers distincts qui, une fois
 * repliés, portent le MÊME path logique — une photo publiée et sa
 * remplaçante homonyme en attente de relecture, cas parfaitement banal.
 * Dédupliquer par path en cacherait une. On les garde tous les deux ; c'est
 * leur `storagePath` qui les distingue, et c'est lui qui sert d'identité.
 *
 * ─── 2. La frontière de profondeur est préservée ──────────────────────────
 *
 * `children === undefined` (« non chargé ») ne doit jamais devenir `[]`
 * (« vide pour de vrai ») : la TreeView en conclurait que le dossier est
 * vide et refuserait de le déplier. Même discipline que `mergeFolderTrees`
 * — dont c'était précisément le bug corrigé juste avant ce chantier.
 */
function mergeFoldedFolders(
  a: StorageFolderNode,
  b: StorageFolderNode,
): StorageFolderNode {
  const hasChildrenHint = (a.hasChildren ?? false) || (b.hasChildren ?? false);

  const aLoaded = a.children !== undefined;
  const bLoaded = b.children !== undefined;

  if (!aLoaded && !bLoaded) {
    return {
      type: 'folder',
      name: a.name,
      path: a.path,
      hasChildren: hasChildrenHint,
    };
  }

  const folders = new Map<string, StorageFolderNode>();
  const files: StorageFileNode[] = [];

  for (const child of [...(a.children ?? []), ...(b.children ?? [])]) {
    if (child.type === 'file') {
      files.push(child);
      continue;
    }
    const existing = folders.get(child.path);
    folders.set(
      child.path,
      existing ? mergeFoldedFolders(existing, child) : child,
    );
  }

  const children = [...folders.values(), ...files];

  return {
    type: 'folder',
    name: a.name,
    path: a.path,
    children,
    hasChildren: hasChildrenHint || children.length > 0,
  };
}
TSEOF
echo "  ✓ $VIEW (neuf)"

echo "✓ Édits appliqués."

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "⏭  AKFC_APPLY_ONLY=1 → typecheck et commit sautés."
  exit 0
fi

echo "▶ pnpm --filter backend typecheck"
pnpm --filter backend typecheck

echo "▶ pnpm typecheck (web)"
pnpm typecheck

git add -A
git commit -m "feat(storage): vue logique qui plie la strate de statut (non montée)

Chantier « arbre sans strate de statut », étape 1 : le noeud logique
AKFC/cours/x doit fusionner les physiques AKFC/pending/cours/x et
AKFC/published/cours/x.

- logicalPath.ts : mapping pur logique <-> physique. Règle uniforme
  candidats(P) = { P, P+pending, P+published }, qui reste valable aux deux
  bouts du chantier (P vide aujourd'hui, P seul après la migration) et rend
  donc le pliage progressivement inutile plutôt que progressivement plus
  compliqué. Les chemins de corbeille traversent sans être pliés.

- statusFoldingReadView.ts : décorateur StorageAdapter de LECTURE seule
  (list / getTree / getNode / getMetadata). move() et delete() sont
  volontairement absents : resolveTargetPath exige un segment de statut sur
  le chemin source pour les cibles status-folder et lève une erreur sinon —
  passer des chemins logiques à planMoveOperations casserait la publication.
  La traduction des intentions de move est un incrément à part.

- StorageFileNode.storagePath? : emplacement réel du binaire quand il
  diffère du chemin logique. Sert d'identité côté UI, ce qui règle les
  collisions pending/published sur un même nom. Champ transitoire, supprimé
  à l'étape 5.

Rien n'est branché : le router utilise toujours VirtualStorage directement.
Aucun changement de comportement runtime."

echo "✅ T2 appliqué, typechecké et commité."