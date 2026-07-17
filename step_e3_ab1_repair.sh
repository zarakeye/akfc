#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 3 — B1 (RÉPARATEUR) : normalise `media.setStatus` dans sa forme finale
# et y branche la garde de dépublication.
#
# REMPLACE step_e3a2 ET step_e3b1. Il se moque de la version de `setStatus`
# actuellement en place (ancien A « paths », A′ « sources », ou aucune) :
# il réécrit le bloc en entier. Lançable après l'échec de B1 sans rien annuler.
#
# Personne n'appelle encore `setStatus` : aucun comportement ne change.
#
# À lancer depuis la RACINE du repo.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ROUTER="packages/backend/src/modules/media/router.ts"
GUARD="packages/backend/src/modules/media/services/assertStatusChangeDoesntUnpublishReferencedAssets.service.ts"

# ── Gardes de prérequis ─────────────────────────────────────────────────────
test -f "$ROUTER" || { echo "✗ $ROUTER introuvable — lance depuis la racine du repo."; exit 1; }
test -f packages/backend/src/modules/storage/logicalPath.ts \
  || { echo "✗ logicalPath.ts absent — le pliage n'est pas en place."; exit 1; }
grep -q "physicalCandidates" "$ROUTER" \
  || { echo "✗ physicalCandidates n'est pas importé dans $ROUTER — vérifier l'état du repo."; exit 1; }

# ── Garde anti-double-application ───────────────────────────────────────────
if grep -q "assertStatusChangeDoesntUnpublishReferencedAssets" "$ROUTER"; then
  echo "→ setStatus est déjà dans sa forme finale, garde comprise. Rien à faire."
  exit 0
fi

# ── Le service de garde (réécrit à l'identique si déjà là) ──────────────────
mkdir -p "$(dirname "$GUARD")"
cat > "$GUARD" <<'TSEOF'
import type { Prisma, PrismaClient } from '@prisma/client';

import { physicalCandidates } from '@backend/modules/storage/logicalPath';

/* ─────────────────────────────────────────────────────────────────────── */
/*  assertStatusChangeDoesntUnpublishReferencedAssets                      */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Garde de cohérence à la sortie de `published` — version STATUT.
 *
 * ─── Pourquoi une sœur et pas un appel à l'existante ─────────────────────
 *
 * `assertOperationsDontUnpublishReferencedAssets` fait le même travail, mais
 * sa DÉTECTION est un déplacement : elle repère la sortie de `published` en
 * testant `op.source.path.startsWith(appRoot + '/published/')`. Elle a besoin
 * d'une opération, d'une source, d'une cible.
 *
 * Or dépublier cesse d'être un déplacement. Il ne reste aucune op à lui
 * donner. La brancher de force reviendrait à lui fabriquer de fausses
 * opérations pour qu'elle reconnaisse quelque chose qui n'arrive plus — un
 * chemin recopié à côté de sa source, très exactement la maladie qu'on soigne.
 *
 * Donc on réexprime la détection. Et sa nouvelle forme est plus juste que
 * l'ancienne : « être publié » n'est plus *vivre sous un préfixe*, c'est
 * `status = 'published'` en base. C'est l'inversion que tout le chantier vise,
 * appliquée à la garde elle-même.
 *
 * Les étapes 3 à 5 de l'originale (collecte des références, diagnostic, throw)
 * sont identiques : elles ne parlaient déjà que d'`id`.
 *
 * ─── Les deux gardes coexistent, et c'est voulu ──────────────────────────
 *
 * Tant que le move sait encore franchir les strates (jusqu'à l'étape 5),
 * l'originale doit rester en place : un DnD peut toujours sortir un asset de
 * `published/` par le chemin. Elle se supprimera avec la strate, à l'étape 6.
 *
 * ⚠️ Portée connue, héritée de l'originale : seules les `pageMediaReference`
 * sont consultées. `MediaAsset.galleryItems` ne l'est pas. Ce trou existe
 * déjà aujourd'hui — on le reporte tel quel plutôt que d'élargir la garde en
 * douce dans un incrément qui n'en parle pas.
 */

