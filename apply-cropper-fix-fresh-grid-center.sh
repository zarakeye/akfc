#!/usr/bin/env bash
#
# AKFC — Fix cropper : grille CENTRÉE à la première ouverture (mode avatar).
#
# Le défaut en dur {150,150,200,200} vise un workspace de 500 px. En mode
# avatar (responsive), le workspace partage la largeur avec les curseurs +
# l'aperçu → il rend plus petit → 150,150 tombe en bas à droite. Fix : en
# mode responsive (avatar), sur crop neuf, seeder une grille carrée à 60 %
# CENTRÉE sur la largeur réelle. Galerie inchangée (garde son défaut). Le
# rappel de recette (réouverture) est inchangé.
#
# Périmètre : Cropper.tsx (bloc onload). Un typecheck.
# Usage : bash apply-cropper-fix-fresh-grid-center.sh
#
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
F="apps/web/src/features/gallery-crop/components/Cropper.tsx"
[ -f "$F" ] || { echo "ERREUR: $F introuvable." >&2; exit 1; }

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

old = """    img.onload = () => {
      imgRef.current = img;
      if (initialTransform && !seededGrid.current) {
        seededGrid.current = true;
        const ws = workspaceSize();
        const gf = initialTransform.gridFrac;
        setGrid({ x: gf.x * ws, y: gf.y * ws, width: gf.width * ws, height: gf.height * ws });
      }
      renderPreview();
    };"""
new = """    img.onload = () => {
      imgRef.current = img;
      if (!seededGrid.current) {
        seededGrid.current = true;
        const ws = workspaceSize();
        if (initialTransform) {
          // Réouverture : grille depuis la recette (fractions → px).
          const gf = initialTransform.gridFrac;
          setGrid({ x: gf.x * ws, y: gf.y * ws, width: gf.width * ws, height: gf.height * ws });
        } else if (responsive) {
          // Crop neuf (avatar) : carré 60 % CENTRÉ sur la largeur réelle.
          const side = ws * 0.6;
          const off = (ws - side) / 2;
          setGrid({ x: off, y: off, width: side, height: side });
        }
        // sinon (galerie) : on garde le défaut {150,150,200,200}.
      }
      renderPreview();
    };"""
assert s.count(old) == 1, f"ancre onload ×{s.count(old)}"
p.write_text(s.replace(old, new), encoding="utf-8")
print("Cropper.tsx : grille centrée à la première ouverture (avatar).")
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
git commit -m "fix(cropper): grille centrée à la première ouverture en mode avatar (largeur réelle)" > /tmp/akfc_commit.log 2>&1 \
  && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit: rien ou échec"; tail -3 /tmp/akfc_commit.log; }