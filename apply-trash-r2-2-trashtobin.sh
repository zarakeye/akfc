#!/usr/bin/env bash
#
# AKFC — Chantier corbeille R2-aware — INCRÉMENT 2/5 : trashToBin (fichiers).
#
# Rend trashToBin capable de jeter un FICHIER R2 (PDF/docs), pas seulement
# Cloudinary. Prérequis : incrément 1 (r2TrashOps).
#
#  - nouveau helper resolveFileBackend(path) : sonde Cloudinary (getAssetInfo)
#    puis repli R2 (r2GetInfo) → dit quel backend héberge le fichier ;
#  - detectKind : repli R2 (r2Exists) après l'échec Cloudinary → "file" ;
#  - agrégats (taille/date/mediaKind) : branche R2 (mediaKind="document") ;
#  - déplacement : R2 → r2MoveFile(normalized, storageRoot) ; Cloudinary inchangé.
#
# PARITÉ conservée : MediaAsset n'est PAS touché (comme le flux Cloudinary).
# Le cas DOSSIER contenant des fichiers R2 n'est PAS couvert ici (incrément
# ultérieur) — ce script cible le cas FICHIER (ton besoin : jeter un PDF).
#
# Usage : bash apply-trash-r2-2-trashtobin.sh
#         AKFC_APPLY_ONLY=1 bash apply-trash-r2-2-trashtobin.sh   (clone)
#
set -euo pipefail
F="packages/backend/src/modules/trash/services/trashToBin.service.ts"
[ -f package.json ] || { echo "ERREUR: racine du repo requise." >&2; exit 1; }
[ -f "$F" ] || { echo "ERREUR: $F introuvable." >&2; exit 1; }
if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  B="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  [ "$B" = "main" ] || [ "$B" = "master" ] && { echo "NOTE: sur '$B' (Ctrl-C pour annuler)."; sleep 2; }
fi

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "resolveFileBackend" in s:
    print("déjà à jour"); sys.exit(0)

def sub(old, new, label):
    assert s.count(old) == 1, f"ancre introuvable/multiple: {label}"
    return s.replace(old, new, 1)

# 1) import r2TrashOps
s = sub(
'import { invalidate as invalidateResourcesCache } from "@backend/modules/cloudinary/cache/resourcesCache";\n',
'import { invalidate as invalidateResourcesCache } from "@backend/modules/cloudinary/cache/resourcesCache";\n'
'import {\n'
'  r2Exists,\n'
'  r2GetInfo,\n'
'  r2MoveFile,\n'
'} from "@backend/modules/trash/services/r2TrashOps";\n',
"import r2TrashOps")

# 2) helper resolveFileBackend, prepend avant detectKind
s = sub(
'async function detectKind(params: { prisma: PrismaClient; appRoot: string; fullPath: string }):\n'
'  Promise<"folder" | "file"> {\n',
'/**\n'
' * Backend physique d\'un FICHIER : Cloudinary (images/vidéos) ou R2 (PDF/docs).\n'
' * Sonde Cloudinary d\'abord (getAssetInfo), repli R2 (r2GetInfo). Throw si ni\n'
' * l\'un ni l\'autre ne connaît le chemin.\n'
' */\n'
'async function resolveFileBackend(\n'
'  path: string,\n'
'): Promise<\n'
'  | { backend: "cloudinary"; info: Awaited<ReturnType<typeof getAssetInfo>> }\n'
'  | { backend: "r2"; info: { bytes?: number; createdAt?: Date } }\n'
'> {\n'
'  try {\n'
'    const info = await getAssetInfo(path);\n'
'    return { backend: "cloudinary", info };\n'
'  } catch {\n'
'    const r2 = await r2GetInfo(path);\n'
'    if (r2) return { backend: "r2", info: r2 };\n'
'    throw new Error(`Asset introuvable (ni Cloudinary ni R2) : ${path}`);\n'
'  }\n'
'}\n'
'\n'
'async function detectKind(params: { prisma: PrismaClient; appRoot: string; fullPath: string }):\n'
'  Promise<"folder" | "file"> {\n',
"helper resolveFileBackend")