export type StatusChangeSource = {
  kind: 'file' | 'folder';
  path: string;
};

export async function assertStatusChangeDoesntUnpublishReferencedAssets(
  db: PrismaClient | Prisma.TransactionClient,
  sources: readonly StatusChangeSource[],
  nextStatus: 'pending' | 'published',
  appRoot: string,
  logical?: boolean,
): Promise<void> {
  // On ne garde que la SORTIE de published. Y entrer n'a jamais cassé de page.
  if (nextStatus !== 'pending') return;

  // 1) Le même matching que `media.setStatus`, à la lettre — si les deux
  //    divergeaient, la garde protégerait un ensemble et l'UPDATE en
  //    toucherait un autre.
  const orClauses: Prisma.MediaAssetWhereInput[] = [];

  for (const source of sources) {
    if (source.kind === 'file') {
      orClauses.push({ fullPath: source.path });
      orClauses.push({ fullPath: { startsWith: `${source.path}.` } });
      continue;
    }

    const prefixes = logical
      ? physicalCandidates(source.path, appRoot)
      : [source.path];

    for (const prefix of prefixes) {
      orClauses.push({ fullPath: { startsWith: `${prefix}/` } });
    }
  }

  if (orClauses.length === 0) return;

  // 2) Les assets concernés QUI SONT PUBLIÉS. `status` est la vérité : c'est
  //    ici que la garde cesse de lire le chemin.
  const affectedAssets = await db.mediaAsset.findMany({
    where: { appRoot, status: 'published', OR: orClauses },
    select: { id: true, fullPath: true },
  });

  if (affectedAssets.length === 0) return;

  // 3) Les références entrantes.
  const assetIds = affectedAssets.map((a) => a.id);
  const refs = await db.pageMediaReference.findMany({
    where: { mediaAssetId: { in: assetIds } },
    select: { mediaAssetId: true, pageType: true, pageId: true },
  });

  if (refs.length === 0) return;

  // 4) Diagnostic. tRPC v11 propage le `.message` jusqu'au client, et
  //    `useStatusChange` l'expose via `error` : on nomme les pages.
  const refsByAssetId = new Map<
    string,
    Array<{ pageType: string; pageId: string }>
  >();
  for (const ref of refs) {
    const list = refsByAssetId.get(ref.mediaAssetId) ?? [];
    list.push({ pageType: String(ref.pageType), pageId: ref.pageId });
    refsByAssetId.set(ref.mediaAssetId, list);
  }

  const blockedAssets = affectedAssets.filter((a) => refsByAssetId.has(a.id));
  const lines = blockedAssets.map((asset) => {
    const items = refsByAssetId.get(asset.id) ?? [];
    const formatted = items.map((r) => `${r.pageType} #${r.pageId}`).join(', ');
    return `  - ${asset.fullPath} → utilisé par : ${formatted}`;
  });

  throw new Error(
    `Dépublication impossible : ${blockedAssets.length} média(s) encore référencé(s).\n` +
      `Retire-les des pages qui les affichent, puis réessaie.\n` +
      lines.join('\n'),
  );
}
TSEOF
echo "✓ $GUARD à jour"

python3 - <<'PYEOF'
import pathlib

p = pathlib.Path("packages/backend/src/modules/media/router.ts")
src = p.read_text(encoding="utf-8")

# ── 1) L'import ─────────────────────────────────────────────────────────────
IMPORT_LINE = "import { assertStatusChangeDoesntUnpublishReferencedAssets } from '@backend/modules/media/services/assertStatusChangeDoesntUnpublishReferencedAssets.service';"

OLD_IMPORT = """import {
  physicalCandidates,
  toLogicalPath,
} from '@backend/modules/storage/logicalPath';"""

