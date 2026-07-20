#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# VAGUE B — nettoyage des dossiers de statut résiduels chez Cloudinary.
#
# Le diagnostic a montré AKFC/pending et AKFC/published subsistants, dont
# AKFC/pending/medias (déclaré obsolète par Stéphane) et AKFC/published/cours
# (coquille vide post-migration). On les détruit récursivement via
# `deleteByPrefix` (déjà éprouvé), APRÈS un dry-run qui montre le contenu.
#
# Sécurité :
#   - dry-run (défaut) : COMPTE les assets sous chaque préfixe, ne supprime rien.
#   - garde : refuse de toucher un préfixe qui ne finit pas par /pending ou
#     /published (on ne détruit QUE des dossiers de statut, jamais un vrai
#     dossier de contenu).
#   - garde DB : refuse si un MediaAsset vit encore sous le préfixe (la
#     migration serait incomplète — on ne détruit pas du contenu référencé).
#
# À lancer depuis la RACINE du repo.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ROUTE="apps/web/src/app/api/admin/prune-status-dirs/route.ts"
test -f apps/web/src/app/api/admin/backfill-r2-assets/route.ts \
  || { echo "✗ lance depuis la racine."; exit 1; }

if [ -f "$ROUTE" ]; then echo "→ route déjà présente."; exit 0; fi

mkdir -p "$(dirname "$ROUTE")"
cat > "$ROUTE" <<'TSEOF'
/**
 * 🧹 Nettoyage des dossiers de statut résiduels (vague B).
 *
 *   GET (défaut)  → DRY-RUN : compte les assets sous AKFC/pending et
 *                   AKFC/published, liste leurs sous-dossiers. Ne supprime rien.
 *   GET ?run=1    → détruit récursivement les deux préfixes (deleteByPrefix).
 *
 * Gardes : ne cible QUE les préfixes de statut ; refuse si un MediaAsset vit
 * encore dessous (migration incomplète). Désactivée en production.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { APP_ROOT } from '@config/app';
import { prisma } from '@backend/prisma';
import { cloudinary } from '@backend/modules/cloudinary/cloudinary.client';
import { deleteByPrefix } from '@backend/modules/cloudinary/services/cloudinary.service';

const STATUS_PREFIXES = [`${APP_ROOT}/pending`, `${APP_ROOT}/published`];

async function countAssetsUnder(prefix: string): Promise<number> {
  let total = 0;
  for (const resource_type of ['image', 'video', 'raw'] as const) {
    try {
      const res = await cloudinary.api.resources({
        type: 'authenticated',
        resource_type,
        prefix,
        max_results: 500,
      });
      total += (res.resources ?? []).length;
    } catch {
      // prefix inexistant pour ce type → 0
    }
  }
  return total;
}

async function subFolders(path: string): Promise<string[]> {
  try {
    const res = await cloudinary.api.sub_folders(path);
    return ((res.folders ?? []) as Array<{ path: string }>).map((f) => f.path);
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'disabled in prod' }, { status: 403 });
  }
  const run = request.nextUrl.searchParams.get('run') === '1';

  // Garde DB : aucun MediaAsset ne doit vivre sous une strate.
  const stillUnderStrata = await prisma.mediaAsset.count({
    where: {
      appRoot: APP_ROOT,
      OR: STATUS_PREFIXES.map((p) => ({ fullPath: { startsWith: `${p}/` } })),
    },
  });
  if (stillUnderStrata > 0) {
    return NextResponse.json(
      {
        ok: false,
        error: `${stillUnderStrata} MediaAsset vivent encore sous une strate — migration incomplète, refus de détruire.`,
      },
      { status: 409 },
    );
  }

  const inventory: Record<string, { assetCount: number; subFolders: string[] }> =
    {};
  for (const prefix of STATUS_PREFIXES) {
    inventory[prefix] = {
      assetCount: await countAssetsUnder(prefix),
      subFolders: await subFolders(prefix),
    };
  }

  if (!run) {
    return NextResponse.json({
      ok: true,
      report: {
        dryRun: true,
        inventory,
        note: 'Aucune suppression. Relancer avec ?run=1 pour détruire.',
      },
    });
  }

  const deleted: string[] = [];
  for (const prefix of STATUS_PREFIXES) {
    // Garde de forme : on ne détruit QUE des préfixes de statut.
    if (!/\/(pending|published)$/.test(prefix)) continue;
    await deleteByPrefix(prefix);
    deleted.push(prefix);
  }

  return NextResponse.json({
    ok: true,
    report: { dryRun: false, deleted, inventoryBeforeDelete: inventory },
  });
}
TSEOF
echo "✓ $ROUTE créée"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "→ stop."; exit 0; fi
echo "→ typecheck backend…"; pnpm --filter backend typecheck || { echo "✗ backend rouge"; exit 1; }
echo "→ typecheck racine…"; pnpm typecheck || { echo "✗ racine rouge"; exit 1; }
git add -A && git commit -m "chore(admin): nettoyage dossiers de statut residuels, dry-run (vague B)"
echo "✓ commité."