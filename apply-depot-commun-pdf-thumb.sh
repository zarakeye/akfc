#!/usr/bin/env bash
#
# AKFC — Dépôt commun : vignette d'aperçu pour les PDF (page 1 via react-pdf).
#
# L'uploader admin n'affiche qu'une icône pour les PDF ; ici on fait mieux : un
# vrai aperçu de la 1re page, avec react-pdf (déjà installé, worker self-hosté
# /pdf.worker.min.mjs, canvas-only comme PdfViewer → pas de CSS à importer).
#
#   - features/common-repository/PdfThumbnail.tsx : composant d'aperçu.
#   - CommonRepositoryUpload : branche PDF → <PdfThumbnail/> au lieu de l'icône.
#
# Front seul, typecheck web.
#
# Usage : bash apply-depot-commun-pdf-thumb.sh
#         AKFC_APPLY_ONLY=1 bash apply-depot-commun-pdf-thumb.sh   (clone)
#
set -euo pipefail

THUMB="apps/web/src/features/common-repository/PdfThumbnail.tsx"
COMP="apps/web/src/features/common-repository/CommonRepositoryUpload.tsx"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$COMP" ]        || { echo "ERREUR: $COMP introuvable (applique A3 + vignettes)." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

# ── 1. Composant d'aperçu PDF ────────────────────────────────────────────────
cat > "$THUMB" <<'TSX'
"use client";

import { JSX } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// Même worker self-hosté que PdfViewer (version alignée sur pdfjs-dist).
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

/**
 * Vignette d'un PDF : rend la première page en canvas (sans couche texte ni
 * annotations → pas de CSS react-pdf à importer). Le conteneur parent clippe.
 */
export function PdfThumbnail({
  file,
  width = 128,
}: {
  file: File;
  width?: number;
}): JSX.Element {
  return (
    <Document
      file={file}
      loading={
        <span className="flex h-full w-full items-center justify-center text-2xl">
          📕
        </span>
      }
      error={
        <span className="flex h-full w-full items-center justify-center text-2xl">
          📕
        </span>
      }
    >
      <Page
        pageNumber={1}
        width={width}
        renderTextLayer={false}
        renderAnnotationLayer={false}
      />
    </Document>
  );
}
TSX
echo "créé  $THUMB"

# ── 2. Brancher la vignette PDF dans la page membre ─────────────────────────
python3 - "$COMP" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

if "PdfThumbnail" in s:
    print("— PdfThumbnail déjà branché"); sys.exit(0)

# 2a. import (après l'import du Cropper)
imp_anchor = 'import Cropper from "@features/gallery-crop/components/Cropper";\n'
assert imp_anchor in s, "ancre import Cropper introuvable"
s = s.replace(
    imp_anchor,
    imp_anchor
    + 'import { PdfThumbnail } from "@features/common-repository/PdfThumbnail";\n',
)

# 2b. branche PDF dans le rendu des vignettes
old = (
    "                    onClick={() => !busy && setItemToCrop(it)}\n"
    "                  />\n"
    "                ) : (\n"
    '                  <div className="flex h-full w-full flex-col items-center justify-center p-2 text-center">\n'
)
new = (
    "                    onClick={() => !busy && setItemToCrop(it)}\n"
    "                  />\n"
    '                ) : it.file.type === "application/pdf" ? (\n'
    "                  <PdfThumbnail file={it.file} width={128} />\n"
    "                ) : (\n"
    '                  <div className="flex h-full w-full flex-col items-center justify-center p-2 text-center">\n'
)
assert old in s, "ancre rendu vignette (branche non-image) introuvable"
s = s.replace(old, new)

p.write_text(s, encoding="utf-8")
print("✓ page membre : aperçu PDF branché")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|react-pdf|PdfThumbnail" /tmp/akfc_tc.log | head; tail -6 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "feat(depot-commun): vignette d'aperçu PDF (page 1, react-pdf) sur la page membre" \
  && echo "commit $(git rev-parse --short HEAD)"