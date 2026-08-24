#!/usr/bin/env bash
#
# AKFC — retire le bouton TEXTE « Mettre la sélection à la corbeille (n) »
# (barre multi-sélection du Finder), redondant avec le bouton ICÔNE rouge
# qui, lui, ouvre un ConfirmDialog. On garde l'icône + confirmation.
#
# Retire aussi le handler `handleMultiDelete` et le const `label` devenus
# inutiles. Conserve : « N sélectionné(s) », StatusRadioGroup, bouton X,
# le bouton icône rouge (avec ConfirmDialog). NE touche PAS à la logique
# trash (deleteNodes) — le vrai bug (resolvePhysicalLocations) est traité
# à part par la réconciliation DB.
#
# Un seul fichier. Front non testé. Usage :
#   bash fix-remove-redundant-trash-button.sh
#   AKFC_APPLY_ONLY=1 bash fix-remove-redundant-trash-button.sh   (clone)
#
set -euo pipefail
F="apps/web/src/features/finder-core/components/Finder.tsx"
[ -f package.json ] || { echo "ERREUR: racine du repo requise." >&2; exit 1; }
[ -f "$F" ] || { echo "ERREUR: $F introuvable." >&2; exit 1; }
if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  B="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  [ "$B" = "main" ] || [ "$B" = "master" ] && { echo "NOTE: sur '$B' (Ctrl-C pour annuler)."; sleep 2; }
fi

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "handleMultiDelete" not in s:
    print("déjà à jour (bouton déjà retiré)"); sys.exit(0)

# 1) retirer le const label + le handler handleMultiDelete (garder isBinAction)
old1 = (
'            const label = deleteLabel(selectedCount, selectedNodes);\n'
'            const isBinAction =\n'
'              selectedNodes.length > 0 &&\n'
'              (selectedNodes[0].path === `${APP_ROOT}/bin` ||\n'
'                selectedNodes[0].path.startsWith(`${APP_ROOT}/bin/`));\n'
'\n'
'            async function handleMultiDelete() {\n'
'              await deleteNodes(selectedNodes);\n'
'            }\n'
'\n'
'            return (\n'
)
new1 = (
'            const isBinAction =\n'
'              selectedNodes.length > 0 &&\n'
'              (selectedNodes[0].path === `${APP_ROOT}/bin` ||\n'
'                selectedNodes[0].path.startsWith(`${APP_ROOT}/bin/`));\n'
'\n'
'            return (\n'
)
assert s.count(old1) == 1, "ancre const/handler introuvable"
s = s.replace(old1, new1)

# 2) retirer le bouton TEXTE (handleMultiDelete)
old2 = (
'                <button\n'
'                  type="button"\n'
'                  onClick={handleMultiDelete}\n'
'                  disabled={selectedCount === 0}\n'
'                  title={label}\n'
'                  className={\n'
'                    isBinAction\n'
'                      ? "shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs"\n'
'                      : "shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs"\n'
'                  }\n'
'                >\n'
'                  <Trash2 className="h-3.5 w-3.5" aria-hidden />\n'
'                  <span>{label}</span>\n'
'                </button>\n'
'\n'
)
assert s.count(old2) == 1, "ancre bouton texte introuvable"
s = s.replace(old2, "")

p.write_text(s, encoding="utf-8")
print("bouton texte + handler + label retirés")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY — pas de typecheck/commit"; exit 0; fi
echo "typecheck web…"
pnpm --filter web typecheck > /tmp/tc.log 2>&1 || { echo "KO:"; grep -nE "error TS" /tmp/tc.log | head; tail -4 /tmp/tc.log; exit 1; }
echo OK
[ -z "$(git status --porcelain)" ] && { echo "rien à committer"; exit 0; }
git add -A && git commit -m "refactor(finder): retirer le bouton corbeille multi-sélection redondant (garder icône + confirmation)" && echo "commit $(git rev-parse --short HEAD)"