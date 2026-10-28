#!/usr/bin/env bash
# CARROUSEL D'ACCUEIL : corrige les erreurs eslint de HomeCarousel.tsx :
#   - react-hooks/refs (« Cannot update ref during render ») ×2 ;
#   - react-hooks/immutability (« Cannot reassign `x` after render completes ») : boucle for au lieu de .map.
#   playingRef / autoModeRef étaient recopiés PENDANT le rendu ; ils le sont
#   désormais dans un useEffect, après chaque rendu où playing / autoMode changent. Comportement inchangé :
#   ces refs ne sont lues que par la boucle d'animation (requestAnimationFrame), donc hors rendu.
# Usage (racine du repo) : bash apply-fix-carousel-refs.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }
F="apps/web/src/features/app-shell/HomeCarousel.tsx"
if grep -q "Recopie des états dans les refs" "$F"; then echo "Déjà appliqué."; exit 0; fi
restore(){ git checkout -q -- "$F" 2>/dev/null || true; echo "  ↩ fichier restauré"; }
trap 'restore' ERR

python3 - <<'PY'
F = "apps/web/src/features/app-shell/HomeCarousel.tsx"
s = open(F, encoding="utf-8").read()
old = """  const playingRef = useRef(playing);
  playingRef.current = playing;
  const autoModeRef = useRef(autoMode);
  autoModeRef.current = autoMode;
"""
new = """  const playingRef = useRef(playing);
  const autoModeRef = useRef(autoMode);
  // Recopie des états dans les refs APRÈS le rendu (react-hooks/refs : pas d'écriture de ref pendant le
  // rendu). Seule la boucle d'animation (requestAnimationFrame) les lit, donc toujours hors rendu.
  useEffect(() => {
    playingRef.current = playing;
    autoModeRef.current = autoMode;
  }, [playing, autoMode]);
"""
assert s.count(old) == 1, ("ancre introuvable", s.count(old))
s = s.replace(old, new)
# géométrie : la variable x était réassignée DANS le callback de .map (react-hooks/immutability) → boucle for
old2 = """    let x = 0;
    const list: Geo[] = items.map((it) => {
      const w = ratioOf(it) * H;
      const g: Geo = { it, w, base: x, center: x + w / 2 };
      x += w + GAP;
      return g;
    });
    return { list, W: x };"""
new2 = """    let x = 0;
    const list: Geo[] = [];
    for (const it of items) {
      const w = ratioOf(it) * H;
      list.push({ it, w, base: x, center: x + w / 2 });
      x += w + GAP;
    }
    return { list, W: x };"""
assert s.count(old2) == 1, ("ancre géométrie introuvable", s.count(old2))
open(F, "w", encoding="utf-8").write(s.replace(old2, new2))
print("  édits ok (HomeCarousel.tsx : refs + géométrie)")
PY
trap - ERR

[ "${AKFC_APPLY_ONLY:-0}" = "1" ] && { echo "Appliqué (sans vérification ni commit)."; exit 0; }
echo "== eslint (fichier) =="
if ! (cd apps/web && pnpm exec eslint "src/features/app-shell/HomeCarousel.tsx") > /tmp/akfc_lint.log 2>&1; then
  echo "❌ eslint :"; grep -v '^[[:space:]]*$' /tmp/akfc_lint.log | head -12; restore; exit 1
fi
echo "  ✅ eslint OK"
echo "== pnpm check =="
if ! pnpm check > /tmp/akfc_tc.log 2>&1; then
  echo "❌ check ÉCHOUÉ :"
  grep -nE "error TS|ERR_|Error:|EACCES|Permission denied" /tmp/akfc_tc.log | head -12
  echo "  … fin du journal :"; grep -v '^[[:space:]]*$' /tmp/akfc_tc.log | tail -8
  restore; exit 1
fi
echo "  ✅ check OK"
git add "$F"
git commit -F - >/tmp/c.log 2>&1 <<'MSG' && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }
fix(carousel): erreurs react-hooks/refs et react-hooks/immutability

playingRef et autoModeRef étaient recopiés pendant le rendu de
HomeCarousel ; la recopie se fait désormais dans un useEffect. Les refs ne
sont lues que par la boucle requestAnimationFrame : comportement inchangé.
Géométrie du ruban calculée par une boucle for (plus de réassignation
dans le callback de .map).

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014LCtjvXtxeMakFEsVHTLca
MSG
echo "Rappel : pnpm check vide .next ; relancer pnpm dev si la page ne se met pas à jour."