#!/usr/bin/env bash
#
# AKFC — Libellé d'affichage « Corbeille » pour `bin` (comme « Dépôt commun »).
#
# Ajoute un FolderLabel[${appRoot}/bin] = « Corbeille », forcé au boot dans
# ensureRootFolders (juste après le libellé « Dépôt commun »). Path inchangé,
# aucun risque — pur affichage.
#
# Prérequis : le script « Dépôt commun » (apply-common-repository-root-label.sh)
# doit avoir été appliqué (on ancre sur son upsert). Sinon, applique-le d'abord.
#
# Backend seul, typecheck backend + web.
#
# Usage : bash apply-bin-corbeille-label.sh
#         AKFC_APPLY_ONLY=1 bash apply-bin-corbeille-label.sh   (clone)
#
set -euo pipefail

F="packages/backend/src/modules/cloudinary/services/ensureRootFolders.service.ts"
[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$F" ]           || { echo "ERREUR: $F introuvable." >&2; exit 1; }

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if '"Corbeille"' in s:
    print("— libellé Corbeille déjà présent"); sys.exit(0)

anchor = (
    "  await prisma.folderLabel.upsert({\n"
    "    where: { path: `${appRoot}/common_repository` },\n"
    '    update: { displayName: "Dépôt commun" },\n'
    '    create: { path: `${appRoot}/common_repository`, displayName: "Dépôt commun" },\n'
    "  });\n"
)
assert anchor in s, (
    "ancre upsert « Dépôt commun » introuvable — applique d'abord "
    "apply-common-repository-root-label.sh"
)
addition = anchor + (
    "\n"
    "  // Libellé d'affichage de la corbeille (path `bin` inchangé).\n"
    "  await prisma.folderLabel.upsert({\n"
    "    where: { path: `${appRoot}/bin` },\n"
    '    update: { displayName: "Corbeille" },\n'
    '    create: { path: `${appRoot}/bin`, displayName: "Corbeille" },\n'
    "  });\n"
)
s = s.replace(anchor, addition)
p.write_text(s, encoding="utf-8")
print("✓ ensureRootFolders : libellé « Corbeille » ajouté")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck backend…"
if ! pnpm --filter backend typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck backend KO :"; grep -nE "error TS|folderLabel" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "feat(finder): libellé d'affichage « Corbeille » pour bin" \
  && echo "commit $(git rev-parse --short HEAD)"