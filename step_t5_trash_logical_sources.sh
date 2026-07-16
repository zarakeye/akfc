#!/usr/bin/env bash
#
# ═══════════════════════════════════════════════════════════════════════════
#  AKFC — T5 : la corbeille apprend les chemins logiques
# ═══════════════════════════════════════════════════════════════════════════
#
#  Le pliage ne touche pas le CONTENU de la corbeille (`bin` reste un lieu,
#  les chemins sous `bin/.trash/` traversent intacts). Mais il touche
#  l'ENTRÉE en corbeille : `trash.trashToBin` reçoit du finder les chemins
#  des items à jeter, et après la bascule ces chemins seront logiques pour
#  les DOSSIERS.
#
#  Un dossier logique recouvre 1..N dossiers physiques : jeter `AKFC/cours/x`
#  doit jeter la copie en attente ET la copie publiée. Le schema accepte déjà
#  un TABLEAU de sources — la projection consiste donc juste à en émettre une
#  par emplacement réel. Pas de regroupement, pas de cible à projeter : c'est
#  nettement plus simple que le cas du move.
#
#  CE QUE FAIT CE SCRIPT
#  ---------------------
#   1. `storage/resolvePhysicalLocations.service.ts` (NEUF) — l'oracle
#      d'existence, EXTRAIT de toPhysicalMoveIntents pour être partagé.
#   2. `toPhysicalMoveIntents.service.ts` l'importe au lieu de le porter.
#      Aucun changement de comportement : c'est le même code, déplacé.
#   3. `trash.trashToBin` accepte `logical?: boolean` et projette ses sources.
#
#  Non levé par personne : aucun appelant ne passe le flag. Comportement
#  strictement préservé.
#
#  AUCUNE migration Prisma. `git revert` suffit.
#
#  PRÉREQUIS : T3.
#
#  USAGE
#  -----
#     bash step_t5_trash_logical_sources.sh
#     AKFC_APPLY_ONLY=1 bash step_t5_trash_logical_sources.sh   # usage Claude
#
set -euo pipefail

echo "▶ AKFC — T5 : projection des sources de corbeille (non levée)"

if [ ! -f "pnpm-workspace.yaml" ] || [ ! -d "packages/backend" ]; then
  echo "✗ À lancer depuis la RACINE du monorepo AKFC."
  exit 1
fi

ORACLE="packages/backend/src/modules/storage/resolvePhysicalLocations.service.ts"
MOVE="packages/backend/src/modules/storage/toPhysicalMoveIntents.service.ts"
TRASH="packages/backend/src/modules/trash/router.ts"

[ -f "$MOVE" ] || { echo "✗ T3 n'est pas appliqué ($MOVE absent)."; exit 1; }
[ -f "$TRASH" ] || { echo "✗ Fichier introuvable : $TRASH"; exit 1; }

if [ -f "$ORACLE" ]; then
  echo "✓ Déjà appliqué ($ORACLE présent)."
  exit 0
fi

# ─── 1. L'oracle, extrait ─────────────────────────────────────────────────
cat > "$ORACLE" <<'TSEOF'
import type { PrismaClient } from "@prisma/client";

import {
  physicalCandidates,
  stratumSegmentOf,
} from "@backend/modules/storage/logicalPath";

/**
 * resolvePhysicalLocations — où vit réellement ce chemin ?
 *
 * ─── Pourquoi ce module existe ────────────────────────────────────────────
 *
 * Le pliage de la strate de statut fait qu'un chemin LOGIQUE de dossier
 * correspond à 1..N emplacements physiques (`AKFC/cours/x` peut vivre sous
 * `pending`, sous `published`, ou sous les deux). Toute opération d'écriture
 * qui reçoit un chemin du finder doit donc savoir lesquels sont occupés.
 *
 * Deux appelants le demandent, pour des raisons différentes :
 *   - `toPhysicalMoveIntents` — pour émettre une intention par strate ;
 *   - la projection des sources de `trash.trashToBin` — pour jeter les deux
 *     copies d'un dossier logique.
 *
 * D'où l'extraction : la question « où vit ce chemin » est une, la réponse
 * doit l'être aussi.
 *
 * ─── On demande, on ne devine pas ─────────────────────────────────────────
 *
 * La tentation serait de fanner sur les deux strates et de tolérer l'échec
 * de celle qui n'existe pas. Mauvaise idée : cette tolérance finit toujours
 * par avaler autre chose que ce pour quoi elle a été écrite — une panne
 * réelle, ou pire, une garde métier.
 *
 * L'oracle existe déjà, et il est fiable :
 *   - `Folder`     : le registre des dossiers logiques. `upsertFolders` y
 *                    inscrit tout dossier rencontré — c'est précisément ce
 *                    qui fait exister les dossiers VIDES. Un dossier vide
 *                    doit continuer de se déplacer et de se jeter.
 *   - `MediaAsset` : les fichiers. Filet pour un chemin de fichier logique
 *                    (cache client périmé, lien mis en favori).
 *
 * ─── Durée de vie ─────────────────────────────────────────────────────────
 *
 * Transitoire, comme le reste du pliage. À l'étape 5 du chantier, chaque
 * chemin n'a plus qu'un emplacement — celui qu'il désigne. Ce module se
 * supprime avec `logicalPath.ts`.
 */

