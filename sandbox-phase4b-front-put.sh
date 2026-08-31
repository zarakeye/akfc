#!/usr/bin/env bash
#
# AKFC — Sandbox, PHASE 4b : le front PUT vers MinIO en mode local.
#
# Dans la boucle d'upload image de DragNDropForm, en tête de chaque item :
# si la signature porte un `uploadUrl` (mode local, posé en 4a), on fait un PUT
# direct du fichier vers MinIO au lieu du POST Cloudinary. Pas de réponse
# Cloudinary → on fabrique l'objet `cloudinaryAsset` depuis le fichier + la
# signature (les champs width/height/duration/format sont optionnels).
#
# En mode cloudinary, `uploadUrl` est undefined → le POST habituel ne bouge pas.
#
# Front seul, 1 ancre, typecheck web.
#
# Usage : bash sandbox-phase4b-front-put.sh
#         AKFC_APPLY_ONLY=1 bash sandbox-phase4b-front-put.sh   (clone)
#
set -euo pipefail

F="apps/web/src/features/admin/library/forms/DragNDropForm.tsx"

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

if "sig.uploadUrl" in s:
    print("DragNDropForm : branche PUT déjà présente"); sys.exit(0)

old = (
    "        const sig = sigByItemId.get(item.id)!;\n"
    "        try {\n"
    "          const formData = new FormData();\n"
)
assert s.count(old) == 1, "ancre boucle upload (const sig / try / formData) introuvable"

put_branch = (
    "        const sig = sigByItemId.get(item.id)!;\n"
    "        try {\n"
    "          // Mode sandbox (MinIO) : la signature porte un `uploadUrl` presigné.\n"
    "          // PUT direct du fichier — pas de réponse Cloudinary, on fabrique\n"
    "          // l'asset depuis le fichier + la signature.\n"
    "          if (sig.uploadUrl) {\n"
    "            const putRes = await fetch(sig.uploadUrl, {\n"
    "              method: 'PUT',\n"
    "              headers: { 'Content-Type': item.file.type },\n"
    "              body: item.file,\n"
    "            });\n"
    "            if (!putRes.ok) {\n"
    "              const text = await putRes.text();\n"
    "              throw new Error(`MinIO HTTP ${putRes.status}: ${text.slice(0, 200)}`);\n"
    "            }\n"
    "            return {\n"
    "              ok: true,\n"
    "              itemId: item.id,\n"
    "              cloudinaryAsset: {\n"
    "                publicId: `${sig.folder}/${sig.publicId}`,\n"
    "                secureUrl: '',\n"
    "                resourceType: sig.resourceType,\n"
    "                format: item.file.type.split('/')[1],\n"
    "                bytes: item.file.size,\n"
    "              },\n"
    "            };\n"
    "          }\n"
    "          const formData = new FormData();\n"
)
s = s.replace(old, put_branch)
p.write_text(s, encoding="utf-8")
print("DragNDropForm : branche PUT MinIO ajoutée (si sig.uploadUrl)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|uploadUrl|Cannot find" /tmp/akfc_tc.log | head -20; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "feat(media): phase 4b — le front PUT vers MinIO quand la signature porte un uploadUrl (mode local)" \
  && echo "commit $(git rev-parse --short HEAD)"