# 3) detectKind : repli R2
s = sub(
'  // 2) Si Cloudinary connaît la ressource exacte => file.\n'
'  try {\n'
'    await getAssetInfo(p);\n'
'    return "file";\n'
'  } catch {\n'
'    // continue\n'
'  }\n'
'\n'
'  // 3) Si on a au moins un asset sous prefix => folder.\n',
'  // 2) Si Cloudinary connaît la ressource exacte => file.\n'
'  try {\n'
'    await getAssetInfo(p);\n'
'    return "file";\n'
'  } catch {\n'
'    // continue\n'
'  }\n'
'\n'
'  // 2-bis) Sinon, si R2 connaît l\'objet exact => file (PDF/documents).\n'
'  if (await r2Exists(p)) return "file";\n'
'\n'
'  // 3) Si on a au moins un asset sous prefix => folder.\n',
"detectKind R2 fallback")

# 4) agrégats (file)
s = sub(
'    if (source.kind === "file") {\n'
'      const info = await getAssetInfo(normalized);\n'
'      sizeBytes = typeof info.bytes === "number" ? BigInt(info.bytes) : undefined;\n'
'      cloudinaryCreatedAt = info.created_at ? new Date(info.created_at) : undefined;\n'
'      // mediaKind: dérivé du resource_type Cloudinary (image|video|raw → image|video|document)\n'
'      mediaKind = mediaKindFromCloudinaryResourceType(info.resource_type);\n'
'    } else {\n',
'    if (source.kind === "file") {\n'
'      const resolved = await resolveFileBackend(normalized);\n'
'      if (resolved.backend === "cloudinary") {\n'
'        const info = resolved.info;\n'
'        sizeBytes = typeof info.bytes === "number" ? BigInt(info.bytes) : undefined;\n'
'        cloudinaryCreatedAt = info.created_at ? new Date(info.created_at) : undefined;\n'
'        // mediaKind: dérivé du resource_type Cloudinary (image|video|raw → image|video|document)\n'
'        mediaKind = mediaKindFromCloudinaryResourceType(info.resource_type);\n'
'      } else {\n'
'        // R2 : PDF/documents. Pas de resource_type Cloudinary.\n'
'        sizeBytes =\n'
'          typeof resolved.info.bytes === "number"\n'
'            ? BigInt(resolved.info.bytes)\n'
'            : undefined;\n'
'        cloudinaryCreatedAt = resolved.info.createdAt;\n'
'        mediaKind = "document";\n'
'      }\n'
'    } else {\n',
"agrégats file R2")

# 5) déplacement (file)
s = sub(
'    // 3) Déplacement Cloudinary vers storageRoot\n'
'    if (source.kind === "file") {\n'
'      const info = await getAssetInfo(normalized);\n'
'      await renameAsset(normalized, storageRoot, info.resource_type);\n'
'    } else {\n',
'    // 3) Déplacement physique vers storageRoot (Cloudinary ou R2)\n'
'    if (source.kind === "file") {\n'
'      const resolved = await resolveFileBackend(normalized);\n'
'      if (resolved.backend === "cloudinary") {\n'
'        await renameAsset(normalized, storageRoot, resolved.info.resource_type);\n'
'      } else {\n'
'        await r2MoveFile(normalized, storageRoot);\n'
'      }\n'
'    } else {\n',
"déplacement file R2")

p.write_text(s, encoding="utf-8")
print("trashToBin R2-aware (fichiers) appliqué")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY — pas de typecheck/commit"; exit 0; fi
echo "typecheck backend…"
pnpm --filter backend typecheck > /tmp/tc.log 2>&1 || { echo "KO:"; grep -nE "error TS" /tmp/tc.log | head; tail -6 /tmp/tc.log; exit 1; }
echo OK
[ -z "$(git status --porcelain)" ] && { echo "rien à committer"; exit 0; }
git add -A && git commit -m "feat(trash): trashToBin gère les fichiers R2 (incrément 2/5)" && echo "commit $(git rev-parse --short HEAD)"