assert src.count(OLD_IMPORT) == 1, f"ancre import trouvee {src.count(OLD_IMPORT)} fois, attendu 1"
if IMPORT_LINE not in src:
    src = src.replace(OLD_IMPORT, OLD_IMPORT + "\n" + IMPORT_LINE)

# ── 2) Le bloc setStatus, réécrit en entier ─────────────────────────────────
# Les deux versions posées jusqu'ici (« paths » et « sources ») partagent ce
# marqueur et sont TOUJOURS le dernier bloc du routeur. On coupe là et on
# reconstruit : aucune supposition sur ce qu'il y a entre les deux.
MARKER = "\n  /**\n   * 🔀 Changement de statut"

FINAL = '''
  /**
   * 🔀 Changement de statut — **publier n'est plus un déplacement**.
   *
   * ─── Ce que cette mutation remplace ──────────────────────────────────────
   *
   * Avant : publier appelait `storage.move` vers `{type:'status-folder'}`.
   * Le binaire traversait le provider, `reconcileMovedAsset` relisait l'asset
   * à son nouveau chemin pour en redériver `status`, et deux mécanismes de
   * synchro devaient tomber d'accord. Un `catch` silencieux de trop et le
   * `publicId` décrochait.
   *
   * Après : un UPDATE. Atomique, sans aller-retour provider, sans binaire qui
   * bouge. `MediaAsset.status` cesse d'être un cache dérivé du chemin pour
   * devenir la source de vérité — c'est l'inversion que tout le chantier vise.
   *
   * ─── Pourquoi `sources` et pas `paths` ───────────────────────────────────
   *
   * Parce qu'on publie aussi des DOSSIERS, et qu'un dossier n'a pas de
   * `MediaAsset`. Les deux cas ne se matchent pas de la même façon :
   *
   *   - `file`   → le chemin est un LOCALISATEUR. L'appelant front doit passer
   *                `storagePathOf(node)` — le chemin physique, celui qui matche
   *                `MediaAsset.fullPath`. Un chemin logique ne matcherait rien
   *                et cette mutation lèverait. (Tolérance d'extension : cf. la
   *                doc en tête de fichier.)
   *
   *   - `folder` → le chemin n'est PAS un localisateur : un dossier logique vit
   *                dans 1..N strates. C'est le backend qui résout, via
   *                `physicalCandidates` — la même règle que le pliage, pas une
   *                copie. On met à jour tout ce qui vit SOUS l'un des candidats.
   *
   * Forme alignée sur `trash.trashToBin` (`sources` + `logical`), qui tranche
   * déjà exactement le même problème. Une règle, un endroit.
   *
   * ─── Zéro ligne touchée : lever ou pas ? ─────────────────────────────────
   *
   * Pour un `file`, zéro ligne est une ANOMALIE : le statut n'a pas pris et
   * personne ne le saurait. On lève. C'est le mode d'échec qui avait éteint
   * le picker en silence.
   * Pour un `folder`, zéro ligne est LÉGITIME : un dossier vide n'a rien à
   * publier. On ne lève pas.
   *
   * ─── Pourquoi `bin` n'est pas dans l'enum ────────────────────────────────
   *
   * La corbeille garde son système propre (quarantaine physique + TrashEntry).
   * Y entrer n'est pas un changement de statut : c'est `trash.trashToBin`.
   */
  setStatus: protectedProcedure
    .input(
      z.object({
        appRoot: z.string().min(1),
        sources: z
          .array(
            z.object({
              kind: z.enum(["file", "folder"]),
              path: z.string().min(1),
            }),
          )
          .min(1),
        status: z.enum(["pending", "published"]),
        /** Les `folder.path` sont des chemins LOGIQUES à résoudre. */
        logical: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // AVANT le moindre UPDATE : on ne dépublie pas ce qu'une page affiche.
      // Le move avait sa garde (`assertOperationsDontUnpublish...`) ; ce
      // chemin-ci doit avoir la sienne, sinon publier par la nouvelle voie
      // contournerait en silence une règle que l'ancienne faisait respecter.
      await assertStatusChangeDoesntUnpublishReferencedAssets(
        ctx.prisma,
        input.sources,
        input.status,
        input.appRoot,
        input.logical,
      );

      const results = await Promise.all(
        input.sources.map(async (source) => {
          if (source.kind === "file") {
            const { count } = await ctx.prisma.mediaAsset.updateMany({
              where: {
                appRoot: input.appRoot,
                OR: [
                  { fullPath: source.path },
                  { fullPath: { startsWith: `${source.path}.` } },
                ],
              },
              data: { status: input.status },
            });
            return { source, count };
          }

          // Dossier : on ratisse chaque strate où il peut vivre. Le `/` final
          // n'est pas cosmétique — sans lui, publier `cours` publierait aussi
          // `cours-avance`. C'est la collision de préfixe déjà rencontrée dans
          // `trashToBin.folder.deleteMany`.
          const prefixes = input.logical
            ? physicalCandidates(source.path, input.appRoot)
            : [source.path];

          const { count } = await ctx.prisma.mediaAsset.updateMany({
            where: {
              appRoot: input.appRoot,
              OR: prefixes.map((prefix) => ({
                fullPath: { startsWith: `${prefix}/` },
              })),
            },
            data: { status: input.status },
          });
          return { source, count };
        }),
      );

      const silent = results.filter(
        (r) => r.source.kind === "file" && r.count === 0,
      );
      if (silent.length > 0) {
        throw new Error(
          `Aucune MediaAsset trouvée pour : ` +
            `${silent.map((r) => r.source.path).join(", ")}. ` +
            `Vérifier que l'appelant passe des chemins PHYSIQUES ` +
            `(storagePathOf), pas des chemins logiques. ` +
            `Si ce sont des fichiers R2 historiques, lancer le backfill ` +
            `via /api/admin/backfill-r2-assets.`,
        );
      }

      return {
        ok: true,
        updated: results.reduce((n, r) => n + r.count, 0),
      };
    }),
});
'''

