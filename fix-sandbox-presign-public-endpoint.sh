#!/usr/bin/env bash
#
# AKFC — Sandbox : corriger le presigned PUT (endpoint public + checksum).
#
# Le presigned PUT pointait vers `minio:9000` (nom Docker), non résoluble par le
# NAVIGATEUR. On presigne désormais avec un endpoint PUBLIC (localhost), via un
# client S3 dédié — les opérations backend (Head/List/Delete) gardent l'endpoint
# interne `minio:9000`. On désactive aussi le checksum SDK (CRC vide) que MinIO
# rejetterait.
#
#   1. minioClient.ts          : + getMediaPresignClient() (endpoint public +
#                                requestChecksumCalculation WHEN_REQUIRED).
#   2. createUploadSignatures  : la pré-étape presign utilise ce client public.
#   3. docker-compose.sandbox  : + MEDIA_S3_PUBLIC_ENDPOINT=http://localhost:9000.
#
# Typecheck backend + web. Nécessite un rebuild de l'app ensuite.
#
# Usage : bash fix-sandbox-presign-public-endpoint.sh
#         AKFC_APPLY_ONLY=1 bash fix-sandbox-presign-public-endpoint.sh   (clone)
#
set -euo pipefail

MINIO="packages/backend/src/modules/cloudinary/backends/minioClient.ts"
SIGN="packages/backend/src/modules/cloudinary/services/createUploadSignatures.service.ts"
COMPOSE="docker-compose.sandbox.yml"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
for f in "$MINIO" "$SIGN"; do [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }; done

# ── 1. minioClient : client de presigning à endpoint public ─────────────────
python3 - "$MINIO" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "getMediaPresignClient" in s:
    print("minioClient : getMediaPresignClient déjà présent"); sys.exit(0)
anchor = (
    'export function getMediaBucket(): string {\n'
    '  return readEnv("MEDIA_S3_BUCKET");\n'
    "}\n"
)
assert anchor in s, "ancre getMediaBucket introuvable"
addition = (
    "\n"
    "/**\n"
    " * Client S3 dédié au PRESIGNING d'URLs destinées au NAVIGATEUR.\n"
    " *\n"
    " * Il utilise l'endpoint PUBLIC (`MEDIA_S3_PUBLIC_ENDPOINT`, ex. localhost:9000)\n"
    " * car le presigned est consommé côté client — `minio:9000` (nom Docker) n'y\n"
    " * est pas résoluble. Le checksum SDK par défaut (CRC calculé sur un corps vide\n"
    " * au presign) est désactivé : le navigateur ne le recalcule pas et MinIO le\n"
    " * rejetterait. Fallback sur l'endpoint interne si le public n'est pas défini.\n"
    " */\n"
    "let cachedPresign: S3Client | null = null;\n"
    "\n"
    "export function getMediaPresignClient(): S3Client {\n"
    "  if (cachedPresign) return cachedPresign;\n"
    "  const publicEndpoint =\n"
    '    process.env.MEDIA_S3_PUBLIC_ENDPOINT ?? readEnv("MEDIA_S3_ENDPOINT");\n'
    "  cachedPresign = new S3Client({\n"
    '    region: "us-east-1",\n'
    "    endpoint: publicEndpoint,\n"
    "    forcePathStyle: true,\n"
    '    requestChecksumCalculation: "WHEN_REQUIRED",\n'
    "    credentials: {\n"
    '      accessKeyId: readEnv("MEDIA_S3_ACCESS_KEY_ID"),\n'
    '      secretAccessKey: readEnv("MEDIA_S3_SECRET_ACCESS_KEY"),\n'
    "    },\n"
    "  });\n"
    "  return cachedPresign;\n"
    "}\n"
)
s = s.replace(anchor, anchor + addition)
p.write_text(s, encoding="utf-8")
print("minioClient : getMediaPresignClient ajouté")
PY

# ── 2. createUploadSignatures : presigner via le client public ──────────────
python3 - "$SIGN" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

if "getMediaPresignClient" in s:
    print("createUploadSignatures : déjà sur le client public"); sys.exit(0)

imp_old = (
    "import {\n"
    "  getMediaS3Client,\n"
    "  getMediaBucket,\n"
    '} from "@backend/modules/cloudinary/backends/minioClient";\n'
)
imp_new = (
    "import {\n"
    "  getMediaPresignClient,\n"
    "  getMediaBucket,\n"
    '} from "@backend/modules/cloudinary/backends/minioClient";\n'
)
assert imp_old in s, "ancre import minioClient introuvable"
s = s.replace(imp_old, imp_new)

use_old = "    const s3 = getMediaS3Client();\n"
assert use_old in s, "ancre `const s3 = getMediaS3Client()` introuvable"
s = s.replace(use_old, "    const s3 = getMediaPresignClient();\n")

p.write_text(s, encoding="utf-8")
print("createUploadSignatures : presign via client public")
PY

# ── 3. compose : endpoint public ─────────────────────────────────────────────
if [ -f "$COMPOSE" ]; then
python3 - "$COMPOSE" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "MEDIA_S3_PUBLIC_ENDPOINT" in s:
    print("compose : MEDIA_S3_PUBLIC_ENDPOINT déjà présent"); sys.exit(0)
anchor = '      MEDIA_S3_ENDPOINT: "http://minio:9000"\n'
assert anchor in s, "ancre MEDIA_S3_ENDPOINT (compose) introuvable"
s = s.replace(
    anchor,
    anchor + '      MEDIA_S3_PUBLIC_ENDPOINT: "http://localhost:9000"\n',
)
p.write_text(s, encoding="utf-8")
print("compose : MEDIA_S3_PUBLIC_ENDPOINT ajouté")
PY
fi

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck backend…"
if ! pnpm --filter backend typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck backend KO :"; grep -nE "error TS|Cannot find|requestChecksum" /tmp/akfc_tc.log | head -20; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|Cannot find" /tmp/akfc_tc.log | head -20; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "fix(sandbox): presigned PUT via endpoint public (localhost) + checksum désactivé" \
  && echo "commit $(git rev-parse --short HEAD)"

cat <<'EOF'

════════ REBUILD DE L'APP ════════
Le code backend a changé → rebuild de l'app :
  docker compose -f docker-compose.sandbox.yml up -d --build app
  docker compose -f docker-compose.sandbox.yml logs -f app

Puis re-teste l'upload d'image en admin. Le PUT doit maintenant partir vers
http://localhost:9000/media/... (résoluble par le navigateur) et réussir.
EOF