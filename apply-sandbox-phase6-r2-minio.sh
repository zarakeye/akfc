#!/usr/bin/env bash
#
# AKFC — Sandbox, PHASE 6 : documents R2 → MinIO (path-style + presign public).
#
# Deux volets, comme le fix média de la Phase 5 :
#   1. r2/client.ts : `forcePathStyle` env-gated (MinIO l'exige ; R2 prod non
#      touché car R2_FORCE_PATH_STYLE absent → false) + un getR2PresignClient()
#      à endpoint PUBLIC (R2_PUBLIC_ENDPOINT, ex. localhost:9000) et checksum
#      désactivé, pour que le presigned PUT soit joignable par le NAVIGATEUR.
#   2. r2StorageAdapter : createUploadAuthorization presigne via ce client public
#      (les autres ops — Head/List/Delete — gardent le client interne).
#   3. compose sandbox : R2_FORCE_PATH_STYLE=true + R2_PUBLIC_ENDPOINT=localhost:9000.
#
# En PROD : R2_FORCE_PATH_STYLE absent → false (virtual-host, défaut R2) ;
# R2_PUBLIC_ENDPOINT absent → presign sur R2_ENDPOINT (public Cloudflare). Aucun
# changement de comportement.
#
# Backend + compose. typecheck backend + web.
#
# Usage : bash apply-sandbox-phase6-r2-minio.sh
#         AKFC_APPLY_ONLY=1 bash apply-sandbox-phase6-r2-minio.sh   (clone)
#
set -euo pipefail

CLIENT="packages/backend/src/modules/storage/adapters/r2/client.ts"
ADAPTER="packages/backend/src/modules/storage/adapters/r2/r2StorageAdapter.ts"
COMPOSE="docker-compose.sandbox.yml"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
for f in "$CLIENT" "$ADAPTER"; do [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }; done

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

# ── 1. client.ts : forcePathStyle + getR2PresignClient ───────────────────────
python3 - "$CLIENT" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

if "getR2PresignClient" in s:
    print("— client R2 déjà patché"); sys.exit(0)

# 1a. forcePathStyle env-gated dans getR2Client
old = (
    "  cached = new S3Client({\n"
    '    region: "auto",\n'
    '    endpoint: readEnv("R2_ENDPOINT"),\n'
    "    credentials: {\n"
    '      accessKeyId: readEnv("R2_ACCESS_KEY_ID"),\n'
    '      secretAccessKey: readEnv("R2_SECRET_ACCESS_KEY"),\n'
    "    },\n"
    "  });\n"
)
new = (
    "  cached = new S3Client({\n"
    '    region: "auto",\n'
    '    endpoint: readEnv("R2_ENDPOINT"),\n'
    "    // MinIO exige le path-style ; R2 (prod) ne définit pas la var → false.\n"
    '    forcePathStyle: process.env.R2_FORCE_PATH_STYLE === "true",\n'
    "    credentials: {\n"
    '      accessKeyId: readEnv("R2_ACCESS_KEY_ID"),\n'
    '      secretAccessKey: readEnv("R2_SECRET_ACCESS_KEY"),\n'
    "    },\n"
    "  });\n"
)
assert old in s, "ancre getR2Client config introuvable"
s = s.replace(old, new)

