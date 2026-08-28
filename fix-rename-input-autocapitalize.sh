#!/usr/bin/env bash
#
# AKFC — Finder : le champ de renommage ne doit PAS auto-capitaliser.
#
# SYMPTÔME : impossible de renommer un dossier en minuscule (`groups`) — la
# première lettre repasse systématiquement en majuscule (`Groups`). CAUSE : le
# `<input>` de `RenameInput` n'a ni `autoCapitalize` ni `autoCorrect` ni
# `spellCheck` → le navigateur (clavier tactile) applique son défaut « sentences »
# et capitalise la 1re lettre. Combiné au pré-remplissage « Groups », on ne peut
# plus revenir à `groups`. Bloque la récupération des conteneurs cassés.
#
# FIX : `autoCapitalize="none"` + `autoCorrect="off"` + `spellCheck={false}` sur
# l'input de renommage. Un nom de fichier/dossier ne doit jamais être corrigé
# automatiquement. 1 fichier, 1 ancre, typecheck web.
#
# ⇒ Après ça, renomme `Groups` → `groups` et `Persos` → `persos` normalement.
#
# Usage : bash fix-rename-input-autocapitalize.sh
#         AKFC_APPLY_ONLY=1 bash fix-rename-input-autocapitalize.sh   (clone)
#
set -euo pipefail

F="apps/web/src/features/finder-core/components/RenameInput.tsx"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$F" ]           || { echo "ERREUR: $F introuvable." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "autoCapitalize" in s:
    print("déjà corrigé (autoCapitalize)"); sys.exit(0)

old = (
    "      <input\n"
    "        autoFocus\n"
    "        value={value}\n"
)
assert s.count(old) == 1, "ancre <input> de renommage introuvable/multiple"
new = (
    "      <input\n"
    "        autoFocus\n"
    "        autoCapitalize=\"none\"\n"
    "        autoCorrect=\"off\"\n"
    "        spellCheck={false}\n"
    "        value={value}\n"
)
s = s.replace(old, new)
p.write_text(s, encoding="utf-8")
print("RenameInput corrigé (plus d'auto-capitalisation)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head; tail -6 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "fix(finder): champ de renommage sans auto-capitalisation (permet les noms en minuscule)" \
  && echo "commit $(git rev-parse --short HEAD)"