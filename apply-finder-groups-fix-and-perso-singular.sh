#!/usr/bin/env bash
#
# AKFC — Finder : corrige le conteneur groupe manqué par Lot A + singulier perso.
#
# 1) Lot A avait renommé les regexes mais PAS les littéraux
#    `groupsContainerPath = `${APP_ROOT}/groups`` dans Finder.tsx et
#    FinderTreeFolder.tsx → le front cherchait encore `groups` (grouping cassé,
#    illusion de dossier « groups »). On les passe à `collaborative-group-spaces`.
# 2) Renomme `personal-spaces` → `personal-space` (singulier) PARTOUT dans le
#    code (chemin physique). Motif : le dossier contient les espaces perso de
#    tous les admins, mais le finder n'affichera que celui de l'admin connecté
#    → illusion d'un espace unique, d'où le singulier.
#
# Tolérant/idempotent : si une partie est déjà faite (retouches manuelles), elle
# est simplement sautée ; le script rapporte ce qu'il a changé. Gate tsc seul.
#
# Périmètre : back + front. Un aller-retour = un typecheck.
# Usage : bash apply-finder-groups-fix-and-perso-singular.sh
#
set -euo pipefail

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

python3 - <<'PY'
import pathlib

FINDER = "apps/web/src/features/finder-core/components/Finder.tsx"
FTF    = "apps/web/src/features/finder-core/components/FinderTreeFolder.tsx"
DIRS   = ["packages/backend/src", "apps/web/src", "packages/contracts/src"]

changed = 0

# ── 1) groupsContainerPath : groups → collaborative-group-spaces ──
def fix_groups(path, indent):
    global changed
    fp = pathlib.Path(path)
    if not fp.exists():
        print(f"  (absent) {path}"); return
    s = fp.read_text(encoding="utf-8")
    old = f"{indent}const groupsContainerPath = `${{APP_ROOT}}/groups`;"
    new = f"{indent}const groupsContainerPath = `${{APP_ROOT}}/collaborative-group-spaces`;"
    n = s.count(old)
    if n == 0:
        if "groupsContainerPath = `${APP_ROOT}/collaborative-group-spaces`" in s:
            print(f"  (déjà ok) {path}")
        else:
            print(f"  ⚠️ ancre groupsContainerPath introuvable dans {path} — à vérifier")
        return
    s = s.replace(old, new)
    fp.write_text(s, encoding="utf-8")
    changed += 1
    print(f"  ok  {path}  (groupsContainerPath → collaborative-group-spaces)")

fix_groups(FINDER, "    ")
fix_groups(FTF, "  ")

# ── 2) personal-spaces → personal-space (partout, tolérant) ──
targets = []
for d in DIRS:
    base = pathlib.Path(d)
    if not base.exists():
        continue
    for fp in base.rglob("*"):
        if fp.suffix in (".ts", ".tsx") and "node_modules" not in fp.parts:
            try:
                s = fp.read_text(encoding="utf-8")
            except Exception:
                continue
            if "personal-spaces" in s:
                targets.append(fp)

for fp in targets:
    s = fp.read_text(encoding="utf-8")
    cnt = s.count("personal-spaces")
    s = s.replace("personal-spaces", "personal-space")
    fp.write_text(s, encoding="utf-8")
    changed += 1
    print(f"  ok  {fp}  (personal-spaces → personal-space ×{cnt})")

if changed == 0:
    print("Rien à changer (déjà appliqué).")
else:
    print(f"Terminé : {changed} fichier(s) modifié(s).")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY — pas de typecheck ni commit"; exit 0; fi
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification — rien à committer"; exit 0; fi
if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then TC="check"; else TC="typecheck"; fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"
git add -A
if git commit -m "fix(finder): conteneur groupe = collaborative-group-spaces (manqué par lot A) + perso au singulier" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "→ Pense à: pnpm clean puis relance le dev."
else echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1; fi