export type ResolvePhysicalLocationsParams = {
  prisma: PrismaClient;
  appRoot: string;
  /** Chemins tels que reçus de l'UI — logiques ou physiques, indifféremment. */
  paths: readonly string[];
};

/**
 * Pour chaque chemin donné, la liste de ses emplacements physiques réels.
 *
 * Deux régimes :
 *
 *   - Le chemin porte DÉJÀ une strate (`AKFC/pending/…`, `AKFC/bin/…`) :
 *     l'appelant nous dit où vit l'item, on le croit. C'est le cas dominant
 *     après la bascule — `FinderNode.id` porte le `storagePath` d'un
 *     fichier. Aucune requête. Si le chemin est faux, le provider échouera
 *     de lui-même, bruyamment, ce qui est le bon comportement.
 *
 *   - Le chemin est logique (typiquement un DOSSIER, dont l'identité UI est
 *     son chemin logique faute d'emplacement unique) : on interroge.
 *
 * Les requêtes sont groupées sur l'ensemble des candidats de tous les
 * chemins logiques : **deux allers-retours DB au total**, quel que soit le
 * nombre d'items sélectionnés.
 *
 * @throws si un chemin ne correspond à AUCUN emplacement connu. Une écriture
 *   demandée sur un item que ni `Folder` ni `MediaAsset` ne connaissent
 *   signale une incohérence entre ce que le finder affiche et ce que la DB
 *   sait — mieux vaut échouer fort que ne rien faire en silence.
 */
export async function resolvePhysicalLocations(
  params: ResolvePhysicalLocationsParams,
): Promise<Map<string, string[]>> {
  const { prisma, appRoot, paths } = params;

  const resolved = new Map<string, string[]>();
  const candidatesByPath = new Map<string, string[]>();

  for (const path of paths) {
    if (stratumSegmentOf(path, appRoot) !== null) {
      resolved.set(path, [path]);
      continue;
    }
    candidatesByPath.set(path, physicalCandidates(path, appRoot));
  }

  if (candidatesByPath.size === 0) return resolved;

  const allCandidates = [...new Set([...candidatesByPath.values()].flat())];

  const [folders, assets] = await Promise.all([
    prisma.folder.findMany({
      where: { appRoot, fullPath: { in: allCandidates } },
      select: { fullPath: true },
    }),
    prisma.mediaAsset.findMany({
      where: { appRoot, fullPath: { in: allCandidates } },
      select: { fullPath: true },
    }),
  ]);

  const existing = new Set<string>([
    ...folders.map((row) => row.fullPath),
    ...assets.map((row) => row.fullPath),
  ]);

  for (const [path, candidates] of candidatesByPath) {
    const found = candidates.filter((candidate) => existing.has(candidate));
    if (found.length === 0) {
      throw new Error(
        `[resolvePhysicalLocations] Aucun emplacement connu pour "${path}". ` +
          `Ni le registre Folder ni MediaAsset ne connaissent aucun de : ` +
          `${candidates.join(", ")}. Le finder affiche un item que la DB ignore.`,
      );
    }
    resolved.set(path, found);
  }

  return resolved;
}
TSEOF
echo "  ✓ $ORACLE (neuf)"

# ─── 2/3. Édits ───────────────────────────────────────────────────────────
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

MOVE = "packages/backend/src/modules/storage/toPhysicalMoveIntents.service.ts"
TRASH = "packages/backend/src/modules/trash/router.ts"

# ── toPhysicalMoveIntents : consommer l'oracle extrait ────────────────────
old = '''import {
  FOLDABLE_STATUS_SEGMENTS,
  physicalCandidates,
  stratumSegmentOf,
  toLogicalPath,
  toPhysicalPath,
  type FoldableStatus,
  type StratumSegment,
} from "@backend/modules/storage/logicalPath";'''

