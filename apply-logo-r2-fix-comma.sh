#!/usr/bin/env bash
# AKFC — Fix : double virgule dans siteSettings/router.ts (insertion uploadLogo).
# Usage : bash apply-logo-r2-fix-comma.sh
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
F="packages/backend/src/modules/siteSettings/router.ts"
[ -f "$F" ] || { echo "ERREUR: $F introuvable." >&2; exit 1; }

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
old = "    }),,\n  /**\n   * Upload du logo du site (admin)."
new = "    }),\n\n  /**\n   * Upload du logo du site (admin)."
if old not in s:
    # tolérant : si déjà corrigé, on ne fait rien
    if "}),,\n" in s:
        # fallback générique : toute double virgule de fermeture de propriété
        assert s.count("}),,\n") == 1, "double virgule ambiguë"
        s = s.replace("}),,\n", "}),\n\n", 1)
        print("  ok  double virgule corrigée (fallback)")
    else:
        print("  — rien à corriger (déjà propre)"); sys.exit(0)
else:
    assert s.count(old) == 1, "ancre double virgule ×%d" % s.count(old)
    s = s.replace(old, new)
    print("  ok  double virgule corrigée")
p.write_text(s, encoding="utf-8")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY"; exit 0; fi
echo "prisma generate…"; pnpm --filter @backend prisma generate > /tmp/akfc_gen.log 2>&1 || npx prisma generate --schema prisma/schema.prisma > /tmp/akfc_gen.log 2>&1 || { echo "⚠ prisma generate :"; tail -5 /tmp/akfc_gen.log; }
TC=$(node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null && echo check || echo typecheck)
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head -20; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"; git add -A
git commit -m "feat(site-settings): logo R2 hors finder — logoKey + uploadLogo + route /api/media/site-logo" >/tmp/c.log 2>&1 && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }