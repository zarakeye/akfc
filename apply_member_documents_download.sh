#!/usr/bin/env bash
#
# AKFC — Documents membres : mode téléchargement de la route de livraison.
#
# Ajoute `?download=1` à /api/media/member-document/[id] : sert le fichier en
# PIÈCE JOINTE avec le nom humain (title ?? displayName ?? originalFileName,
# extension du format), au lieu de l'aperçu inline. Sans le paramètre :
# comportement inchangé (inline). Le nom est encodé UTF-8 (accents/espaces).
#
# Nécessite l'increment 3 appliqué (la route doit exister).
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-member-documents-download.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-member-documents-download.sh
#
set -euo pipefail

SVC="apps/web/src/app/api/media/member-document/[id]/route.ts"

if [ ! -f "package.json" ]; then
  echo "ERREUR: lance ce script depuis la racine du repo AKFC." >&2
  exit 1
fi
if [ ! -f "$SVC" ]; then
  echo "ERREUR: $SVC introuvable — applique d'abord l'increment 3 (route)." >&2
  exit 1
fi

python3 - "$SVC" <<'PY'
import sys, pathlib

p = pathlib.Path(sys.argv[1])
s = p.read_text(encoding="utf-8")

if "download" in s and "ResponseContentDisposition: disposition" in s:
    print("déjà appliqué — rien à faire")
    sys.exit(0)

# ── A) select enrichi + calcul du nom + disposition ─────────────────────────
A_OLD = r'''    select: {
      mediaAsset: {
        select: { publicId: true, fullPath: true, mimeType: true },
      },
    },
  });

  if (!doc) return new NextResponse("Not found", { status: 404 });

  const asset = doc.mediaAsset;
  const contentType = asset.mimeType ?? "application/pdf";'''
A_NEW = r'''    select: {
      title: true,
      mediaAsset: {
        select: {
          publicId: true,
          fullPath: true,
          mimeType: true,
          displayName: true,
          originalFileName: true,
          format: true,
        },
      },
    },
  });

  if (!doc) return new NextResponse("Not found", { status: 404 });

  const asset = doc.mediaAsset;
  const contentType = asset.mimeType ?? "application/pdf";

  // ?download=1 → pièce jointe (nom humain) ; sinon aperçu inline.
  const download = req.nextUrl.searchParams.get("download") === "1";
  const baseName = doc.title ?? asset.displayName ?? asset.originalFileName;
  const ext = asset.format ?? "pdf";
  const fileName = /\.[^.]+$/.test(baseName) ? baseName : `${baseName}.${ext}`;
  const disposition = download
    ? `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`
    : "inline";'''
assert s.count(A_OLD) == 1, "ancre select/contentType introuvable/multiple — abandon"
s = s.replace(A_OLD, A_NEW)

# ── B) Cloudinary : disposition ─────────────────────────────────────────────
B_OLD = '''          "Content-Disposition": "inline",'''
B_NEW = '''          "Content-Disposition": disposition,'''
assert s.count(B_OLD) == 1, "ancre disposition Cloudinary introuvable/multiple — abandon"
s = s.replace(B_OLD, B_NEW)

# ── C) R2 : disposition ─────────────────────────────────────────────────────
C_OLD = '''      ResponseContentDisposition: "inline",'''
C_NEW = '''      ResponseContentDisposition: disposition,'''
assert s.count(C_OLD) == 1, "ancre disposition R2 introuvable/multiple — abandon"
s = s.replace(C_OLD, C_NEW)

p.write_text(s, encoding="utf-8")
print("patch OK (mode ?download=1)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck ni commit"
  exit 0
fi

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  echo "aucune modification — rien à typechecker/committer"
  exit 0
fi

if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then
  TC="check"
else
  TC="typecheck"
fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  echo "----- fin du log -----"; tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

git add -A
if git commit -m "feat(documents): mode ?download=1 (pièce jointe, nom humain) sur la route de livraison" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi