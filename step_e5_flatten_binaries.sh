#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 5 : migration réelle des binaires historiques vers les chemins plats.
#
# Ce script POSE le service + la route admin. Il NE DÉPLACE RIEN lui-même —
# le déplacement se fait en hittant la route, d'abord en dry-run.
#
# Prérequis : étapes 3 et 4 (le flip + chemins plats). Sans le flip,
# reconcileMovedAsset réécrirait `status` depuis le nouveau chemin.
#
# ─── WORKFLOW APRÈS CE SCRIPT ────────────────────────────────────────────────
#   1. `pnpm dev` (pointant sur la DB à migrer)
#   2. Ouvrir  /api/admin/flatten-status-strata        → DRY-RUN : liste les
#      34 moves, ne déplace rien. Vérifier `planned`.
#   3. Ouvrir  /api/admin/flatten-status-strata?run=1  → déplace réellement.
#      Idempotent & reprenable : relancer saute les déjà-migrés.
#   4. Re-hit sans ?run → `planned: []` = migration complète.
#
# La route se DÉSACTIVE en NODE_ENV=production (même garde que backfill-r2).
#
# À lancer depuis la RACINE du repo.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SERVICE="packages/backend/src/modules/storage/services/flattenStatusStrata.service.ts"
ROUTE="apps/web/src/app/api/admin/flatten-status-strata/route.ts"

# ── Gardes de prérequis ─────────────────────────────────────────────────────
test -f packages/backend/src/modules/storage/virtualStorage.ts \
  || { echo "✗ virtualStorage.ts absent — lance depuis la racine du repo."; exit 1; }
grep -q "trpc.media.setStatus.useMutation" apps/web/src/features/finder-core/hooks/useStatusChange.ts \
  || { echo "✗ le flip (step_e3b2) n'est pas passé — reconcileMovedAsset réécrirait status."; exit 1; }
grep -qE "^import .*buildUploadFileName" packages/backend/src/modules/storage/router.ts \
  || { echo "✗ l'import 4b n'est pas réparé — lance d'abord step_e4b_fix_import.sh."; exit 1; }

# ── Garde anti-double-application ───────────────────────────────────────────
if [ -f "$ROUTE" ]; then
  echo "→ route flatten-status-strata déjà présente, rien à faire."
  exit 0
fi

# ── Le service (créé côté outputs par Claude ; ici on le VÉRIFIE présent) ────
# Le service a été écrit dans le repo par Claude en amont ; ce script s'assure
# qu'il est là avant de poser la route qui en dépend.
test -f "$SERVICE" \
  || { echo "✗ $SERVICE absent — le service de migration n'a pas été déposé."; exit 1; }

# ── La route admin ──────────────────────────────────────────────────────────
mkdir -p "$(dirname "$ROUTE")"
cat > "$ROUTE" <<'TSEOF'
/**
 * 🛠 Route admin one-shot — aplatissement des strates de statut (étape 5).
 *
 * Déplace RÉELLEMENT les binaires historiques `AKFC/<statut>/…` → `AKFC/…`.
 * Voir la doc complète dans
 * `packages/backend/src/modules/storage/services/flattenStatusStrata.service.ts`.
 *
 *   GET (défaut)      → DRY-RUN : liste les moves, ne déplace rien.
 *   GET ?run=1        → exécute. Idempotent & reprenable.
 *
 * Désactivée en production (comme backfill-r2-assets) : pointer un dev local
 * sur la DB cible pour l'exécuter.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { APP_ROOT } from '@config/app';
import { prisma } from '@backend/prisma';
import { flattenStatusStrata } from '@backend/modules/storage/services/flattenStatusStrata.service';

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Route disabled in production' },
      { status: 403 },
    );
  }

  const run = request.nextUrl.searchParams.get('run') === '1';

  try {
    const report = await flattenStatusStrata(prisma, APP_ROOT, {
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
TSEOF
echo "✓ $ROUTE créée"

# ── Vérifier que l'import prisma de la route pointe sur le bon module ────────
# (backfill-r2-assets importe des services, pas prisma directement — on vérifie
#  que '@backend/prisma' existe, sinon on corrige sur la forme réelle du repo.)
if ! grep -rq "export.*prisma" packages/backend/src/prisma.ts 2>/dev/null \
   && ! test -f packages/backend/src/prisma/index.ts; then
  echo "⚠ '@backend/prisma' introuvable — à ADAPTER : remplace l'import prisma"
  echo "  de la route par le chemin réel du client Prisma de ton repo."
fi

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "→ AKFC_APPLY_ONLY=1 : stop avant typecheck/commit."
  exit 0
fi

echo "→ typecheck backend…"
if ! pnpm --filter backend typecheck; then
  echo "✗ typecheck backend ROUGE — aucun commit."; exit 1
fi
echo "→ typecheck racine…"
if ! pnpm typecheck; then
  echo "✗ typecheck racine ROUGE — aucun commit."; exit 1
fi

git add -A && git commit -m "feat(storage): migration des binaires vers chemins plats, route admin dry-run (etape 5)"
echo "✓ commité."
echo
echo "→ SUITE : pnpm dev, puis /api/admin/flatten-status-strata (dry-run),"
echo "  vérifier 'planned', puis ?run=1 pour déplacer réellement."