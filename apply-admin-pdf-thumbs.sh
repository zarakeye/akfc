#!/usr/bin/env bash
#
# AKFC — Backport : aperçu PDF (PdfThumbnail) dans l'uploader ADMIN.
#
# L'admin n'affichait qu'une icône pour les PDF. On y branche le même
# PdfThumbnail (aperçu page 1) que la page membre, dans la branche non-image du
# rendu — sans toucher aux overlays de statut ni au reste.
#
# Front seul, 1 import + 1 branche, typecheck web.
#
# Usage : bash apply-admin-pdf-thumb.sh
#         AKFC_APPLY_ONLY=1 bash apply-admin-pdf-thumb.sh   (clone)
#
set -euo pipefail

F="apps/web/src/features/admin/library/forms/DragNDropForm.tsx"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$F" ]           || { echo "ERREUR: $F introuvable." >&2; exit 1; }
[ -f "apps/web/src/features/common-repository/PdfThumbnail.tsx" ] || {
  echo "ERREUR: PdfThumbnail.tsx absent — applique d'abord apply-depot-commun-pdf-thumb.sh." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

if "PdfThumbnail" in s:
    print("— PdfThumbnail déjà branché dans l'admin"); sys.exit(0)

# 1. import (après l'import du Cropper — style guillemets simples chez l'admin)
imp_anchor = "import Cropper from '@features/gallery-crop/components/Cropper';\n"
assert imp_anchor in s, "ancre import Cropper (admin) introuvable"
s = s.replace(
    imp_anchor,
    imp_anchor
    + "import { PdfThumbnail } from '@features/common-repository/PdfThumbnail';\n",
)

# 2. branche PDF entre le <img> (fin) et le <div> icône
old = (
    "                  />\n"
    "                ) : (\n"
    '                  <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">\n'
    '                    <span className="text-3xl mb-1">\n'
    "                      {iconForMime(it.file.type)}\n"
)
new = (
    "                  />\n"
    "                ) : it.file.type === 'application/pdf' ? (\n"
    "                  <PdfThumbnail file={it.file} width={128} />\n"
    "                ) : (\n"
    '                  <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">\n'
    '                    <span className="text-3xl mb-1">\n'
    "                      {iconForMime(it.file.type)}\n"
)
assert old in s, "ancre rendu vignette (admin, branche non-image) introuvable"
s = s.replace(old, new)

p.write_text(s, encoding="utf-8")
print("✓ admin : aperçu PDF branché")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|PdfThumbnail" /tmp/akfc_tc.log | head; tail -6 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "feat(library): aperçu PDF (page 1) dans l'uploader admin (parité avec la page membre)" \
  && echo "commit $(git rev-parse --short HEAD)"