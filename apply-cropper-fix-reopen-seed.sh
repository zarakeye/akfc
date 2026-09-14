#!/usr/bin/env bash
#
# AKFC — Fix cropper : seed FIABLE de la recette à la réouverture.
#
# Symptômes : à la ré-édition, zoom/rotation reviennent à 1/0 (image pleine
# largeur) et la grille est décalée. Cause : le seed dépendait d'une largeur de
# workspace mesurée trop tôt (layout instable), et le zoom/rotation n'était
# posé que par l'init useState (peu fiable au remount conditionnel).
#
# Fix :
#  - zoom/rotation posés EXPLICITEMENT au montage (zoom.set/rotation.set) ;
#  - grille seedée DANS le onload de l'image (layout stable → largeur réelle,
#    identique à celle du crop), une seule fois (ref de garde).
#
# Périmètre : Cropper.tsx. Un typecheck.
# Usage : bash apply-cropper-fix-reopen-seed.sh
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

# 1) ref de garde après imgRef
one(
  '  const imgRef = useRef<HTMLImageElement | null>(null);',
  '  const imgRef = useRef<HTMLImageElement | null>(null);\n  const seededGrid = useRef(false);',
)

# 2) remplace le seed grille (rAF) par un seed zoom/rotation au montage
one(
  """  // Seed de la grille depuis la recette (fractions → px selon le workspace réel).
  useEffect(() => {
    if (!initialTransform) return;
    const raf = requestAnimationFrame(() => {
      const ws = workspaceSize();
      const gf = initialTransform.gridFrac;
      setGrid({ x: gf.x * ws, y: gf.y * ws, width: gf.width * ws, height: gf.height * ws });
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);""",
  """  // Seed zoom/rotation depuis la recette (au montage). La grille est seedée
  // dans le onload de l'image (layout stable → largeur réelle) — voir plus bas.
  useEffect(() => {
    if (!initialTransform) return;
    zoom.set(initialTransform.zoom);
    rotation.set(initialTransform.rotation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);""",
)

# 3) seed grille dans le onload (largeur réelle, une seule fois)
one(
  """    img.onload = () => {
      imgRef.current = img;
      renderPreview();
    };""",
  """    img.onload = () => {
      imgRef.current = img;
      if (initialTransform && !seededGrid.current) {
        seededGrid.current = true;
        const ws = workspaceSize();
        const gf = initialTransform.gridFrac;
        setGrid({ x: gf.x * ws, y: gf.y * ws, width: gf.width * ws, height: gf.height * ws });
      }
      renderPreview();
    };""",
)

p.write_text(s, encoding="utf-8")
print("Cropper.tsx : seed zoom/rotation au montage + grille au onload.")
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
git commit -m "fix(cropper): seed fiable zoom/rotation/grille à la réouverture (recette)" > /tmp/akfc_commit.log 2>&1 \
  && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit: rien ou échec"; tail -3 /tmp/akfc_commit.log; }