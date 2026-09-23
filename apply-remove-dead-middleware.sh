#!/usr/bin/env bash
# AKFC — Suppression de la chaîne morte « porte En construction » (preuve : verify-dead-middleware-local.sh
# → MORT CONFIRMÉ : le middleware enregistré est src/proxy.ts, apps/web/middleware.ts n'est pas compilé).
#  - apps/web/middleware.ts                         (jamais chargé par Next 16)
#  - apps/web/src/app/api/page-access/route.ts      (seul appelant : ce middleware)
#  - apps/web/src/app/(public)/en-construction/     (seule cible de sa réécriture ; doublon de UnderConstruction)
#  - robots.ts : la ligne "/en-construction"
#  - commentaires qui attribuaient au middleware ce que fait isEditorialPageGated
# GARDES : tout est revérifié AVANT modification ; au moindre écart, arrêt sans rien toucher.
# Suppressions via git rm → réversibles (git revert).
# Usage : bash apply-remove-dead-middleware.sh
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
MW="apps/web/middleware.ts"
ROUTE="apps/web/src/app/api/page-access/route.ts"
PAGE="apps/web/src/app/(public)/en-construction/page.tsx"
ROBOTS="apps/web/src/app/robots.ts"
BADGE="apps/web/src/features/app-shell/DraftPageBadge.tsx"
REG="apps/web/src/config/pageRegistry.ts"

if [ ! -f "$MW" ] && [ ! -f "$ROUTE" ] && [ ! -f "$PAGE" ]; then echo "— déjà appliqué"; exit 0; fi

echo "== GARDES (rien n'est modifié tant qu'elles ne passent pas toutes) =="
fail(){ echo "  ❌ $1"; echo "ARRÊT — aucun fichier modifié."; exit 1; }
[ -f "apps/web/src/proxy.ts" ] || fail "src/proxy.ts absent : le proxy vivant n'est plus là, la preuve ne tient plus"
for f in "$MW" "$ROUTE" "$PAGE" "$ROBOTS" "$BADGE"; do [ -f "$f" ] || fail "$f introuvable (état différent de la preuve)"; done
SRC="grep -rln --include=*.ts --include=*.tsx --include=*.js --include=*.mjs"
R1=$($SRC 'page-access' apps packages 2>/dev/null | grep -vE 'node_modules|/\.next/' | grep -vxF -e "$MW" -e "$ROUTE" || true)
[ -z "$R1" ] || fail "nouvelle référence à page-access : $R1"
R2=$($SRC 'en-construction' apps packages 2>/dev/null | grep -vE 'node_modules|/\.next/' | grep -vxF -e "$MW" -e "$ROUTE" -e "$PAGE" -e "$ROBOTS" || true)
[ -z "$R2" ] || fail "nouvelle référence à en-construction : $R2"
R3=$(grep -rnE "from ['\"][^'\"]*/middleware['\"]" apps packages --include=*.ts --include=*.tsx 2>/dev/null | grep -vE 'node_modules|/\.next/' | grep -vE "zustand/middleware|trpc/middleware" || true)
[ -z "$R3" ] || fail "import d'un module middleware inattendu : $R3"
[ "$(ls "apps/web/src/app/(public)/en-construction")" = "page.tsx" ] || fail "le dossier en-construction contient d'autres fichiers"
[ "$(ls "apps/web/src/app/api/page-access")" = "route.ts" ] || fail "le dossier api/page-access contient d'autres fichiers"
echo "  ✅ toutes les gardes passent"

echo "== MODIFICATIONS =="
python3 - "$ROBOTS" "$BADGE" "$REG" <<'PY'
import sys, pathlib
ROBOTS, BADGE, REG = sys.argv[1:4]
def edit(path, old, new, label, optional=False):
    p = pathlib.Path(path); s = p.read_text(encoding="utf-8"); n = s.count(old)
    if optional and n == 0: print(f"  — {label} : déjà à jour"); return
    assert n == 1, f"{label} : ancre ×{n}"
    p.write_text(s.replace(old, new), encoding="utf-8"); print(f"  ok  {label}")
edit(ROBOTS, '        "/en-construction",\n', '', "robots.ts : ligne /en-construction retirée")
edit(BADGE, "(le middleware laisse l'admin voir la vraie page ;",
            "(isEditorialPageGated laisse l'admin voir la vraie page ;",
            "DraftPageBadge : commentaire corrigé")
edit(REG, "Source unique partagée middleware + centre de",
          "Source unique partagée avec le centre de",
          "pageRegistry : commentaire corrigé", optional=True)
PY
git rm -q "$MW" "$ROUTE" "$PAGE" 2>/dev/null || rm -f "$MW" "$ROUTE" "$PAGE"
rmdir "apps/web/src/app/api/page-access" "apps/web/src/app/(public)/en-construction" 2>/dev/null || true
echo "  ok  supprimés : $MW, $ROUTE, $PAGE"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY"; exit 0; fi
TC=$(node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null && echo check || echo typecheck)
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit (annuler : git checkout -- . && git reset -q HEAD) :"
  grep -nE "error TS|Error:" /tmp/akfc_tc.log | head -15; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"; git add -A
git commit -m "chore: supprime la porte « En construction » morte (middleware.ts jamais chargé, page-access, /en-construction)" >/tmp/c.log 2>&1 \
  && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }