#!/usr/bin/env bash
# Le site local sur la copie ANONYMISÉE de la production, déjà sur ce Mac :
#   base   « akfc-db-local »      (setup-local-db.sh)  — disciplines, pages, comptes @akfc.demo…
#   photos SeaweedFS de docker-compose.dev.yml, bucket akfc-dev — visages de substitution
#          (recopiées de l'ancien conteneur MinIO « akfc-storage-local » par akfc-recopier-stockage-dev.sh)
#   e-mails : Mailpit de docker-compose.dev.yml (http://localhost:8026), rien ne part sur internet.
# Modifie .env et apps/web/.env.local (copie de sauvegarde à côté de chacun). Aucun secret affiché,
# rien d'écrit sur le serveur, aucun commit.
# Usage (racine du repo, pnpm dev arrêté) : bash revenir-base-locale.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] && [ -f .env.dev.example ] || { echo "À lancer à la racine du repo."; exit 1; }
if pgrep -f "next dev" >/dev/null 2>&1; then echo "❌ pnpm dev tourne : arrête-le (Ctrl+C), puis relance ce script."; exit 1; fi
docker info >/dev/null 2>&1 || { echo "❌ Docker ne répond pas : lance Docker Desktop."; exit 1; }

DB=akfc-db-local
docker container inspect "$DB" >/dev/null 2>&1 || { echo "❌ pas de conteneur $DB sur ce Mac : lance d'abord setup-local-db.sh."; exit 1; }
envof() { docker inspect -f '{{range .Config.Env}}{{println .}}{{end}}' "$1" | sed -n "s/^$2=//p"; }
portof() { docker inspect -f "{{(index (index .HostConfig.PortBindings \"$2/tcp\") 0).HostPort}}" "$1"; }

# ─── 1. Les conteneurs ─────────────────────────────────────────────────────
docker start "$DB" >/dev/null
for _ in $(seq 1 30); do docker exec "$DB" pg_isready -U postgres -q 2>/dev/null && break; sleep 1; done
docker exec "$DB" pg_isready -U postgres -q || { echo "❌ $DB ne répond pas"; exit 1; }
PG_URL="postgresql://postgres:$(envof "$DB" POSTGRES_PASSWORD)@127.0.0.1:$(portof "$DB" 5432)/akfc_db?schema=public"
echo "✓ base $DB : 127.0.0.1:$(portof "$DB" 5432)"
# Le Postgres de docker-compose.dev.yml ne sert pas ici (la base est $DB) ; son stockage et Mailpit, si.
# Identifiants du stockage : ceux de docker-compose.dev.yml, publics par nature (dev seulement).
docker compose -f docker-compose.dev.yml stop db >/dev/null 2>&1 || true
docker compose -f docker-compose.dev.yml up -d --wait storage mail >/dev/null 2>&1 || { echo "❌ SeaweedFS ou Mailpit ne démarre pas"; exit 1; }
R2E="http://127.0.0.1:9200"; R2K="akfc-dev"; R2S="akfc-dev-secret"
echo "✓ photos : SeaweedFS $R2E, bucket akfc-dev"

# ─── 2. Les deux fichiers .env ─────────────────────────────────────────────
STAMP=$(date +%Y%m%d-%H%M%S)
for f in .env apps/web/.env.local; do
  [ -f "$f" ] || cp .env.dev.example "$f"
  cp -p "$f" "$f.avant-base-locale-$STAMP"
  PG="$PG_URL" R2E="$R2E" R2K="${R2K:-}" R2S="${R2S:-}" python3 - "$f" <<'PY'
import os, sys
path = sys.argv[1]
want = {"DATABASE_URL": os.environ["PG"], "DIRECT_DATABASE_URL": os.environ["PG"], "TICKET_IMAP_HOST": ""}
if os.environ["R2E"]:
    want.update({"R2_ENDPOINT": os.environ["R2E"], "R2_BUCKET": "akfc-dev", "R2_ACCESS_KEY_ID": os.environ["R2K"],
                 "R2_SECRET_ACCESS_KEY": os.environ["R2S"], "R2_FORCE_PATH_STYLE": "true"})
out, seen = [], set()
for l in open(path, encoding="utf-8").read().splitlines():
    k = l.split("=", 1)[0].strip()
    if k == "R2_PUBLIC_ENDPOINT":
        continue
    if k in want:
        out.append(f'{k}="{want[k]}"'); seen.add(k)
    else:
        out.append(l)
out += [f'{k}="{v}"' for k, v in want.items() if k not in seen]
open(path, "w", encoding="utf-8").write("\n".join(out) + "\n")
PY
  chmod 600 "$f" "$f.avant-base-locale-$STAMP"
done
for f in .env apps/web/.env.local; do
  h=$(sed -n 's/^DATABASE_URL=["]*[^@]*@\([^/]*\)\/.*/\1/p' "$f" | head -1)
  case "$h" in 127.0.0.1:*) ;; *) echo "❌ $f vise $h : arrêt."; exit 1;; esac
  s=$(sed -n 's/^SMTP_HOST=["]*\([^"]*\).*/\1/p' "$f" | head -1)
  [ "$s" = "127.0.0.1" ] || { echo "❌ $f : SMTP_HOST n'est pas Mailpit ($s) : arrêt."; exit 1; }
done
echo "✓ .env et apps/web/.env.local : base, photos et e-mails locaux (sauvegardes *.avant-base-locale-$STAMP)"

# ─── 3. Migrations sur la base locale, puis contrôle ───────────────────────
if ! pnpm -s db:migrate >/tmp/akfc_migrate.log 2>&1; then echo "❌ migrations :"; tail -8 /tmp/akfc_migrate.log; exit 1; fi
grep -E "have been applied|No pending" /tmp/akfc_migrate.log | tail -1
n=$(docker exec "$DB" psql -U postgres -d akfc_db -tAc 'select count(*) from "Discipline" where "publicationDate" <= now()' | tr -d '[:space:]')
echo "✓ disciplines publiées dans la base locale : $n"
echo "Terminé. Relance pnpm dev."