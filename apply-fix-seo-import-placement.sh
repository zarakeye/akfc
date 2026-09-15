#!/usr/bin/env bash
#
# AKFC — Répare l'insertion cassée de `import type { Metadata }` (events/seminars).
#
# apply-seo-page-metadata a inséré la ligne APRÈS la dernière ligne commençant
# par `import` — mais dans events/seminars c'était le DÉBUT d'un import
# multi-lignes (`import {` … ), d'où l'insertion AU MILIEU du bloc → syntaxe
# cassée. Ici : on retire la ligne mal placée et on la remet proprement juste
# après le dernier import terminé (ligne contenant `} from "...";` ou import
# simple sur une ligne).
#
# disciplines est intact (imports mono-ligne) → non touché.
# Périmètre : events + seminars page.tsx. Un typecheck (validera aussi le carrousel).
# Usage : bash apply-fix-seo-import-placement.sh
#
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
BASE="apps/web/src/app/(public)"
S="$BASE/seminars/[slug]/page.tsx"
E="$BASE/events/[slug]/page.tsx"
for f in "$S" "$E"; do
  [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }
done

python3 - "$S" "$E" <<'PY'
import sys, pathlib, re

MET = 'import type { Metadata } from "next";'

def fix(path):
    p = pathlib.Path(path)
    lines = p.read_text(encoding="utf-8").splitlines(keepends=True)

    # 1) retirer TOUTES les occurrences de la ligne Metadata (mal placée)
    lines = [ln for ln in lines if ln.strip() != MET]

    # 2) trouver la fin du bloc d'imports initial : dernière ligne, en partant
    #    du haut sans interruption "logique", qui TERMINE un import.
    #    On repère l'index de la dernière ligne qui clôt un import :
    #    - `... from "...";`  (mono ou fin de multi-ligne)
    #    - `import "...";`    (side-effect)
    last_import_end = -1
    depth = 0
    in_import = False
    for i, ln in enumerate(lines):
        s = ln.strip()
        if not in_import and s.startswith("import"):
            in_import = True
        if in_import:
            depth += ln.count("{") - ln.count("}")
            # un import se termine quand la ligne finit par ';' ET accolades équilibrées
            if depth <= 0 and s.endswith(";"):
                last_import_end = i
                in_import = False
                depth = 0
    assert last_import_end >= 0, f"{path}: bloc d'imports introuvable"

    # 3) réinsérer la ligne Metadata juste après ce dernier import
    lines.insert(last_import_end + 1, MET + "\n")
    p.write_text("".join(lines), encoding="utf-8")
    print(f"  ok  {path}  (Metadata replacé après la ligne {last_import_end+1})")

for f in (sys.argv[1], sys.argv[2]):
    fix(f)
print("Imports réparés.")
PY

echo "=== contrôle : en-tête des 2 fichiers ==="
for f in "$S" "$E"; do echo "--- $f ---"; sed -n '1,12p' "$f"; done

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY — pas de typecheck ni commit"; exit 0; fi
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then TC="check"; else TC="typecheck"; fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -20 || true
  tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"
git add -A
git commit -m "fix(seo): placement correct de l'import Metadata (events/seminars) + carrousel ruban" > /tmp/akfc_commit.log 2>&1 \
  && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit: rien ou échec"; tail -3 /tmp/akfc_commit.log; }