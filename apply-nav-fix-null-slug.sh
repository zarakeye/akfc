#!/usr/bin/env bash
# AKFC — Fix : menu « Nos disciplines » — disciplines sans slug écartées à la source.
# getAllForMenu renvoie tout aux admins (brouillons compris) : une discipline sans slug produisait
# un lien /disciplines/null (404 garantie), et `isCurrent(d.slug)` ne typait pas (string | null).
# Filtre avec type guard → d.slug est `string` pour tout le menu.
# À lancer APRÈS apply-nav-active-items.sh (ses modifs sont sur disque, non commitées).
# Usage : bash apply-nav-fix-null-slug.sh
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
F="apps/web/src/features/app-shell/OurActivitiesMenu.tsx"
[ -f "$F" ] || { echo "ERREUR: $F introuvable." >&2; exit 1; }
grep -q 'isCurrent' "$F" || { echo "ERREUR: lance d'abord apply-nav-active-items.sh" >&2; exit 1; }
grep -q 'MenuDiscipline' "$F" && { echo "— déjà appliqué"; exit 0; }

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
old = "  const disciplines = disciplinesData ?? [];\n"
assert s.count(old) == 1, f"ancre disciplines ×{s.count(old)}"
new = ('  // Une discipline sans slug n\'a pas de page : son lien mènerait à /disciplines/null.\n'
       '  // (Les admins reçoivent aussi les brouillons.) Le type guard rend `slug` non nul.\n'
       '  type MenuDiscipline = NonNullable<typeof disciplinesData>[number];\n'
       '  const disciplines = (disciplinesData ?? []).filter(\n'
       '    (d): d is MenuDiscipline & { slug: string } => d.slug !== null,\n'
       '  );\n')
p.write_text(s.replace(old, new), encoding="utf-8")
print("  ok  disciplines sans slug écartées (type guard)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY"; exit 0; fi
TC=$(node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null && echo check || echo typecheck)
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ ÉCHEC — pas de commit :"; grep -nE "conventions Next|error TS|Error:" /tmp/akfc_tc.log | head -15; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"; git add -A
git commit -m "fix(nav): plus de gras hérité dans les déroulants, page active mise en évidence, « Nos disciplines » (+ disciplines sans slug écartées)" >/tmp/c.log 2>&1 && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }