#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 5ter : purge Cloudinary native (uploader.destroy), pour les assets que
# `VirtualStorage.delete` refuse (Cloudinary n'implémente pas `delete`).
#
# `purgeAssetsById` (5bis) passe par VirtualStorage.delete → lève pour
# Cloudinary. On ajoute `purgeCloudinaryAssetsById` qui reprend EXACTEMENT le
# chemin de `deleteForever` (getAssetInfo + uploader.destroy authenticated),
# avec en plus une GARDE : refuse de détruire un asset encore référencé par une
# page publiée (sauf ?force=1). Ciblage par id.
#
# Prérequis : 5bis (purgeAssetsById existe).
#
# À lancer depuis la RACINE du repo.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SERVICE="packages/backend/src/modules/storage/services/flattenStatusStrata.service.ts"
ROUTE="apps/web/src/app/api/admin/flatten-status-strata/route.ts"

test -f "$SERVICE" || { echo "✗ $SERVICE absent — lance depuis la racine."; exit 1; }
grep -q "purgeAssetsById" "$SERVICE" || { echo "✗ 5bis absent — lance d'abord step_e5bis_purge.sh."; exit 1; }

if grep -q "purgeCloudinaryAssetsById" "$SERVICE"; then
  echo "→ purgeCloudinaryAssetsById déjà présent, rien à faire."
  exit 0
fi

python3 - <<'PYEOF'
import pathlib

SERVICE = "packages/backend/src/modules/storage/services/flattenStatusStrata.service.ts"
p = pathlib.Path(SERVICE)
src = p.read_text(encoding="utf-8")

# ── Imports Cloudinary en tête (repris à l'identique de deleteForever) ───────
IMPORT_ANCHOR = "import { VirtualStorage } from '@backend/modules/storage/virtualStorage';"
IMPORTS = '''import { cloudinary } from '@backend/modules/cloudinary/cloudinary.client';
import { getAssetInfo } from '@backend/modules/cloudinary/services/cloudinary.service';
import { invalidate as invalidateResourcesCache } from '@backend/modules/cloudinary/cache/resourcesCache';
import { VirtualStorage } from '@backend/modules/storage/virtualStorage';'''
assert src.count(IMPORT_ANCHOR) == 1, "ancre import VirtualStorage introuvable"
src = src.replace(IMPORT_ANCHOR, IMPORTS)

# ── La fonction, ajoutée en fin de fichier ──────────────────────────────────
FN = '''

/* ─────────────────────────────────────────────────────────────────────── */
/*  purgeCloudinaryAssetsById — purge native Cloudinary                     */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Supprime définitivement des assets CLOUDINARY, ciblés par `id`.
 *
 * ─── Pourquoi une fonction distincte de `purgeAssetsById` ────────────────
 *
 * `purgeAssetsById` passe par `VirtualStorage.delete`, qui LÈVE pour
 * Cloudinary (l'adapter Cloudinary n'implémente pas `delete` — la suppression
 * y passe normalement par la corbeille). Ici on reprend le chemin exact de
 * `deleteForever` : `getAssetInfo` pour le `resource_type`, puis
 * `uploader.destroy(..., { type: 'authenticated', resource_type })`.
 *
 * ─── Garde de référence ──────────────────────────────────────────────────
 *
 * Détruire un asset qu'une page publiée affiche casse la page. On refuse,
 * sauf `force`. Même logique que la garde de dépublication de `setStatus`,
 * mais ici c'est une DESTRUCTION, donc plus stricte encore.
 *
 * ─── Tolérance à l'orphelin (reprise de deleteForever) ───────────────────
 *
 * Si le binaire a déjà disparu (`Asset not found`), on considère l'objectif
 * atteint et on retire la ligne DB quand même. Destruction idempotente.
 */
export type CloudinaryPurgeReport = {
  dryRun: boolean;
  requested: string[];
  planned: Array<{ id: string; fullPath: string; publicId: string | null }>;
  purged: Array<{ id: string; fullPath: string }>;
  blockedByReference: Array<{ id: string; fullPath: string; refs: number }>;
  failed: Array<{ id: string; fullPath: string; error: string }>;
  notFound: string[];
};

export async function purgeCloudinaryAssetsById(
  prisma: PrismaClient,
  appRoot: string,
  ids: readonly string[],
  options: { dryRun?: boolean; force?: boolean } = {},
): Promise<CloudinaryPurgeReport> {
  const dryRun = options.dryRun ?? true;
  const force = options.force ?? false;

  const assets = await prisma.mediaAsset.findMany({
    where: { appRoot, id: { in: [...ids] } },
    select: { id: true, fullPath: true, publicId: true },
  });
  const found = new Set(assets.map((a) => a.id));

  const report: CloudinaryPurgeReport = {
    dryRun,
    requested: [...ids],
    planned: assets.map((a) => ({
      id: a.id,
      fullPath: a.fullPath,
      publicId: a.publicId,
    })),
    purged: [],
    blockedByReference: [],
    failed: [],
    notFound: ids.filter((id) => !found.has(id)),
  };

  // Garde de référence — sauf force. Comptée pour tous, y compris en dry-run,
  // pour que la liste montre ce qui serait bloqué.
  if (!force) {
    const refs = await prisma.pageMediaReference.groupBy({
      by: ['mediaAssetId'],
      where: { mediaAssetId: { in: assets.map((a) => a.id) } },
      _count: { mediaAssetId: true },
    });
    const refCount = new Map(
      refs.map((r) => [r.mediaAssetId, r._count.mediaAssetId]),
    );
    for (const a of assets) {
      const n = refCount.get(a.id) ?? 0;
      if (n > 0) {
        report.blockedByReference.push({
          id: a.id,
          fullPath: a.fullPath,
          refs: n,
        });
      }
    }
  }

  if (dryRun) return report;

  const blockedIds = new Set(report.blockedByReference.map((b) => b.id));

  for (const asset of assets) {
    if (blockedIds.has(asset.id)) continue; // référencé, non forcé → sauté

    try {
      // 1) le binaire Cloudinary (tolérant à l'orphelin, comme deleteForever).
      try {
        const info = await getAssetInfo(asset.fullPath);
        await cloudinary.uploader.destroy(asset.fullPath, {
          type: 'authenticated',
          resource_type: info.resource_type,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (!message.startsWith('Asset not found')) throw err;
        // orphelin : binaire déjà absent → on retire quand même la ligne.
      }

      // 2) la ligne DB.
      await prisma.mediaAsset.delete({ where: { id: asset.id } });
      report.purged.push({ id: asset.id, fullPath: asset.fullPath });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      report.failed.push({ id: asset.id, fullPath: asset.fullPath, error: message });
      break; // arrêt net
    }
  }

  if (report.purged.length > 0) invalidateResourcesCache();

  return report;
}
'''

