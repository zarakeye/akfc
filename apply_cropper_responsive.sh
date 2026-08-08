#!/usr/bin/env bash
#
# AKFC — Cropper responsive (s'adapte à tout écran).
#
# L'établi était figé `w-[500px] h-[500px]` et posé en `flex` côte-à-côte avec
# l'aperçu → débordement sur petit écran. Le dessin et le drag lisent déjà
# `getBoundingClientRect()` (taille réelle), donc les maths s'adaptent : le fix
# est du layout.
#
# Changements : établi `w-full max-w-[500px] aspect-square` (fluide, carré,
# plafonné) ; ligne établi+aperçu empilée sur mobile (`flex-col sm:flex-row`) ;
# carte plafonnée à la fenêtre avec défilement ; barre de contrôles qui passe
# à la ligne (`flex-wrap`).
#
# NOTE (hors périmètre) : le drag de la grille utilise `onMouseDown` seulement
# → il ne répond pas au doigt. Le layout tient sur mobile mais on ne peut pas
# encore déplacer la grille au tactile (bascule mouse→pointer à faire à part).
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-cropper-responsive.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-cropper-responsive.sh
#
set -euo pipefail

SVC="apps/web/src/features/gallery-crop/components/Cropper.tsx"

if [ ! -f "package.json" ] || [ ! -f "$SVC" ]; then
  echo "ERREUR: lance ce script depuis la racine du repo AKFC ($SVC attendu)." >&2
  exit 1
fi

python3 - "$SVC" <<'PY'
import sys, pathlib

p = pathlib.Path(sys.argv[1])
s = p.read_text(encoding="utf-8")

if "aspect-square" in s:
    print("déjà appliqué — rien à faire")
    sys.exit(0)

# ── 1) Modal : autoriser le défilement si le contenu dépasse ────────────────
M_OLD = '''    <div className="fixed inset-0 bg-black/70 flex items-start justify-center z-50 p-4">'''
M_NEW = '''    <div className="fixed inset-0 bg-black/70 flex items-start justify-center z-50 p-4 overflow-auto">'''
assert s.count(M_OLD) == 1, "ancre modal introuvable/multiple — abandon"
s = s.replace(M_OLD, M_NEW)

# ── 2) Carte : plafonnée à la fenêtre, défilement interne ───────────────────
C_OLD = '''      <div className="bg-white p-4 rounded shadow gap-4">'''
C_NEW = '''      <div className="bg-white p-4 rounded shadow gap-4 w-full sm:w-auto max-w-full max-h-[92dvh] overflow-auto">'''
assert s.count(C_OLD) == 1, "ancre carte introuvable/multiple — abandon"
s = s.replace(C_OLD, C_NEW)

# ── 3) Ligne établi+aperçu empilée sur mobile + établi fluide carré ─────────
R_OLD = '''        <div className="flex gap-4">
          <div
            ref={workspaceRef}
            className="relative w-[500px] h-[500px] overflow-hidden bg-checkerboard"
          >'''
R_NEW = '''        <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
          <div
            ref={workspaceRef}
            className="relative w-full max-w-[500px] aspect-square overflow-hidden bg-checkerboard"
          >'''
assert s.count(R_OLD) == 1, "ancre établi introuvable/multiple — abandon"
s = s.replace(R_OLD, R_NEW)

# ── 4) Barre de contrôles : passe à la ligne au lieu de déborder ────────────
K_OLD = '''        <div className="flex gap-6 mt-4">'''
K_NEW = '''        <div className="flex flex-wrap gap-4 mt-4">'''
assert s.count(K_OLD) == 1, "ancre contrôles introuvable/multiple — abandon"
s = s.replace(K_OLD, K_NEW)

p.write_text(s, encoding="utf-8")
print("patch Cropper OK (layout responsive)")
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
if git commit -m "feat(cropper): layout responsive (établi fluide carré, empilé sur mobile, contrôles wrap)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi