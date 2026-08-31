#!/usr/bin/env bash
#
# AKFC — Sandbox recruteurs, PHASE 1 : briques d'infra (Postgres + MinIO + imgproxy).
#
# Crée `docker-compose.sandbox.yml` à la racine du repo, avec :
#   - postgres  : base de la sandbox (volume nommé, port 5433 pour ne pas heurter
#                 un postgres local existant) ;
#   - minio     : stockage S3 local — remplace R2 ET stocke les images ;
#   - minio-init: crée les buckets `media` et `documents` au démarrage ;
#   - imgproxy  : transformations d'images à la volée depuis MinIO — le "modèle
#                 Cloudinary" en local.
#
# L'APP AKFC n'est PAS encore dans ce compose (Phase 5). Ici on prouve juste que
# MinIO stocke et qu'imgproxy transforme. URLs imgproxy NON signées pour ce test
# (la signature KEY/SALT viendra en Phase 3, avec le driver).
#
# Ne touche à AUCUN fichier de l'app. Pas de commit.
#
# Usage : bash sandbox-phase1-infra.sh
#
set -euo pipefail

F="docker-compose.sandbox.yml"
[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
if [ -f "$F" ]; then
  echo "ERREUR: $F existe déjà — inspecte-le avant de l'écraser." >&2; exit 1
fi

cat > "$F" <<'YAML'
# ══════════════════════════════════════════════════════════════════════════
#  AKFC — Sandbox recruteurs (infra, Phase 1)
#
#  Briques de démo self-hosted :
#    postgres  — base (volume)
#    minio     — stockage S3 local (remplace R2 + stocke les images)
#    imgproxy  — transformations d'images à la volée (modèle Cloudinary)
#
#  L'app AKFC sera ajoutée en Phase 5. Reset de tout : `docker compose -f
#  docker-compose.sandbox.yml down -v`.
# ══════════════════════════════════════════════════════════════════════════
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: akfc
      POSTGRES_PASSWORD: sandbox
      POSTGRES_DB: akfc_db
    ports:
      - "5433:5432"        # 5433 hôte → évite de heurter un Postgres local
    volumes:
      - sandbox_pgdata:/var/lib/postgresql/data

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: sandbox
      MINIO_ROOT_PASSWORD: sandbox-secret
    ports:
      - "9000:9000"        # API S3
      - "9001:9001"        # Console web (http://localhost:9001)
    volumes:
      - sandbox_minio:/data

  # Crée les buckets une fois MinIO prêt, puis s'arrête.
  minio-init:
    image: minio/mc:latest
    depends_on:
      - minio
    entrypoint: >
      /bin/sh -c "
      until mc alias set local http://minio:9000 sandbox sandbox-secret; do
        echo 'attente minio...'; sleep 1;
      done;
      mc mb -p local/media || true;
      mc mb -p local/documents || true;
      mc anonymous set download local/media || true;
      echo 'buckets media + documents prets';
      "

  imgproxy:
    image: darthsim/imgproxy:latest
    depends_on:
      - minio
    environment:
      IMGPROXY_USE_S3: "true"
      IMGPROXY_S3_ENDPOINT: "http://minio:9000"
      IMGPROXY_S3_REGION: "us-east-1"
      AWS_ACCESS_KEY_ID: "sandbox"
      AWS_SECRET_ACCESS_KEY: "sandbox-secret"
      # Phase 1 : pas de KEY/SALT → URLs non signées (préfixe /insecure/).
      # La signature sera activée en Phase 3, avec le driver local.
      IMGPROXY_ENABLE_WEBP_DETECTION: "true"
    ports:
      - "8888:8080"        # http://localhost:8888

volumes:
  sandbox_pgdata:
  sandbox_minio:
YAML
echo "écrit  $F"

echo "validation de la syntaxe compose…"
if docker compose -f "$F" config >/dev/null 2>/tmp/akfc_compose.log; then
  echo "OK — compose valide."
else
  echo "compose KO :"; cat /tmp/akfc_compose.log; exit 1
fi

cat <<'EOF'

════════ TEST DE VÉRITÉ (prouve le modèle Cloudinary en local) ════════
1) Démarrer les briques :
     docker compose -f docker-compose.sandbox.yml up -d
     docker compose -f docker-compose.sandbox.yml logs minio-init   # doit dire "buckets ... prets"

2) Mettre une image de test dans le bucket `media` :
   - via la console MinIO : http://localhost:9001  (login sandbox / sandbox-secret)
     → bucket `media` → Upload → un JPG nommé par ex. `test.jpg`
   - OU en CLI :
     docker run --rm --network "$(basename "$PWD")_default" \
       -v "$PWD/UNE_IMAGE.jpg:/t.jpg" minio/mc:latest sh -c \
       "mc alias set l http://minio:9000 sandbox sandbox-secret && mc cp /t.jpg l/media/test.jpg"

3) Demander une transformation à imgproxy (URLs non signées, préfixe /insecure/) :
     # thumbnail 150x150 (= variante 'thumb')
     open   'http://localhost:8888/insecure/rs:fill:150:150/plain/s3://media/test.jpg'
     # largeur 300 (= 'small')
     open   'http://localhost:8888/insecure/rs:fit:300:0/plain/s3://media/test.jpg'
     # original
     open   'http://localhost:8888/insecure/plain/s3://media/test.jpg'

   (sous Linux remplace `open` par `xdg-open` ; ou colle l'URL dans le navigateur.)

Si les trois renvoient bien l'image aux bonnes tailles → le cœur de B-full est
prouvé : MinIO stocke, imgproxy transforme comme Cloudinary. On passe à la Phase 2
(abstraction MediaBackend).

Reset des briques : docker compose -f docker-compose.sandbox.yml down -v
EOF