p.write_text(src.rstrip() + "\n" + FN, encoding="utf-8")
print("  ✓ purgeCloudinaryAssetsById ajouté au service")
PYEOF

# ── La route : nouvelle voie ?purgecloud=<id> ───────────────────────────────
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
    "import {\n  flattenStatusStrata,\n  purgeAssetsById,\n} from '@backend/modules/storage/services/flattenStatusStrata.service';",
    "import {\n  flattenStatusStrata,\n  purgeAssetsById,\n  purgeCloudinaryAssetsById,\n} from '@backend/modules/storage/services/flattenStatusStrata.service';",
    "route : import purgeCloudinaryAssetsById")

sub(ROUTE,
    "  // Purge ciblée : ?purge=<id>[,<id>...] — dry-run sauf si &run=1.\n  const purgeParam = params.get('purge');",
    """  // Purge Cloudinary native : ?purgecloud=<id>[,...] — dry-run sauf &run=1.
  // &force=1 outrepasse la garde de référence (page publiée).
  const purgeCloudParam = params.get('purgecloud');
  if (purgeCloudParam) {
    const ids = purgeCloudParam.split(',').map((s) => s.trim()).filter(Boolean);
    try {
      const report = await purgeCloudinaryAssetsById(prisma, APP_ROOT, ids, {
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
  }

  // Purge ciblée : ?purge=<id>[,<id>...] — dry-run sauf si &run=1.
  const purgeParam = params.get('purge');""",
    "route : branche purgecloud")
PYEOF

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "→ AKFC_APPLY_ONLY=1 : stop avant typecheck/commit."
  exit 0
fi

echo "→ typecheck backend…"
if ! pnpm --filter backend typecheck; then echo "✗ backend ROUGE — aucun commit."; exit 1; fi
echo "→ typecheck racine…"
if ! pnpm typecheck; then echo "✗ racine ROUGE — aucun commit."; exit 1; fi

git add -A && git commit -m "feat(storage): purge Cloudinary native avec garde de reference (etape 5ter)"
echo "✓ commité."
echo
echo "→ SUITE :"
echo "   1. ?purgecloud=cmpjg0j1w0002gsp7ksyv4idd            → DRY-RUN"
echo "      Vérifier planned=1 et blockedByReference=[] (sinon la page l'affiche)"
echo "   2. ?purgecloud=cmpjg0j1w0002gsp7ksyv4idd&run=1      → détruit"
echo "   3. /api/admin/flatten-status-strata                 → dry-run migration (33)"