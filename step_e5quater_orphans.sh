#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 5quater : orphelins. Une ligne MediaAsset dont le binaire a disparu du
# stockage est un mensonge en base — on la détecte, on la montre, on la supprime.
#
# Découvert pendant la migration : KALI-1.png (ligne DB présente, binaire
# Cloudinary absent) a stoppé le flatten. « Ce qui n'existe plus en stockage ne
# doit plus exister en DB. »
#
# Deux fonctions :
#   - findOrphanAssets   : LECTURE SEULE. Teste l'existence via
#                          VirtualStorage.getMetadata (null = absent), sur
#                          Cloudinary ET R2. Ne supprime rien.
#   - purgeOrphanAssets  : supprime les LIGNES dont le binaire est absent
#                          (aucun appel de suppression stockage — le binaire
#                          n'existe déjà pas). Garde de référence incluse.
#
# Prérequis : 5ter.
#
# À lancer depuis la RACINE du repo.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SERVICE="packages/backend/src/modules/storage/services/flattenStatusStrata.service.ts"
ROUTE="apps/web/src/app/api/admin/flatten-status-strata/route.ts"

test -f "$SERVICE" || { echo "✗ $SERVICE absent — lance depuis la racine."; exit 1; }
grep -q "purgeCloudinaryAssetsById" "$SERVICE" || { echo "✗ 5ter absent — lance d'abord step_e5ter."; exit 1; }

if grep -q "findOrphanAssets" "$SERVICE"; then
  echo "→ findOrphanAssets déjà présent, rien à faire."
  exit 0
fi

python3 - <<'PYEOF'
import pathlib

SERVICE = "packages/backend/src/modules/storage/services/flattenStatusStrata.service.ts"
p = pathlib.Path(SERVICE)
src = p.read_text(encoding="utf-8")

FN = '''

/* ─────────────────────────────────────────────────────────────────────── */
/*  Orphelins — lignes DB dont le binaire a disparu du stockage             */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Détecte les MediaAsset dont le binaire n'existe PLUS chez le provider.
 *
 * LECTURE SEULE. Teste l'existence via `VirtualStorage.getMetadata`, qui
 * dispatche Cloudinary (getAssetInfo) / R2 (HeadObject) et renvoie `null` si
 * l'objet est absent. Ne supprime rien.
 *
 * Un orphelin naît d'une suppression manuelle au dashboard, d'un vieux move
 * raté, ou d'un artefact de refacto : la ligne survit au binaire. La règle
 * « ce qui n'existe plus en stockage ne doit plus exister en DB » les vise.
 */
export type OrphanReport = {
  scanned: number;
  orphans: Array<{ id: string; fullPath: string; provider: 'cloudinary' | 'r2' }>;
};

export async function findOrphanAssets(
  prisma: PrismaClient,
  appRoot: string,
): Promise<OrphanReport> {
  const assets = await prisma.mediaAsset.findMany({
    where: { appRoot },
    select: { id: true, fullPath: true, publicId: true },
  });

  const storage = new VirtualStorage({ prisma, appRoot });
  const orphans: OrphanReport['orphans'] = [];

  for (const asset of assets) {
    const meta = await storage.getMetadata(asset.fullPath);
    if (meta === null) {
      orphans.push({
        id: asset.id,
        fullPath: asset.fullPath,
        provider: asset.publicId ? 'cloudinary' : 'r2',
      });
    }
  }

  return { scanned: assets.length, orphans };
}

/**
 * Supprime les LIGNES orphelines (binaire déjà absent → aucun appel de
 * suppression stockage). Garde de référence : une ligne orpheline encore
 * référencée par une page signale un problème plus grave (page pointant un
 * média fantôme) — on la laisse et on la signale, sauf `force`.
 *
 * `dryRun` (défaut) : liste, ne supprime rien.
 */
export type OrphanPurgeReport = {
  dryRun: boolean;
  orphansFound: number;
  purged: Array<{ id: string; fullPath: string }>;
  blockedByReference: Array<{ id: string; fullPath: string; refs: number }>;
};

export async function purgeOrphanAssets(
  prisma: PrismaClient,
  appRoot: string,
  options: { dryRun?: boolean; force?: boolean } = {},
): Promise<OrphanPurgeReport> {
  const dryRun = options.dryRun ?? true;
  const force = options.force ?? false;

  const { orphans } = await findOrphanAssets(prisma, appRoot);

  const report: OrphanPurgeReport = {
    dryRun,
    orphansFound: orphans.length,
    purged: [],
    blockedByReference: [],
  };

  const refs = await prisma.pageMediaReference.groupBy({
    by: ['mediaAssetId'],
    where: { mediaAssetId: { in: orphans.map((o) => o.id) } },
    _count: { mediaAssetId: true },
  });
  const refCount = new Map(
    refs.map((r) => [r.mediaAssetId, r._count.mediaAssetId]),
  );

  const toPurge: typeof orphans = [];
  for (const o of orphans) {
    const n = refCount.get(o.id) ?? 0;
    if (n > 0 && !force) {
      report.blockedByReference.push({ id: o.id, fullPath: o.fullPath, refs: n });
    } else {
      toPurge.push(o);
    }
  }

  if (dryRun) {
    report.purged = toPurge.map((o) => ({ id: o.id, fullPath: o.fullPath }));
    return report;
  }

  for (const o of toPurge) {
    await prisma.mediaAsset.delete({ where: { id: o.id } });
    report.purged.push({ id: o.id, fullPath: o.fullPath });
  }

  return report;
}
'''

