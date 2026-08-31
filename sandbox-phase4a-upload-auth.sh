#!/usr/bin/env bash
#
# AKFC — Sandbox, PHASE 4a : autorisation d'upload = presigned PUT MinIO (local).
#
# En mode `STORAGE_DRIVER=local`, `createUploadSignatures` renvoie EN PLUS un
# `uploadUrl` : une URL presigned PUT vers MinIO, clé = publicId complet
# (extensionless, cohérent avec la livraison Phase 3). En mode cloudinary,
# `uploadUrl` reste `undefined` → le front garde son POST signé habituel.
#
# Ainsi le front (Phase 4b) n'a qu'à faire : `uploadUrl ? PUT(file) : POST(signé)`.
#
# Backend seul (createUploadSignatures). Toujours cloudinary par défaut → aucun
# impact prod. Typecheck backend + web (le type de retour est inféré, consommé au front).
#
# Usage : bash sandbox-phase4a-upload-auth.sh
#         AKFC_APPLY_ONLY=1 bash sandbox-phase4a-upload-auth.sh   (clone)
#
set -euo pipefail

F="packages/backend/src/modules/cloudinary/services/createUploadSignatures.service.ts"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$F" ]           || { echo "ERREUR: $F introuvable." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

if "uploadUrl" in s and "getSignedUrl" in s:
    print("createUploadSignatures : déjà patché (uploadUrl)"); sys.exit(0)

# 1. imports (après le dernier import de types upload)
imp_anchor = (
    "import type {\n"
    "  UploadDestination,\n"
    "  UploadAssetRequest,\n"
    '} from "@contracts/cloudinary/upload.types";\n'
)
assert imp_anchor in s, "ancre imports upload.types introuvable"
s = s.replace(
    imp_anchor,
    imp_anchor
    + 'import { PutObjectCommand } from "@aws-sdk/client-s3";\n'
    + 'import { getSignedUrl } from "@aws-sdk/s3-request-presigner";\n'
    + "import {\n"
    + "  getMediaS3Client,\n"
    + "  getMediaBucket,\n"
    + '} from "@backend/modules/cloudinary/backends/minioClient";\n',
)

# 2. pré-étape : presign MinIO si driver local, AVANT le map
map_anchor = "  return assets.map((asset) => {\n"
assert s.count(map_anchor) == 1, "ancre `return assets.map` introuvable"
prestep = (
    "  // Mode sandbox (STORAGE_DRIVER=local) : on presign un PUT MinIO par asset\n"
    "  // (clé = publicId complet, extensionless — cohérent avec la livraison).\n"
    "  // En cloudinary, cette map reste vide → `uploadUrl` restera undefined.\n"
    "  const localUploadUrls = new Map<string, string>();\n"
    '  if (process.env.STORAGE_DRIVER === "local") {\n'
    "    const s3 = getMediaS3Client();\n"
    "    const bucket = getMediaBucket();\n"
    "    await Promise.all(\n"
    "      assets.map(async (asset) => {\n"
    "        const full = `${folder}/${safeBaseName(asset.fileName)}`;\n"
    "        const url = await getSignedUrl(\n"
    "          s3,\n"
    "          new PutObjectCommand({\n"
    "            Bucket: bucket,\n"
    "            Key: full,\n"
    "            ContentType: asset.mimeType,\n"
    "          }),\n"
    "          { expiresIn: 5 * 60 },\n"
    "        );\n"
    "        localUploadUrls.set(asset.fileName, url);\n"
    "      }),\n"
    "    );\n"
    "  }\n"
    "\n"
)
s = s.replace(map_anchor, prestep + map_anchor)

# 3. champ uploadUrl dans l'objet renvoyé
ret_anchor = "      cloudName: process.env.CLOUDINARY_CLOUD_NAME!,\n"
assert s.count(ret_anchor) == 1, "ancre cloudName (objet renvoyé) introuvable"
s = s.replace(
    ret_anchor,
    ret_anchor
    + "      // Présent seulement en mode local → le front PUT au lieu de POST.\n"
    + "      uploadUrl: localUploadUrls.get(asset.fileName),\n",
)

p.write_text(s, encoding="utf-8")
print("createUploadSignatures : presigned PUT MinIO ajouté (mode local)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck backend…"
if ! pnpm --filter backend typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck backend KO :"; grep -nE "error TS|Cannot find" /tmp/akfc_tc.log | head -20; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|Cannot find" /tmp/akfc_tc.log | head -20; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "feat(media): phase 4a — createUploadSignatures renvoie un presigned PUT MinIO en mode local" \
  && echo "commit $(git rev-parse --short HEAD)"