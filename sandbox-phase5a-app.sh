#!/usr/bin/env bash
#
# AKFC — Sandbox, PHASE 5a : l'app dans le compose (câblage complet).
#
# Réécrit docker-compose.sandbox.yml en ajoutant, aux briques de la Phase 1 :
#   - migrator : applique les migrations sur la base sandbox (one-shot) ;
#   - app      : l'app AKFC (build standalone), en mode STORAGE_DRIVER=local ;
#   - mailpit  : faux SMTP + UI web (les mails de bienvenue sont capturés) ;
#   - imgproxy : signature ACTIVÉE (KEY/SALT), partagée avec l'app.
#
# Toutes les env sont injectées ici (self-contained). R2_* → MinIO (bucket
# `documents`) ; MEDIA_S3_* → MinIO (bucket `media`) ; CLOUDINARY_* = bidon.
#
# ⚠ Sauvegarde l'ancien compose (Phase 1) en .bak avant réécriture.
# Ne touche à AUCUN fichier de l'app. Pas de commit.
#
# Usage : bash sandbox-phase5a-app.sh
#
set -euo pipefail

F="docker-compose.sandbox.yml"
[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "Dockerfile" ]   || { echo "ERREUR: Dockerfile absent à la racine (attendu par le build)." >&2; exit 1; }

[ -f "$F" ] && cp "$F" "$F.bak" && echo "ancien compose sauvegardé : $F.bak"

cat > "$F" <<'YAML'
# ══════════════════════════════════════════════════════════════════════════
#  AKFC — Sandbox recruteurs (stack complète)
#
#  git clone … && docker compose -f docker-compose.sandbox.yml up -d --build
#    → app sur http://localhost:3010
#    → console MinIO   http://localhost:9001  (sandbox / sandbox-secret)
#    → Mailpit (mails) http://localhost:8025
#
#  Reset total : docker compose -f docker-compose.sandbox.yml down -v
#
#  ⚠ Valeurs de démo (secrets bidon) : ne JAMAIS réutiliser en prod.
# ══════════════════════════════════════════════════════════════════════════

x-imgproxy-signing: &imgproxy-signing
  IMGPROXY_KEY: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2"
  IMGPROXY_SALT: "b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3"

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: akfc
      POSTGRES_PASSWORD: sandbox
      POSTGRES_DB: akfc_db
    volumes:
      - sandbox_pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U akfc -d akfc_db"]
      interval: 3s
      timeout: 3s
      retries: 20

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: sandbox
      MINIO_ROOT_PASSWORD: sandbox-secret
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - sandbox_minio:/data

  minio-init:
    image: minio/mc:latest
    depends_on:
      - minio
    entrypoint: >
      /bin/sh -c "
      until mc alias set local http://minio:9000 sandbox sandbox-secret; do sleep 1; done;
      mc mb -p local/media || true;
      mc mb -p local/documents || true;
      mc anonymous set download local/media || true;
      echo 'buckets prets';
      "

  imgproxy:
    image: darthsim/imgproxy:latest
    depends_on:
      - minio
    environment:
      <<: *imgproxy-signing
      IMGPROXY_USE_S3: "true"
      IMGPROXY_S3_ENDPOINT: "http://minio:9000"
      IMGPROXY_S3_REGION: "us-east-1"
      AWS_ACCESS_KEY_ID: "sandbox"
      AWS_SECRET_ACCESS_KEY: "sandbox-secret"
      IMGPROXY_ENABLE_WEBP_DETECTION: "true"
      IMGPROXY_ENABLE_VIDEO_THUMBNAILS: "true"
    ports:
      - "8888:8080"

  mailpit:
    image: axllent/mailpit:latest
    ports:
      - "8025:8025"      # UI web des mails
    environment:
      MP_SMTP_AUTH_ACCEPT_ANY: "true"
      MP_SMTP_AUTH_ALLOW_INSECURE: "true"

  # Applique les migrations sur la base sandbox, puis s'arrête.
  migrator:
    build:
      context: .
      dockerfile: Dockerfile
      target: migrator
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: "postgresql://akfc:sandbox@postgres:5432/akfc_db?schema=public"
      DIRECT_DATABASE_URL: "postgresql://akfc:sandbox@postgres:5432/akfc_db?schema=public"
      PRISMA_CLIENT_ENGINE_TYPE: "library"

  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: runner
      args:
        NEXT_PUBLIC_APP_SHORT_NAME: "AKFC"
        NEXT_PUBLIC_APP_FULL_NAME: "AKFC — Sandbox de démonstration"
    depends_on:
      migrator:
        condition: service_completed_successfully
      minio-init:
        condition: service_started
      imgproxy:
        condition: service_started
      mailpit:
        condition: service_started
    ports:
      - "3010:3000"
    environment:
      NODE_ENV: "production"

      # ── Base ──
      DATABASE_URL: "postgresql://akfc:sandbox@postgres:5432/akfc_db?schema=public"
      DIRECT_DATABASE_URL: "postgresql://akfc:sandbox@postgres:5432/akfc_db?schema=public"
      PRISMA_CLIENT_ENGINE_TYPE: "library"

      # ── Auth / identité ──
      JWT_SECRET: "sandbox-demo-jwt-secret-change-me-please-0123456789"
      NEXTAUTH_URL: "http://localhost:3010"
      APP_URL: "http://localhost:3010"
      APP_SHORT_NAME: "AKFC"
      APP_FULL_NAME: "AKFC — Sandbox de démonstration"
      APP_SUPPORT_EMAIL: "contact@sandbox.local"
      APP_DOLMAIN: "sandbox.local"

      # ── Média local : MinIO + imgproxy ──
      STORAGE_DRIVER: "local"
      MEDIA_S3_ENDPOINT: "http://minio:9000"
      MEDIA_S3_ACCESS_KEY_ID: "sandbox"
      MEDIA_S3_SECRET_ACCESS_KEY: "sandbox-secret"
      MEDIA_S3_BUCKET: "media"
      IMGPROXY_URL: "http://imgproxy:8080"
      <<: *imgproxy-signing

      # ── R2 → MinIO (bucket documents). Path-style : cf. Phase 6. ──
      R2_ACCOUNT_ID: "sandbox"
      R2_ENDPOINT: "http://minio:9000"
      R2_ACCESS_KEY_ID: "sandbox"
      R2_SECRET_ACCESS_KEY: "sandbox-secret"
      R2_BUCKET: "documents"

      # ── Cloudinary : bidon (non utilisé en mode local) ──
      CLOUDINARY_CLOUD_NAME: "sandbox"
      CLOUDINARY_API_KEY: "000000000000000"
      CLOUDINARY_API_SECRET: "sandbox-unused"

      # ── SMTP → Mailpit (mails capturés, visibles sur :8025) ──
      SMTP_HOST: "mailpit"
      SMTP_PORT: "1025"
      SMTP_USER: "sandbox"
      SMTP_PASSWORD: "sandbox"
      SMTP_FROM_NOREPLY: "noreply@sandbox.local"

volumes:
  sandbox_pgdata:
  sandbox_minio:
YAML
echo "écrit  $F"

echo "validation compose…"
if docker compose -f "$F" config >/dev/null 2>/tmp/akfc_compose.log; then
  echo "OK — compose valide."
else
  echo "compose KO :"; cat /tmp/akfc_compose.log; exit 1
fi

cat <<'EOF'

════════ DÉMARRAGE (premier build ~ quelques minutes) ════════
  docker compose -f docker-compose.sandbox.yml up -d --build
  docker compose -f docker-compose.sandbox.yml logs -f app

Attendus :
  - migrator : "All migrations have been successfully applied" puis exited(0)
  - app      : "✓ Ready" sans erreur Prisma/env
  - http://localhost:3010  → l'app répond (page publique)
  - http://localhost:9001  → console MinIO (sandbox / sandbox-secret)
  - http://localhost:8025  → Mailpit (vide pour l'instant)

⚠ Pas encore de compte pour se connecter : c'est le rôle du SEED (Phase 5b) —
  admins + membres de démo + contenu + images d'exemple dans MinIO.

Si l'app crashe au boot (env manquante, connexion DB, client Prisma), colle-moi :
  docker compose -f docker-compose.sandbox.yml logs migrator | tail -20
  docker compose -f docker-compose.sandbox.yml logs app | tail -30
EOF