# 1b. getR2PresignClient (endpoint public + checksum désactivé)
anchor = (
    "export function getR2Bucket(): string {\n"
    '  return readEnv("R2_BUCKET");\n'
    "}\n"
)
assert anchor in s, "ancre getR2Bucket introuvable"
addition = (
    "\n"
    "/**\n"
    " * Client S3 dédié au PRESIGNING d'URLs consommées par le NAVIGATEUR.\n"
    " * En prod : R2_PUBLIC_ENDPOINT absent → endpoint R2 public (Cloudflare),\n"
    " * joignable par le client. En sandbox : R2_PUBLIC_ENDPOINT=localhost:9000\n"
    " * (car `minio:9000`, nom Docker, n'est pas résoluble côté navigateur).\n"
    " * Checksum SDK désactivé (CRC calculé sur corps vide → rejeté par MinIO).\n"
    " */\n"
    "let cachedPresign: S3Client | null = null;\n"
    "\n"
    "export function getR2PresignClient(): S3Client {\n"
    "  if (cachedPresign) return cachedPresign;\n"
    "  const publicEndpoint =\n"
    '    process.env.R2_PUBLIC_ENDPOINT ?? readEnv("R2_ENDPOINT");\n'
    "  cachedPresign = new S3Client({\n"
    '    region: "auto",\n'
    "    endpoint: publicEndpoint,\n"
    '    forcePathStyle: process.env.R2_FORCE_PATH_STYLE === "true",\n'
    '    requestChecksumCalculation: "WHEN_REQUIRED",\n'
    "    credentials: {\n"
    '      accessKeyId: readEnv("R2_ACCESS_KEY_ID"),\n'
    '      secretAccessKey: readEnv("R2_SECRET_ACCESS_KEY"),\n'
    "    },\n"
    "  });\n"
    "  return cachedPresign;\n"
    "}\n"
)
s = s.replace(anchor, anchor + addition)
p.write_text(s, encoding="utf-8")
print("✓ client.ts : forcePathStyle + getR2PresignClient")
PY

# ── 2. r2StorageAdapter : presign via client public ──────────────────────────
python3 - "$ADAPTER" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

# import
imp_old = 'import { getR2Client, getR2Bucket } from "@backend/modules/storage/adapters/r2/client";'
imp_new = 'import { getR2Client, getR2PresignClient, getR2Bucket } from "@backend/modules/storage/adapters/r2/client";'
if "getR2PresignClient" not in s:
    assert imp_old in s, "ancre import client r2 introuvable"
    s = s.replace(imp_old, imp_new)

# le s3 de createUploadAuthorization (unique : suivi de getR2Bucket puis expiresInSeconds)
use_old = (
    "      const s3 = getR2Client();\n"
    "      const Bucket = getR2Bucket();\n"
    "      const expiresInSeconds = 5 * 60;\n"
)
use_new = (
    "      const s3 = getR2PresignClient();\n"
    "      const Bucket = getR2Bucket();\n"
    "      const expiresInSeconds = 5 * 60;\n"
)
if use_new not in s:
    assert use_old in s, "ancre createUploadAuthorization (s3 presign) introuvable"
    s = s.replace(use_old, use_new)
p.write_text(s, encoding="utf-8")
print("✓ r2StorageAdapter : presign via client public")
PY

# ── 3. compose sandbox : env R2 path-style + endpoint public ─────────────────
if [ -f "$COMPOSE" ]; then
python3 - "$COMPOSE" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "R2_FORCE_PATH_STYLE" in s:
    print("— compose déjà patché"); sys.exit(0)
anchor = '      R2_BUCKET: "documents"\n'
if anchor not in s:
    print("!! ancre R2_BUCKET (compose) introuvable — ajoute à la main R2_FORCE_PATH_STYLE + R2_PUBLIC_ENDPOINT sous R2_*")
else:
    s = s.replace(
        anchor,
        anchor
        + '      R2_FORCE_PATH_STYLE: "true"\n'
        + '      R2_PUBLIC_ENDPOINT: "http://localhost:9000"\n',
    )
    p.write_text(s, encoding="utf-8")
    print("✓ compose : R2_FORCE_PATH_STYLE + R2_PUBLIC_ENDPOINT")
PY
fi

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck backend…"
if ! pnpm --filter backend typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck backend KO :"; grep -nE "error TS|getR2Presign|forcePathStyle" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "feat(sandbox): phase 6 — documents R2→MinIO (forcePathStyle + presign endpoint public)" \
  && echo "commit $(git rev-parse --short HEAD)"

cat <<'EOF'

════════ REBUILD SANDBOX (env compose modifié) ════════
  docker compose -f docker-compose.sandbox.yml up -d --build app
Puis, en membre sur /deposer, dépose un PDF → il doit partir en PUT vers
http://localhost:9000/documents/... et réussir (comme les images).
EOF