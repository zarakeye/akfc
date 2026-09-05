#!/usr/bin/env bash
#
# AKFC — Finder : la CORBEILLE devient une FEUILLE dans l'arbre.
#
# Problème : `${APP_ROOT}/bin` a sa PROPRE vue plate (FinderBinRootView) dans la
# grille, mais l'arbre le traitait comme un dossier normal et dépliait
# `.trash/<uuid>/…` → une SECONDE arborescence de la corbeille, incohérente avec
# la vue plate. (cf. FinderTreeFolder : isTrashRootSkipNode / isTrashWrapperNode /
# auto-load / TrashMap.)
#
# Ce correctif rend `bin` NON dépliable dans l'arbre : pas de chevron, aucune
# descente. Le clic navigue déjà vers la vue plate (handleRowClick → onOpen). La
# machinerie `.trash` de l'arbre devient de ce fait injoignable (aucun nœud
# `.trash` n'y est plus rendu) — son RETRAIT à froid fera l'objet d'un script de
# nettoyage séparé (apply-finder-bin-trash-cleanup), pour ne pas mêler le
# correctif de comportement à un refactor plus large.
#
# Périmètre : FRONT uniquement, un seul fichier. Un aller-retour = un typecheck.
#
# Usage : bash apply-finder-bin-leaf.sh
#         AKFC_APPLY_ONLY=1 bash apply-finder-bin-leaf.sh   (Claude sur clone)
#
set -euo pipefail

FTF="apps/web/src/features/finder-core/components/FinderTreeFolder.tsx"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$FTF" ] || { echo "ERREUR: $FTF introuvable." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

python3 - "$FTF" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

if "isBinRoot" in s:
    print("— déjà appliqué (isBinRoot présent)"); sys.exit(0)

def sub(old, new, label):
    global s
    n = s.count(old)
    assert n == 1, f"ancre introuvable/multiple ({n}) : {label}"
    s = s.replace(old, new)

# 1) Déclarer isBinRoot juste après isRenamableRoot (même condition, intention
#    distincte : ici « feuille de l'arbre »).
sub(
    "  const isRenamableRoot = node.path === `${APP_ROOT}/bin`;\n",
    "  const isRenamableRoot = node.path === `${APP_ROOT}/bin`;\n"
    "  // La corbeille a sa PROPRE vue plate (FinderBinRootView) dans la grille.\n"
    "  // Dans l'arbre, elle reste une FEUILLE : pas de chevron, pas de descente\n"
    "  // dans `.trash/<uuid>/…` (ce qui produisait une 2e arborescence de la\n"
    "  // corbeille). Le clic navigue vers la vue plate (handleRowClick → onOpen).\n"
    "  const isBinRoot = node.path === `${APP_ROOT}/bin`;\n",
    "déclaration isBinRoot",
)

# 2) Pas de chevron pour la corbeille (donc pas de repli/dépli possible).
sub(
    "  const showChevron = hasChildren;",
    "  const showChevron = hasChildren && !isBinRoot;",
    "showChevron",
)

# 3) Ne jamais rendre les enfants de la corbeille dans l'arbre (ceinture +
#    bretelles : sans chevron isOpen reste faux, mais un openPaths résiduel
#    pourrait subsister d'une session précédente).
sub(
    "      {isOpen && displayChildren && displayChildren.length > 0 && (",
    "      {!isBinRoot && isOpen && displayChildren && displayChildren.length > 0 && (",
    "rendu des enfants",
)

p.write_text(s, encoding="utf-8")
print("FinderTreeFolder : corbeille rendue en feuille (arbre)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck ni commit"
  exit 0
fi

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  echo "aucune modification — rien à typechecker/committer"
  exit 0
fi

if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then
  TC="check"
else
  TC="typecheck"
fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  echo "----- fin du log -----"; tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

git add -A
if git commit -m "fix(finder): corbeille en feuille dans l'arbre (retrait de la 2e arborescence)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi