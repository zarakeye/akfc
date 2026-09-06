#!/usr/bin/env bash
#
# AKFC — Perso par admin, INCRÉMENT B2 (frontend, fil d'Ariane).
#
# Complète B1 : quand l'admin descend dans un sous-dossier de son espace perso,
# le chemin physique contient `personal-space/<slug>-<userId>/…`. Le fil d'Ariane
# masque ce segment `<slug>-<userId>` → il affiche « Espace personnel » puis
# directement le sous-dossier (l'illusion tient en profondeur). La navigation
# reste sur le chemin physique réel (le segment est juste caché à l'affichage).
#
# PRÉREQUIS : B1 (scopePersoSpace) + libellés breadcrumb + noms EN au singulier.
# Périmètre : FRONTEND (Breadcrumb.tsx). Un aller-retour = un typecheck.
# Usage : bash apply-perso-scope-B2-breadcrumb.sh
#
set -euo pipefail

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
BC="apps/web/src/features/finder-core/components/Breadcrumb.tsx"
[ -f "$BC" ] || { echo "ERREUR: $BC introuvable." >&2; exit 1; }
if grep -q 'isPersoSpaceFolder' "$BC" 2>/dev/null; then
  echo "— déjà appliqué (isPersoSpaceFolder présent dans Breadcrumb)"; exit 0
fi
if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

python3 - "$BC" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

def sub(old, new, label):
    global s
    n = s.count(old)
    assert n == 1, f"ancre {label} : attendu 1, trouvé {n}"
    s = s.replace(old, new)

# 1) import du prédicat
sub(
    "import { buildPathSegments } from '@features/finder-core/utils/path';",
    "import { buildPathSegments } from '@features/finder-core/utils/path';\n"
    "import { isPersoSpaceFolder } from '@features/finder-core/utils/spaceFolderKind';",
    "import isPersoSpaceFolder",
)

# 2) filtrer le segment du sous-espace perso avant le mapping des libellés
sub(
    "  segments = segments.map((sg) => ({\n"
    "    ...sg,\n"
    "    // Priorité alignée sur le back",
    "  // Perso : masquer le segment du sous-espace `<slug>-<userId>` — l'admin\n"
    "  // ne voit que « Espace personnel » puis son contenu (illusion d'espace\n"
    "  // unique). La navigation reste sur le chemin physique réel.\n"
    "  segments = segments.filter((sg) => !isPersoSpaceFolder(sg.path));\n"
    "  segments = segments.map((sg) => ({\n"
    "    ...sg,\n"
    "    // Priorité alignée sur le back",
    "filtre segment perso",
)

p.write_text(s, encoding="utf-8")
print("B2 appliqué.")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY — pas de typecheck ni commit"; exit 0; fi
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then TC="check"; else TC="typecheck"; fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"
git add -A
if git commit -m "feat(finder): fil d'Ariane masque le sous-espace perso (illusion d'espace unique en profondeur)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "→ Pense à: pnpm clean puis relance le dev."
else echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1; fi