p.write_text(src.rstrip() + "\n" + FN, encoding="utf-8")
print("  ✓ findOrphanAssets + purgeOrphanAssets ajoutés")
PYEOF

# ── Route : voies ?orphans (dry-run lecture) et ?purgeorphans ───────────────
python3 - <<'PYEOF'
import pathlib

def sub(path, old, new, label):
    p = pathlib.Path(path)
    src = p.read_text(encoding="utf-8")
    assert src.count(old) == 1, f"[{label}] ancre trouvee {src.count(old)} fois, attendu 1"
    p.write_text(src.replace(old, new), encoding="utf-8")
    print(f"  ✓ {label}")

ROUTE = "apps/web/src/app/api/admin/flatten-status-strata/route.ts"

sub(ROUTE,
    "  flattenStatusStrata,\n  purgeAssetsById,\n  purgeCloudinaryAssetsById,\n}",
    "  flattenStatusStrata,\n  purgeAssetsById,\n  purgeCloudinaryAssetsById,\n  findOrphanAssets,\n  purgeOrphanAssets,\n}",
    "route : imports orphelins")

sub(ROUTE,
    "  const params = request.nextUrl.searchParams;\n  const run = params.get('run') === '1';",
    """  const params = request.nextUrl.searchParams;
  const run = params.get('run') === '1';

  // Orphelins — lignes dont le binaire a disparu.
  //   ?orphans        → LECTURE SEULE : liste les orphelins.
  //   ?purgeorphans   → supprime les lignes orphelines (dry-run sauf &run=1).
  if (params.get('orphans') !== null) {
    try {
      const report = await findOrphanAssets(prisma, APP_ROOT);
      return NextResponse.json({ ok: true, report });
    } catch (err) {
      return NextResponse.json(
        { ok: false, error: err instanceof Error ? err.message : String(err) },
        { status: 500 },
      );
    }
  }
  if (params.get('purgeorphans') !== null) {
    try {
      const report = await purgeOrphanAssets(prisma, APP_ROOT, {
        dryRun: !run,
        force: params.get('force') === '1',
      });
      return NextResponse.json({ ok: true, report });
    } catch (err) {
      return NextResponse.json(
        { ok: false, error: err instanceof Error ? err.message : String(err) },
        { status: 500 },
      );
    }
  }""",
    "route : branches orphans / purgeorphans")
PYEOF

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "→ AKFC_APPLY_ONLY=1 : stop avant typecheck/commit."
  exit 0
fi

echo "→ typecheck backend…"
if ! pnpm --filter backend typecheck; then echo "✗ backend ROUGE — aucun commit."; exit 1; fi
echo "→ typecheck racine…"
if ! pnpm typecheck; then echo "✗ racine ROUGE — aucun commit."; exit 1; fi

git add -A && git commit -m "feat(storage): detection + purge des lignes orphelines (etape 5quater)"
echo "✓ commité."
echo
echo "→ SUITE :"
echo "   1. ?orphans          → LECTURE SEULE : liste TOUS les orphelins"
echo "   2. ?purgeorphans     → DRY-RUN : ce qui serait supprimé"
echo "   3. ?purgeorphans&run=1  → supprime les lignes orphelines"
echo "   4. (sans param)&run=1   → reprend la migration (les 3 déjà faits sont sautés)"