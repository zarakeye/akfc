#!/usr/bin/env bash
# Le Mac sur ses propres services : base, stockage et e-mails de docker-compose.dev.yml.
# Les fichiers .env actuels (qui visent la PRODUCTION) sont DÉPLACÉS hors du repo, pas supprimés.
# Aucun secret n'est affiché ; rien n'est envoyé au serveur ; aucun commit (les .env ne sont pas versionnés).
# Usage (racine du repo, pnpm dev arrêté) : bash passer-en-dev-local.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] && [ -f .env.dev.example ] && [ -f docker-compose.dev.yml ] || { echo "À lancer à la racine du repo."; exit 1; }
if pgrep -f "next dev" >/dev/null 2>&1; then echo "❌ pnpm dev tourne : arrête-le (Ctrl+C), puis relance ce script."; exit 1; fi
command -v docker >/dev/null || { echo "❌ Docker introuvable : lance Docker Desktop."; exit 1; }
docker info >/dev/null 2>&1 || { echo "❌ Docker ne répond pas : lance Docker Desktop, puis relance ce script."; exit 1; }

host_of() { sed -n 's/^DATABASE_URL=["]*[^@]*@\([^/]*\)\/.*/\1/p' "$1" | head -1; }
is_local() { case "$1" in 127.0.0.1:*|localhost:*) return 0;; *) return 1;; esac; }

# ─── 1. Mettre de côté les fichiers actuels ────────────────────────────────
SAVE="$HOME/akfc-env-sauvegarde-$(date +%Y%m%d-%H%M%S)"
moved=0
for f in .env apps/web/.env.local apps/web/.env; do
  [ -f "$f" ] || continue
  h=$(host_of "$f"); echo "  $f → base ${h:-(aucune)}"
  [ $moved -eq 0 ] && { mkdir -p "$SAVE"; chmod 700 "$SAVE"; }
  mkdir -p "$SAVE/$(dirname "$f")"; mv "$f" "$SAVE/$f"; moved=$((moved+1))
done
[ $moved -gt 0 ] && { chmod -R go-rwx "$SAVE"; echo "✓ $moved fichier(s) mis de côté dans $SAVE"; }

# ─── 2. La configuration de développement ──────────────────────────────────
cp .env.dev.example .env
cp .env.dev.example apps/web/.env.local
for f in .env apps/web/.env.local; do
  h=$(host_of "$f"); is_local "$h" || { echo "❌ $f vise $h : arrêt."; exit 1; }
done
echo "✓ .env et apps/web/.env.local visent la base locale ($(host_of .env))"

# ─── 3. Les services locaux ────────────────────────────────────────────────
pnpm -s dev:infra >/tmp/akfc_infra.log 2>&1 || { echo "❌ dev:infra a échoué :"; tail -5 /tmp/akfc_infra.log; exit 1; }
for i in $(seq 1 40); do
  docker compose -f docker-compose.dev.yml exec -T db pg_isready -U akfc -d akfc_db >/dev/null 2>&1 && break
  [ "$i" -eq 40 ] && { echo "❌ Postgres local ne répond pas"; exit 1; }
  sleep 1
done
echo "✓ Postgres, SeaweedFS et Mailpit locaux démarrés"

# ─── 4. Les migrations, sur la base LOCALE ─────────────────────────────────
is_local "$(host_of .env)" || { echo "❌ .env ne vise plus la base locale : arrêt."; exit 1; }
if ! pnpm -s db:migrate >/tmp/akfc_migrate.log 2>&1; then echo "❌ migrations :"; tail -8 /tmp/akfc_migrate.log; exit 1; fi
grep -E "migrations? (found|have been applied)|No pending|applied" /tmp/akfc_migrate.log | tail -2

# ─── 5. Une base vide reçoit les comptes de démonstration locaux ───────────
users=$(docker compose -f docker-compose.dev.yml exec -T db psql -U akfc -d akfc_db -tAc 'select count(*) from "User"' 2>/dev/null | tr -d '[:space:]' || echo "?")
if [ "$users" = "0" ]; then
  pnpm -s db:seed:dev >/tmp/akfc_seed.log 2>&1 && echo "✓ base vide : comptes de démo créés (admin@akfc.demo / sandbox-demo, en local seulement)" || { echo "❌ seed :"; tail -5 /tmp/akfc_seed.log; exit 1; }
else
  echo "✓ base locale : $users compte(s)"
fi
echo "Terminé. Relance pnpm dev. Les e-mails envoyés en dev arrivent sur http://localhost:8026"