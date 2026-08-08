#!/usr/bin/env bash
#
# AKFC — Cropper : déplacer la grille au doigt (mouse → pointer events).
#
# `cropGridOverlay` n'écoutait que la souris (`onMouseDown` + window
# mousemove/mouseup) → grille non déplaçable au tactile. On bascule sur les
# événements Pointer, qui unifient souris, tactile et stylet (`e.clientX/Y`
# identiques). On ajoute `touch-none` pour que le drag ne fasse pas défiler la
# page. Petit lifting au passage : cadre `border-2 border-white/90`.
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-cropper-touch-drag.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-cropper-touch-drag.sh
#
set -euo pipefail

SVC="apps/web/src/features/gallery-crop/components/cropGridOverlay.tsx"

if [ ! -f "package.json" ] || [ ! -f "$SVC" ]; then
  echo "ERREUR: lance ce script depuis la racine du repo AKFC ($SVC attendu)." >&2
  exit 1
fi

python3 - "$SVC" <<'PY'
import sys, pathlib

p = pathlib.Path(sys.argv[1])
s = p.read_text(encoding="utf-8")

if "onPointerDown" in s:
    print("déjà appliqué — rien à faire")
    sys.exit(0)

edits = [
    ('''  const onMouseDown = (e: React.MouseEvent) => {''',
     '''  const onPointerDown = (e: React.PointerEvent) => {'''),
    ('''    const onMouseMove = (e: MouseEvent) => {''',
     '''    const onPointerMove = (e: PointerEvent) => {'''),
    ('''    const onMouseUp = () => {''',
     '''    const onPointerUp = () => {'''),
    ('''    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);''',
     '''    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);'''),
    ('''      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);''',
     '''      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);'''),
    ('''      onMouseDown={onMouseDown}''',
     '''      onPointerDown={onPointerDown}'''),
    ('''      className="absolute border  pointer-events-auto cursor-move select-none"''',
     '''      className="absolute border-2 border-white/90 pointer-events-auto cursor-move select-none touch-none"'''),
]

for old, new in edits:
    assert s.count(old) == 1, f"ancre introuvable/multiple — abandon avant tout commit :\n{old[:60]}"
    s = s.replace(old, new)

p.write_text(s, encoding="utf-8")
print("patch cropGridOverlay OK (drag tactile via pointer events)")
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
if git commit -m "feat(cropper): déplacer la grille au tactile (pointer events)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi