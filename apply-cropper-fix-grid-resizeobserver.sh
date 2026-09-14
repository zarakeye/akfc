#!/usr/bin/env bash
#
# AKFC — Fix cropper : seed grille sur ResizeObserver (disque ET caméra).
#
# Le seed de la grille au `onload` de l'image dépendait du timing de
# chargement : une capture caméra (blob en mémoire) se décode avant que le
# workspace ait sa largeur finale → grille décalée. Fix : seeder la grille dès
# que le WORKSPACE a une largeur réelle, mesurée par un ResizeObserver —
# indépendant de l'image. Le onload ne fait plus que charger l'image.
#
# Périmètre : Cropper.tsx. Un typecheck.
# Usage : bash apply-cropper-fix-grid-resizeobserver.sh
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

# A) maj commentaire + ajout de l'effet ResizeObserver pour la grille
one(
  """  // Seed zoom/rotation depuis la recette (au montage). La grille est seedée
  // dans le onload de l'image (layout stable → largeur réelle) — voir plus bas.
  useEffect(() => {
    if (!initialTransform) return;
    zoom.set(initialTransform.zoom);
    rotation.set(initialTransform.rotation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);""",
  """  // Seed zoom/rotation depuis la recette (au montage).
  useEffect(() => {
    if (!initialTransform) return;
    zoom.set(initialTransform.zoom);
    rotation.set(initialTransform.rotation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Seed de la GRILLE dès que le workspace a une largeur réelle, via
  // ResizeObserver — indépendant du timing de chargement de l'image (marche
  // donc pour un fichier disque ET une capture caméra décodée instantanément).
  useEffect(() => {
    const el = workspaceRef.current;
    if (!el) return;
    const seed = (w: number) => {
      if (!w || seededGrid.current) return;
      seededGrid.current = true;
      if (initialTransform) {
        const gf = initialTransform.gridFrac;
        setGrid({ x: gf.x * w, y: gf.y * w, width: gf.width * w, height: gf.height * w });
      } else if (responsive) {
        const side = w * 0.6;
        const off = (w - side) / 2;
        setGrid({ x: off, y: off, width: side, height: side });
      }
      // sinon (galerie) : on garde le défaut {150,150,200,200}.
    };
    seed(el.getBoundingClientRect().width);
    if (seededGrid.current) return;
    const ro = new ResizeObserver((entries) => seed(entries[0].contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);""",
)

# B) onload : ne fait plus que charger l'image (le seed grille est déplacé)
one(
  """    img.onload = () => {
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
    };""",
  """    img.onload = () => {
      imgRef.current = img;
      renderPreview();
    };""",
)

p.write_text(s, encoding="utf-8")
print("Cropper.tsx : grille seedée via ResizeObserver (disque + caméra).")
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
git commit -m "fix(cropper): grille centrée via ResizeObserver (fiable disque + capture caméra)" > /tmp/akfc_commit.log 2>&1 \
  && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit: rien ou échec"; tail -3 /tmp/akfc_commit.log; }