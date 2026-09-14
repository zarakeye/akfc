#!/usr/bin/env bash
#
# AKFC — Fix cropper avatar : forme/grille invisibles à la RÉOUVERTURE.
#
# La grille est re-seedée depuis la recette (gridFrac × largeur du workspace)
# au montage. Si getBoundingClientRect().width vaut 0 à cet instant (layout non
# stabilisé), grille = frac × 0 = 0 → trou du masque nul → voile sombre partout
# → plus de forme ni de grille. Fix : garde `|| WORKSPACE` (jamais 0) + seed
# différé d'une frame (requestAnimationFrame) pour lire une largeur réelle.
#
# Périmètre : Cropper.tsx uniquement. Un typecheck.
# Usage : bash apply-cropper-fix-reopen-grid.sh
#
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
F="apps/web/src/features/gallery-crop/components/Cropper.tsx"
[ -f "$F" ] || { echo "ERREUR: $F introuvable." >&2; exit 1; }

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

def one(old, new):
    global s
    assert s.count(old) == 1, f"ancre ×{s.count(old)} : {old[:60]!r}"
    s = s.replace(old, new)

# 1) workspaceSize : traiter width 0 comme fallback (|| au lieu de ??)
one(
  "    return workspaceRef.current?.getBoundingClientRect().width ?? WORKSPACE;",
  "    return workspaceRef.current?.getBoundingClientRect().width || WORKSPACE;",
)

# 2) seed grille depuis la recette : différer d'une frame + largeur garantie
one(
  """  useEffect(() => {
    if (!initialTransform) return;
    const ws = workspaceSize();
    const gf = initialTransform.gridFrac;
    setGrid({ x: gf.x * ws, y: gf.y * ws, width: gf.width * ws, height: gf.height * ws });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);""",
  """  useEffect(() => {
    if (!initialTransform) return;
    const raf = requestAnimationFrame(() => {
      const ws = workspaceSize();
      const gf = initialTransform.gridFrac;
      setGrid({ x: gf.x * ws, y: gf.y * ws, width: gf.width * ws, height: gf.height * ws });
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);""",
)

p.write_text(s, encoding="utf-8")
print("Cropper.tsx patché (garde largeur + seed différé).")
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
git commit -m "fix(cropper): forme/grille visibles à la réouverture (garde largeur + seed différé)" > /tmp/akfc_commit.log 2>&1 \
  && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit: rien ou échec"; tail -3 /tmp/akfc_commit.log; }