new = '''import {
  FOLDABLE_STATUS_SEGMENTS,
  stratumSegmentOf,
  toLogicalPath,
  toPhysicalPath,
  type FoldableStatus,
  type StratumSegment,
} from "@backend/modules/storage/logicalPath";
import { resolvePhysicalLocations } from "@backend/modules/storage/resolvePhysicalLocations.service";'''
sub_once(MOVE, old, new, "toPhysicalMoveIntents — importe l'oracle")

old = '''  const sourcePaths = sourcePathsOf(intent.source);
  const locations = await resolvePhysicalLocations(prisma, appRoot, sourcePaths);'''
new = '''  const sourcePaths = sourcePathsOf(intent.source);
  const locations = await resolvePhysicalLocations({
    prisma,
    appRoot,
    paths: sourcePaths,
  });'''
sub_once(MOVE, old, new, "toPhysicalMoveIntents — appel de l'oracle")

# Retirer la copie locale de l'oracle (du bandeau de section jusqu'au bandeau suivant).
with io.open(MOVE, encoding="utf-8") as f:
    s = f.read()
start = s.index("/* -------------------------------------------------------------------------- */\n/*  Résolution des emplacements réels                                         */")
end = s.index("/* -------------------------------------------------------------------------- */\n/*  Projection                                                                */")
assert start < end, "[toPhysicalMoveIntents] bandeaux de section introuvables ou inversés"
assert s.count("async function resolvePhysicalLocations(") == 1, "[toPhysicalMoveIntents] la copie locale de l'oracle n'est plus unique"
with io.open(MOVE, "w", encoding="utf-8") as f:
    f.write(s[:start] + s[end:])
print("  ✓ toPhysicalMoveIntents — copie locale de l'oracle retirée")

# ── trash.trashToBin : flag + projection ─────────────────────────────────
old = '''const trashToBinInputSchema = z.object({
  appRoot: z.string().min(1),
  sources: z
    .array(
      z.union([
        z.object({ kind: z.literal("folder"), fullPath: z.string().min(1) }),
        z.object({ kind: z.literal("file"), fullPath: z.string().min(1) }),
        z.object({ kind: z.literal("selection"), roots: z.array(z.string().min(1)).min(1) }),
      ])
    )
    .min(1),
});'''

new = '''const trashToBinInputSchema = z.object({
  appRoot: z.string().min(1),
  sources: z
    .array(
      z.union([
        z.object({ kind: z.literal("folder"), fullPath: z.string().min(1) }),
        z.object({ kind: z.literal("file"), fullPath: z.string().min(1) }),
        z.object({ kind: z.literal("selection"), roots: z.array(z.string().min(1)).min(1) }),
      ])
    )
    .min(1),
  /**
   * Les `fullPath` / `roots` ci-dessus sont exprimés en chemins LOGIQUES
   * (cf. le flag `logical` du router storage).
   *
   * Un appelant qui lit le finder en vue pliée DOIT lever ce flag ici : les
   * chemins de DOSSIER qu'il détient n'ont pas d'emplacement physique unique
   * (un dossier logique vit dans 1..N strates). Les chemins de FICHIER, eux,
   * sont déjà physiques — `FinderNode.id` porte le `storagePath` — et la
   * projection les laisse passer sans requête.
   *
   * Baissé (le défaut), rien ne change.
   */
  logical: z.boolean().optional(),
});

type TrashToBinSource = z.infer<typeof trashToBinInputSchema>["sources"][number];

/**
 * Redescend les sources de mise en corbeille dans l'espace physique.
 *
 * Jeter le dossier logique `AKFC/cours/x`, c'est jeter la copie en attente
 * ET la copie publiée : deux vrais dossiers, donc deux `TrashEntry`, donc
 * deux restaurations possibles vers leurs `previousPath` respectifs. Le
 * schema accepte déjà un TABLEAU de sources — il n'y a donc rien à
 * regrouper et aucune cible à projeter. C'est nettement plus simple que le
 * cas du move.
 *
 * La corbeille elle-même n'est pas concernée par le pliage : `bin` reste un
 * lieu (quarantaine physique + `TrashEntry.previousPath`), et les chemins
 * qui sont déjà dedans traversent intacts. Ce qui est projeté ici, c'est
 * l'ENTRÉE en corbeille, pas son contenu.
 *
 * Transitoire : à l'étape 5 du chantier, la projection devient l'identité et
 * cette fonction se supprime avec le reste du pliage.
 */
async function toPhysicalTrashSources(params: {
  prisma: PrismaContext;
  appRoot: string;
  sources: readonly TrashToBinSource[];
}): Promise<TrashToBinSource[]> {
  const { prisma, appRoot, sources } = params;

  const paths = sources.flatMap((source) =>
    source.kind === "selection" ? source.roots : [source.fullPath],
  );
  const locations = await resolvePhysicalLocations({ prisma, appRoot, paths });
  const physical = (path: string): string[] => locations.get(path) ?? [path];

  return sources.flatMap((source): TrashToBinSource[] => {
    if (source.kind === "selection") {
      return [
        { kind: "selection", roots: source.roots.flatMap(physical) },
      ];
    }
    return physical(source.fullPath).map((fullPath) => ({
      kind: source.kind,
      fullPath,
    }));
  });
}'''
sub_once(TRASH, old, new, "trashToBin — schema + projection")

old = '''  trashToBin: adminProcedure
    .input(trashToBinInputSchema)
    .mutation(async ({ ctx, input }): Promise<TrashToBinOutput> => {
      return trashToBin({ prisma: ctx.prisma, input });
    }),'''

new = '''  trashToBin: adminProcedure
    .input(trashToBinInputSchema)
    .mutation(async ({ ctx, input }): Promise<TrashToBinOutput> => {
      const sources = input.logical
        ? await toPhysicalTrashSources({
            prisma: ctx.prisma,
            appRoot: input.appRoot,
            sources: input.sources,
          })
        : input.sources;

      return trashToBin({ prisma: ctx.prisma, input: { ...input, sources } });
    }),'''
sub_once(TRASH, old, new, "trashToBin — procédure")
PYEOF

# L'import de l'oracle + l'alias de type prisma dans le router trash.
python3 - <<'PYEOF'
import io
TRASH = "packages/backend/src/modules/trash/router.ts"
with io.open(TRASH, encoding="utf-8") as f:
    s = f.read()

anchor = 'import { trashToBin } from "@backend/modules/trash/services/trashToBin.service";'
assert s.count(anchor) == 1, "[trash/router] ancre d'import introuvable"
s = s.replace(
    anchor,
    anchor
    + '\nimport { resolvePhysicalLocations } from "@backend/modules/storage/resolvePhysicalLocations.service";',
    1,
)

# `toPhysicalTrashSources` a besoin du type du client Prisma. On le dérive du
# service voisin plutôt que de le réinventer : `trashToBin` prend déjà
# `{ prisma }`, donc son type de paramètre est la source de vérité locale.
marker = "type TrashToBinSource = z.infer<typeof trashToBinInputSchema>[\"sources\"][number];"
assert s.count(marker) == 1, "[trash/router] marqueur de type introuvable"
s = s.replace(
    marker,
    marker
    + "\n\n/**\n"
    + " * Le type du client Prisma, dérivé du service voisin plutôt que réimporté\n"
    + " * de `@prisma/client` : `trashToBin` prend déjà un `prisma`, son type de\n"
    + " * paramètre est donc la source de vérité locale. Rien à réinventer, rien à\n"
    + " * laisser diverger.\n"
    + " */\ntype PrismaContext = Parameters<typeof trashToBin>[0][\"prisma\"];",
    1,
)
with io.open(TRASH, "w", encoding="utf-8") as f:
    f.write(s)
print("  ✓ trash/router — import de l'oracle + type Prisma dérivé")
PYEOF

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
git commit -m "feat(trash): projette les sources de mise en corbeille derrière \`logical\`

Le pliage ne touche pas le CONTENU de la corbeille — bin reste un lieu, les
chemins sous bin/.trash traversent intacts — mais il touche l'ENTRÉE en
corbeille : trashToBin reçoit du finder les chemins des items à jeter, et
après la bascule ceux des DOSSIERS seront logiques.

Jeter le dossier logique AKFC/cours/x, c'est jeter la copie en attente ET la
copie publiée : deux vrais dossiers, deux TrashEntry, deux restaurations
possibles. Le schema acceptant déjà un tableau de sources, la projection se
borne à en émettre une par emplacement réel — ni regroupement, ni cible, donc
beaucoup plus simple que le cas du move.

- resolvePhysicalLocations est EXTRAIT de toPhysicalMoveIntents : la question
  « où vit ce chemin » a maintenant deux appelants (move et trash), la
  réponse doit être une. Code déplacé, comportement identique.
- trashToBin accepte logical?: boolean. Baissé (le défaut), rien ne change.

Aucun appelant ne lève le flag."

echo "✅ T5 appliqué, typechecké et commité."