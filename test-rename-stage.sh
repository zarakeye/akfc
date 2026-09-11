#!/usr/bin/env bash
#
# AKFC — TEST à blanc de la migration Stage → Seminar (BEGIN … ROLLBACK).
#
# Exécute TOUT le renommage dans une transaction puis l'ANNULE : si ça passe
# sans erreur, c'est que chaque nom d'objet visé existe et que la migration est
# exhaustive. RIEN n'est modifié (ROLLBACK). À lancer sur le serveur.
#
# Prérequis : place rename_stage_to_seminar.migration.sql à la racine du repo.
# Usage : bash test-rename-stage.sh
#
set -euo pipefail

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
SQL="rename_stage_to_seminar.migration.sql"
[ -f "$SQL" ] || { echo "ERREUR: $SQL introuvable à la racine du repo." >&2; exit 1; }

echo "→ Sauvegarde de sécurité (dump) avant toute chose…"
docker compose exec -T postgres pg_dump -U "${PGUSER:-akfc}" -d "${PGDATABASE:-akfc_db}" > "akfc_avant_seminar_$(date +%Y%m%d_%H%M).sql"
echo "  dump écrit : akfc_avant_seminar_$(date +%Y%m%d_%H%M).sql"

echo "→ Test en transaction (BEGIN … ROLLBACK) — rien ne sera modifié…"
{
  echo "BEGIN;"
  cat "$SQL"
  echo ""
  echo "-- vérif à chaud dans la transaction :"
  echo '\d "Seminar"'
  echo '\d "SeminarSession"'
  echo 'SELECT id, slug FROM "Seminar" ORDER BY id;'
  echo "ROLLBACK;"
} | docker compose exec -T postgres psql -U "${PGUSER:-akfc}" -d "${PGDATABASE:-akfc_db}" -v ON_ERROR_STOP=1

echo ""
echo "✅ Si tu vois les tables \"Seminar\"/\"SeminarSession\" décrites ci-dessus,"
echo "   les 2 séminaires listés, et AUCUNE erreur → la migration est bonne."
echo "   (Tout a été annulé par le ROLLBACK ; la base est intacte.)"