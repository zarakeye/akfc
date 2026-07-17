#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 3 — incrément B1 (BACKEND SEUL) : la garde « ne dépublie pas ce qui
# est affiché », réécrite en STATUTS.
#
# Prérequis : step_e3a2_set_status_mutation.sh (media.setStatus doit exister).
#
# Personne n'appelle encore `setStatus` : cet incrément ne change aucun
# comportement. Il pose la garde AVANT le flip, pour qu'il n'existe jamais
# d'instant où publier passe par un chemin non gardé.
#
# À lancer depuis la RACINE du repo.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ROUTER="packages/backend/src/modules/media/router.ts"
GUARD="packages/backend/src/modules/media/services/assertStatusChangeDoesntUnpublishReferencedAssets.service.ts"

# ── Gardes de prérequis ─────────────────────────────────────────────────────
test -f "$ROUTER" || { echo "✗ $ROUTER introuvable — lance depuis la racine du repo."; exit 1; }
grep -q "setStatus: protectedProcedure" "$ROUTER" \
  || { echo "✗ media.setStatus absent — lance d'abord step_e3a2_set_status_mutation.sh."; exit 1; }
test -f packages/backend/src/modules/media/services/assertOperationsDontUnpublishReferencedAssets.service.ts \
  || { echo "✗ la garde d'origine est introuvable — vérifier l'état du repo."; exit 1; }

# ── Garde anti-double-application ───────────────────────────────────────────
if grep -q "assertStatusChangeDoesntUnpublishReferencedAssets" "$ROUTER"; then
  echo "→ garde déjà branchée, rien à faire."
  exit 0
fi

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
echo "✓ $GUARD créé"

python3 - <<'PYEOF'
import pathlib

p = pathlib.Path("packages/backend/src/modules/media/router.ts")
src = p.read_text(encoding="utf-8")

# ── 1) l'import ─────────────────────────────────────────────────────────────
OLD_IMPORT = """import {
  physicalCandidates,
  toLogicalPath,
} from '@backend/modules/storage/logicalPath';"""

NEW_IMPORT = OLD_IMPORT + """
import { assertStatusChangeDoesntUnpublishReferencedAssets } from '@backend/modules/media/services/assertStatusChangeDoesntUnpublishReferencedAssets.service';"""

assert src.count(OLD_IMPORT) == 1, f"ancre import trouvee {src.count(OLD_IMPORT)} fois, attendu 1"
src = src.replace(OLD_IMPORT, NEW_IMPORT)

# ── 2) l'appel, AVANT tout UPDATE ───────────────────────────────────────────
OLD_CALL = """        logical: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const results = await Promise.all("""

NEW_CALL = """        logical: z.boolean().optional(),
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

      const results = await Promise.all("""

assert src.count(OLD_CALL) == 1, f"ancre appel trouvee {src.count(OLD_CALL)} fois, attendu 1"
src = src.replace(OLD_CALL, NEW_CALL)

p.write_text(src, encoding="utf-8")
print("✓ garde branchée dans media.setStatus")
PYEOF

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "→ AKFC_APPLY_ONLY=1 : stop avant typecheck/commit."
  exit 0
fi

echo "→ typecheck…"
pnpm --filter backend typecheck && pnpm typecheck

git add -A && git commit -m "feat(media): garde de depublication reecrite en statuts, branchee dans setStatus (etape 3, increment B1)"
echo "✓ commité."