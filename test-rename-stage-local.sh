#!/usr/bin/env bash
#
# AKFC — TEST à blanc de la migration Stage → Seminar, en LOCAL (Postgres natif).
#
# Exécute tout le renommage dans BEGIN … ROLLBACK via `psql` direct sur ton
# DATABASE_URL local (le `?schema=…` de Prisma est retiré, libpq le refuse).
# Fait d'abord un dump de sauvegarde. RIEN n'est modifié (ROLLBACK).
#
# Prérequis : `rename_stage_to_seminar.migration.sql` à la racine du repo, et
# `psql`/`pg_dump` dans le PATH (Postgres.app : ajoute
#   /Applications/Postgres.app/Contents/Versions/latest/bin  au PATH).
# Usage : bash test-rename-stage-local.sh
#         AKFC_PSQL_URL='postgresql://user:pw@localhost:5432/akfc_db' bash test-rename-stage-local.sh
#
set -euo pipefail

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
SQL="rename_stage_to_seminar.migration.sql"
[ -f "$SQL" ] || { echo "ERREUR: $SQL introuvable à la racine du repo." >&2; exit 1; }
command -v psql >/dev/null 2>&1 || { echo "ERREUR: psql absent du PATH (voir l'en-tête)." >&2; exit 1; }

# 1. Résoudre l'URL : AKFC_PSQL_URL prioritaire, sinon DATABASE_URL du .env(.local)
URL="${AKFC_PSQL_URL:-}"
if [ -z "$URL" ]; then
  for f in .env.local .env; do
    [ -f "$f" ] || continue
    line="$(grep -E '^DATABASE_URL=' "$f" | head -1 || true)"
    [ -n "$line" ] || continue
    URL="${line#DATABASE_URL=}"
    URL="${URL%\"}"; URL="${URL#\"}"; URL="${URL%\'}"; URL="${URL#\'}"
    echo "→ DATABASE_URL lu depuis $f"
    break
  done
fi
[ -n "$URL" ] || { echo "ERREUR: DATABASE_URL introuvable — exporte AKFC_PSQL_URL." >&2; exit 1; }

# 2. libpq refuse les params Prisma (?schema=…) → on retire la query string
PSQL_URL="${URL%%\?*}"
echo "→ cible : ${PSQL_URL%@*}@…  (query retirée)"

# 3. Sauvegarde
STAMP="$(date +%Y%m%d_%H%M)"
echo "→ dump de sauvegarde…"
pg_dump "$PSQL_URL" > "akfc_local_avant_seminar_${STAMP}.sql"
echo "  écrit : akfc_local_avant_seminar_${STAMP}.sql"

# 4. Test en transaction (annulé)
echo "→ test en transaction (BEGIN … ROLLBACK) — rien ne sera modifié…"
{
  echo "BEGIN;"
  cat "$SQL"
  echo ""
  echo '\d "Seminar"'
  echo '\d "SeminarSession"'
  echo 'SELECT id, slug FROM "Seminar" ORDER BY id;'
  echo "ROLLBACK;"
} | psql "$PSQL_URL" -v ON_ERROR_STOP=1

echo ""
echo "✅ Si tu vois \"Seminar\"/\"SeminarSession\" décrites, les séminaires listés,"
echo "   et AUCUNE erreur → migration bonne. Base intacte (ROLLBACK)."