count = src.count(MARKER)
assert count <= 1, f"marqueur setStatus trouve {count} fois, attendu 0 ou 1"

if count == 1:
    idx = src.find(MARKER)
    tail = src[idx:].rstrip()
    assert tail.endswith("});"), "setStatus n'est pas le dernier bloc du routeur — arret"
    src = src[:idx] + FINAL
    print("✓ setStatus réécrit dans sa forme finale (dossiers + garde)")
else:
    OLD_END = """      return { ok: true, updatedAt: new Date().toISOString() };
    }),
});"""
    assert src.count(OLD_END) == 1, f"ancre de fin trouvee {src.count(OLD_END)} fois, attendu 1"
    src = src.replace(OLD_END, OLD_END[: -len("\n});")] + "\n" + FINAL)
    print("✓ setStatus inséré dans sa forme finale (dossiers + garde)")

p.write_text(src, encoding="utf-8")
PYEOF

echo
echo "→ contrôle : la forme finale est en place ?"
grep -c "sources: z$" "$ROUTER" >/dev/null 2>&1 || true
grep -q "assertStatusChangeDoesntUnpublishReferencedAssets" "$ROUTER" && echo "  ✓ garde branchée"
grep -q "paths: z.array(z.string().min(1)).min(1)," "$ROUTER" && echo "  ✗ reste de l'ancien A détecté" && exit 1
echo "  ✓ aucun reste de l'ancien A"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "→ AKFC_APPLY_ONLY=1 : stop avant typecheck/commit."
  exit 0
fi

echo "→ typecheck…"
pnpm --filter backend typecheck && pnpm typecheck

git add -A && git commit -m "feat(media): setStatus forme finale (fichiers + dossiers) + garde de depublication (etape 3, A+B1)"
echo "✓ commité."