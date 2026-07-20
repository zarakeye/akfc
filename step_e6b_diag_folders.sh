#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# VAGUE B — DIAGNOSTIC (LECTURE SEULE) : reste-t-il des dossiers physiques
# `pending/` ou `published/` sous AKFC, chez les providers ?
#
# Le pliage (StatusFoldingReadView) masque ces dossiers. Avant de le retirer,
# il faut savoir s'ils existent encore (vides mais présents) — sinon ils
# réapparaîtraient dans le finder une fois le pliage débranché.
#
# Liste les sous-dossiers directs de AKFC/ chez Cloudinary (api.sub_folders).
# Ne supprime rien.
#
# À lancer depuis la RACINE du repo.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ROUTE="apps/web/src/app/api/admin/diagnose-folders/route.ts"
test -f apps/web/src/app/api/admin/backfill-r2-assets/route.ts \
  || { echo "✗ lance depuis la racine."; exit 1; }

if [ -f "$ROUTE" ]; then echo "→ route déjà présente."; exit 0; fi

mkdir -p "$(dirname "$ROUTE")"
cat > "$ROUTE" <<'TSEOF'
/**
 * 🔍 Diagnostic LECTURE SEULE — dossiers physiques sous AKFC.
 *
 * GET → liste les sous-dossiers directs de AKFC/ chez Cloudinary. On cherche
 * les dossiers `pending` / `published` résiduels (vides après la migration
 * mais toujours présents comme entités Cloudinary). Ne supprime rien.
 */
import { NextResponse } from 'next/server';
import { APP_ROOT } from '@config/app';
import { cloudinary } from '@backend/modules/cloudinary/cloudinary.client';

async function subFolders(path: string): Promise<string[]> {
  try {
    const res = await cloudinary.api.sub_folders(path);
    return ((res.folders ?? []) as Array<{ path: string }>).map((f) => f.path);
  } catch {
    return [];
  }
}

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'disabled in prod' }, { status: 403 });
  }

  const rootFolders = await subFolders(APP_ROOT);

  // Pour chaque dossier de statut résiduel, on regarde s'il a encore du contenu.
  const statusDirs = rootFolders.filter((p) =>
    /\/(pending|published)$/.test(p),
  );
  const statusDirContents: Record<string, string[]> = {};
  for (const dir of statusDirs) {
    statusDirContents[dir] = await subFolders(dir);
  }

  return NextResponse.json({
    ok: true,
    report: {
      rootFolders,
      residualStatusDirs: statusDirs,
      statusDirContents,
      verdict:
        statusDirs.length === 0
          ? 'aucun dossier de statut résiduel — le pliage peut être retiré sans nettoyage'
          : 'des dossiers pending/published subsistent — à vider/supprimer avant de retirer le pliage',
    },
  });
}
TSEOF
echo "✓ $ROUTE créée"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "→ stop."; exit 0; fi
echo "→ typecheck backend…"; pnpm --filter backend typecheck || { echo "✗ backend rouge"; exit 1; }
echo "→ typecheck racine…"; pnpm typecheck || { echo "✗ racine rouge"; exit 1; }
git add -A && git commit -m "chore(admin): diagnostic dossiers physiques residuels (vague B)"
echo "✓ commité."