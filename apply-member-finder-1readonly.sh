#!/usr/bin/env bash
#
# AKFC — Finder membre (b'), BRIQUE 1 : mode `readOnly`.
#
# Ajoute une prop `readOnly` au `Finder` qui masque TOUTES les actions mutantes,
# en gardant navigation + arbre + grille + preview + recherche + filtre de
# statut + bascule de vue (toute la richesse visuelle). Concrètement :
#   - on n'entre plus en multi-sélection ;
#   - le bloc multi-sélection (StatusRadioGroup + suppression groupée) est masqué ;
#   - le bouton « Supprimer » de la barre est masqué.
# (Le menu contextuel du Finder n'est que du TRI — non mutant, conservé. Les
#  gardes backend refusent de toute façon toute mutation d'un membre.)
#
# Réutilisable pour le finder membre (brique 4). Front NON testé → valider.
# Pas de migration. Indépendant.
# Usage : bash apply-member-finder-1-readonly.sh
#         AKFC_APPLY_ONLY=1 bash apply-member-finder-1-readonly.sh   (clone)
#
set -euo pipefail

F="apps/web/src/features/finder-core/components/Finder.tsx"

if [ ! -f "package.json" ] || [ ! -f "$F" ]; then
  echo "ERREUR: lance depuis la racine ($F attendu)." >&2
  exit 1
fi

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "ERREUR: tu es sur '$BRANCH'. Le chantier va sur sa branche." >&2
    echo "  git switch feat/groupes-collaboratifs" >&2
    exit 1
  fi
fi

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "readOnly" in s:
    print("Finder déjà à jour (readOnly présent)"); sys.exit(0)

def sub(old, new, label):
    assert s.count(old) == 1, f"ancre introuvable/multiple: {label}"
    return s.replace(old, new)

# 1) prop dans le type
s = sub(
    "  onPickToggle?: (node: FinderNode) => void;\n};",
    "  onPickToggle?: (node: FinderNode) => void;\n"
    "  /**\n"
    "   * Mode MEMBRE / lecture seule : masque toutes les actions mutantes\n"
    "   * (multi-sélection, changement de statut, suppression). Navigation,\n"
    "   * arbre, grille, preview, recherche, filtre et bascule de vue restent.\n"
    "   */\n"
    "  readOnly?: boolean;\n};",
    "prop type")

# 2) destructuration
s = sub(
    "  onPickToggle,\n}: Props): JSX.Element {",
    "  onPickToggle,\n  readOnly = false,\n}: Props): JSX.Element {",
    "destructure")

# 3) ne pas entrer en multi-sélection en lecture seule
s = sub(
    "    enterMultiSelect(node.id);",
    "    if (readOnly) return;\n    enterMultiSelect(node.id);",
    "enterMultiSelect guard")

# 4) bloc multi-sélection (statut + suppression groupée) masqué
s = sub(
    "        {multiSelectActive &&\n          (() => {",
    "        {!readOnly &&\n          multiSelectActive &&\n          (() => {",
    "multiselect block")

# 5) bouton Supprimer de la barre masqué
s = sub(
    "        {(() => {\n"
    "          // Ce bouton naviguait vers la corbeille.",
    "        {!readOnly && (() => {\n"
    "          // Ce bouton naviguait vers la corbeille.",
    "toolbar delete")

p.write_text(s, encoding="utf-8")
print("Finder patché (mode readOnly)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"
  exit 0
fi

echo "typecheck (backend + web, direct)…"
if ! { pnpm --filter backend typecheck && pnpm --filter web typecheck; } > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
git add -A
if git commit -m "feat(finder): mode readOnly (masque les actions mutantes) — socle du finder membre" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "ℹ️  readOnly par défaut = false → le Finder admin est INCHANGÉ. Brique suivante : query + adaptateur membre."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi