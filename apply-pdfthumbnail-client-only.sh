#!/usr/bin/env bash
#
# AKFC — Corrige le crash SSR "DOMMatrix is not defined" (uploader 500).
#
# `PdfThumbnail` importe react-pdf/pdfjs, qui évalue `new DOMMatrix()` (API
# NAVIGATEUR) au chargement du module. Next évalue le graphe des composants
# clients pendant le SSR → crash côté Node sur /dashboard/library/add.
#
# Fix : un wrapper CLIENT-ONLY (`next/dynamic` + `ssr: false`) qui diffère
# l'import de pdf.js au navigateur. Les deux consommateurs (DragNDropForm,
# CommonRepositoryUpload) importent le wrapper au lieu du composant direct —
# ils ne changent QUE le chemin d'import (même nom `PdfThumbnail`).
#
# Périmètre : FRONT (1 nouveau fichier + 2 imports repointés). Un typecheck.
# Usage : bash apply-pdfthumbnail-client-only.sh
#
set -euo pipefail

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
WRAP="apps/web/src/features/common-repository/PdfThumbnailClient.tsx"
D="apps/web/src/features/admin/library/forms/DragNDropForm.tsx"
C="apps/web/src/features/common-repository/CommonRepositoryUpload.tsx"
for f in "$D" "$C" "apps/web/src/features/common-repository/PdfThumbnail.tsx"; do
  [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }
done
if [ -f "$WRAP" ]; then echo "— déjà appliqué (PdfThumbnailClient.tsx existe)"; exit 0; fi
if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

cat > "$WRAP" <<'EOF'
"use client";

import dynamic from "next/dynamic";

/**
 * Chargement CLIENT-ONLY de PdfThumbnail.
 *
 * react-pdf/pdfjs évalue `new DOMMatrix()` (API navigateur) au chargement du
 * module — indisponible côté Node, donc crash pendant le SSR. On diffère donc
 * son import au navigateur (`ssr: false`). Même nom ré-exporté : les
 * consommateurs ne changent que le chemin d'import.
 */
export const PdfThumbnail = dynamic(
  () => import("./PdfThumbnail").then((m) => m.PdfThumbnail),
  { ssr: false },
);
EOF
echo "  créé  $WRAP"

python3 - "$D" "$C" <<'PY'
import sys, pathlib

def repoint(path, old, new, label):
    p = pathlib.Path(path)
    s = p.read_text(encoding="utf-8")
    n = s.count(old)
    assert n == 1, f"{label} : ancre attendue 1, trouvée {n}"
    p.write_text(s.replace(old, new), encoding="utf-8")
    print(f"  ok  {path}")

D, C = sys.argv[1], sys.argv[2]
repoint(D,
  "import { PdfThumbnail } from '@features/common-repository/PdfThumbnail';",
  "import { PdfThumbnail } from '@features/common-repository/PdfThumbnailClient';",
  "DragNDropForm")
repoint(C,
  'import { PdfThumbnail } from "@features/common-repository/PdfThumbnail";',
  'import { PdfThumbnail } from "@features/common-repository/PdfThumbnailClient";',
  "CommonRepositoryUpload")
print("Repointé.")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY — pas de typecheck ni commit"; exit 0; fi
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then TC="check"; else TC="typecheck"; fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"
git add -A
if git commit -m "fix(uploader): PdfThumbnail chargé client-only (ssr:false) — fin du crash SSR DOMMatrix" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1; fi