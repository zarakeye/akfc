#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 5bis : purge définitive ciblée par id, AVANT l'aplatissement.
#
# On supprime un asset mal formé (`cours/cours/3`) pour de bon — binaire chez
# le provider + ligne MediaAsset — au lieu de le migrer pour rien. Ciblage par
# `id` (unique) : aucun risque de déborder sur un voisin.
#
# Ajoute `purgeAssetsById` au service existant + une branche `?purge=<id>` à la
# route. Même filet : dry-run par défaut.
#
# Prérequis : la route flatten-status-strata existe (étape 5).
#
# À lancer depuis la RACINE du repo.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SERVICE="packages/backend/src/modules/storage/services/flattenStatusStrata.service.ts"
ROUTE="apps/web/src/app/api/admin/flatten-status-strata/route.ts"

test -f "$SERVICE" || { echo "✗ $SERVICE absent — lance depuis la racine, étape 5 faite."; exit 1; }
test -f "$ROUTE"   || { echo "✗ $ROUTE absent — l'étape 5 n'a pas posé la route."; exit 1; }

# ── Garde anti-double-application ───────────────────────────────────────────
if grep -q "purgeAssetsById" "$SERVICE"; then
  echo "→ purgeAssetsById déjà présent, rien à faire."
  exit 0
fi

python3 - <<'PYEOF'
import pathlib

def append_before_last_line(path, marker, block, label):
    p = pathlib.Path(path)
    src = p.read_text(encoding="utf-8")
    assert src.count(marker) == 1, f"[{label}] marqueur {marker!r} trouve {src.count(marker)} fois"
    p.write_text(src.replace(marker, block + marker), encoding="utf-8")
    print(f"  ✓ {label}")

SERVICE = "packages/backend/src/modules/storage/services/flattenStatusStrata.service.ts"

# On ajoute la fonction de purge à la FIN du fichier service (après la dernière
# accolade de flattenStatusStrata). Ancre : la toute fin du fichier.
p = pathlib.Path(SERVICE)
src = p.read_text(encoding="utf-8")

PURGE = '''

/* ─────────────────────────────────────────────────────────────────────── */
/*  purgeAssetsById — suppression DÉFINITIVE ciblée                         */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Supprime définitivement des assets, ciblés par `id` (jamais par chemin ni
 * préfixe : un id est unique, impossible de déborder sur un voisin).
 *
 * Fait les DEUX moitiés que ni `VirtualStorage.delete` ni la corbeille ne font
 * ensemble : le binaire chez le provider PUIS la ligne `MediaAsset`. Ordre
 * imposé — binaire d'abord, ligne ensuite : si l'ordre inverse échoue, on a
 * une ligne fantôme pointant vers un binaire disparu.
 *
 * ⚠️ Irréversible. Ne passe pas par la corbeille (quarantaine). Réservé à un
 * nettoyage admin explicite, pas à une suppression utilisateur.
 *
 * `dryRun` (défaut) : liste ce qui serait supprimé, ne touche à rien.
 */
export type PurgeReport = {
  dryRun: boolean;
  requested: string[];
  planned: Array<{ id: string; fullPath: string }>;
  purged: Array<{ id: string; fullPath: string }>;
  failed: Array<{ id: string; fullPath: string; error: string }>;
  notFound: string[];
};

export async function purgeAssetsById(
  prisma: PrismaClient,
  appRoot: string,
  ids: readonly string[],
  options: { dryRun?: boolean } = {},
): Promise<PurgeReport> {
  const dryRun = options.dryRun ?? true;

  const assets = await prisma.mediaAsset.findMany({
    where: { appRoot, id: { in: [...ids] } },
    select: { id: true, fullPath: true },
  });

  const found = new Set(assets.map((a) => a.id));

  const report: PurgeReport = {
    dryRun,
    requested: [...ids],
    planned: assets.map((a) => ({ id: a.id, fullPath: a.fullPath })),
    purged: [],
    failed: [],
    notFound: ids.filter((id) => !found.has(id)),
  };

  if (dryRun) return report;

  const storage = new VirtualStorage({ prisma, appRoot });

  for (const asset of assets) {
    try {
      // 1) le binaire (dispatch Cloudinary / R2 selon le provider).
      await storage.delete(asset.fullPath);
      // 2) la ligne — seulement si le binaire est bien parti.
      await prisma.mediaAsset.delete({ where: { id: asset.id } });
      report.purged.push({ id: asset.id, fullPath: asset.fullPath });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      report.failed.push({ id: asset.id, fullPath: asset.fullPath, error: message });
      // Arrêt net, comme la migration.
      break;
    }
  }

  return report;
}
'''

# On ajoute à la fin, en s'assurant que le fichier finit bien par la fonction
# flattenStatusStrata (donc par une accolade fermante suivie éventuellement
# d'une ligne vide).
assert src.rstrip().endswith("}"), "le service ne se termine pas par une accolade — état inattendu"
p.write_text(src.rstrip() + "\n" + PURGE, encoding="utf-8")
print("  ✓ purgeAssetsById ajouté au service")
PYEOF

# ── La route : ajouter la branche purge ─────────────────────────────────────
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
    "import { flattenStatusStrata } from '@backend/modules/storage/services/flattenStatusStrata.service';",
    "import {\n"
    "  flattenStatusStrata,\n"
    "  purgeAssetsById,\n"
    "} from '@backend/modules/storage/services/flattenStatusStrata.service';",
    "route : import purgeAssetsById")

sub(ROUTE,
    "  const run = request.nextUrl.searchParams.get('run') === '1';\n\n  try {",
    """  const params = request.nextUrl.searchParams;
  const run = params.get('run') === '1';

  // Purge ciblée : ?purge=<id>[,<id>...] — dry-run sauf si &run=1.
  const purgeParam = params.get('purge');
  if (purgeParam) {
    const ids = purgeParam.split(',').map((s) => s.trim()).filter(Boolean);
    try {
      const report = await purgeAssetsById(prisma, APP_ROOT, ids, {
        dryRun: !run,
      });
      return NextResponse.json({ ok: true, report });
    } catch (err) {
      return NextResponse.json(
        { ok: false, error: err instanceof Error ? err.message : String(err) },
        { status: 500 },
      );
    }
  }

  try {""",
    "route : branche purge")
PYEOF

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "→ AKFC_APPLY_ONLY=1 : stop avant typecheck/commit."
  exit 0
fi

echo "→ typecheck backend…"
if ! pnpm --filter backend typecheck; then echo "✗ backend ROUGE — aucun commit."; exit 1; fi
echo "→ typecheck racine…"
if ! pnpm typecheck; then echo "✗ racine ROUGE — aucun commit."; exit 1; fi

git add -A && git commit -m "feat(storage): purge definitive ciblee par id (etape 5bis)"
echo "✓ commité."
echo
echo "→ SUITE :"
echo "   1. /api/admin/flatten-status-strata?purge=cmpjg0j1w0002gsp7ksyv4idd"
echo "      → DRY-RUN : vérifie que 'planned' contient bien le SEUL cours/cours/3"
echo "   2. ...?purge=cmpjg0j1w0002gsp7ksyv4idd&run=1   → supprime pour de bon"
echo "   3. /api/admin/flatten-status-strata            → dry-run migration (33 restants)"
echo "   4. ...?run=1                                    → migre"