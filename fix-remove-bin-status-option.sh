#!/usr/bin/env bash
#
# AKFC — retire la 3e option « Corbeille » du trio de statut (StatusRadioGroup).
# Le trio ne propose plus que « En attente » / « Validé » (les vrais statuts).
# La suppression = rôle du bouton icône-corbeille (+ ConfirmDialog), pas un statut.
#
# UI seulement. Le type LifecycleStatus garde 'bin' (utilisé ailleurs) ; on ne
# retire que l'OPTION affichée. Un seul fichier. Front non testé.
# Usage : bash fix-remove-bin-status-option.sh
#         AKFC_APPLY_ONLY=1 bash fix-remove-bin-status-option.sh   (clone)
#
set -euo pipefail
F="apps/web/src/features/finder-core/components/StatusRadioGroup.tsx"
[ -f package.json ] || { echo "ERREUR: racine du repo requise." >&2; exit 1; }
[ -f "$F" ] || { echo "ERREUR: $F introuvable." >&2; exit 1; }
if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  B="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  [ "$B" = "main" ] || [ "$B" = "master" ] && { echo "NOTE: sur '$B' (Ctrl-C pour annuler)."; sleep 2; }
fi

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
old = "  { value: 'bin', label: 'Corbeille' },\n"
if old not in s:
    print("déjà à jour (option bin absente)"); sys.exit(0)
assert s.count(old) == 1, "ancre option bin introuvable/multiple"
s = s.replace(old, "")
p.write_text(s, encoding="utf-8")
print("option « Corbeille » retirée du trio")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY — pas de typecheck/commit"; exit 0; fi
echo "typecheck web…"
pnpm --filter web typecheck > /tmp/tc.log 2>&1 || { echo "KO:"; grep -nE "error TS" /tmp/tc.log | head; tail -4 /tmp/tc.log; exit 1; }
echo OK
[ -z "$(git status --porcelain)" ] && { echo "rien à committer"; exit 0; }
git add -A && git commit -m "refactor(finder): trio de statut limité à En attente/Validé (suppression = bouton corbeille)" && echo "commit $(git rev-parse --short HEAD)"