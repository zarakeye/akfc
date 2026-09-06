#!/usr/bin/env bash
#
# AKFC — Corbeille : getTree n'expose plus le sous-arbre `.trash` au finder.
#
# `getTree` lit le backend physique Y COMPRIS `bin/.trash/<uuid>/…`. bin-leaf
# empêche l'arbre de le RENDRE, mais la donnée transite. On coupe à la source :
# `getTree` élague les enfants du nœud `bin` → la corbeille reste une FEUILLE.
#
# Sûr : la vue plate lit `trash.listBin` (pas getTree) ; le drill-down passe par
# `list` (intact). Rien n'est perdu.
#
# ⚠️  Si tu as lancé la version précédente (échec typecheck, non commitée) :
#     git checkout -- packages/backend/src/modules/storage/router.ts
#     avant de relancer celle-ci.
# ⚠️  APRÈS : pnpm clean + relance le dev (le HMR recharge mal les gros
#     changements d'arbre — ton piège .next).
#
# Périmètre : BACKEND. Un aller-retour = un typecheck.
# Usage : bash apply-finder-bin-strip-tree.sh
#
set -euo pipefail

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
R="packages/backend/src/modules/storage/router.ts"
[ -f "$R" ] || { echo "ERREUR: $R introuvable." >&2; exit 1; }
if grep -q 'stripBinSubtree' "$R" 2>/dev/null; then
  echo "— 'stripBinSubtree' déjà présent. Si c'est la version cassée non commitée :" >&2
  echo "    git checkout -- $R   puis relance." >&2
  exit 0
fi
if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

python3 - "$R" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

def sub(old, new, label):
    global s
    n = s.count(old)
    assert n == 1, f"ancre {label} : attendu 1, trouve {n}"
    s = s.replace(old, new)

# 1) Importer le type StorageFolderNode (bloc @contracts/storage existant).
sub(
    'import {\n'
    '  storageProviderSchema,\n'
    '  storageMoveIntentSchema,\n'
    '  createR2UploadAuthorizationSchema,\n'
    '} from "@contracts/storage";',
    'import {\n'
    '  storageProviderSchema,\n'
    '  storageMoveIntentSchema,\n'
    '  createR2UploadAuthorizationSchema,\n'
    '  type StorageFolderNode,\n'
    '} from "@contracts/storage";',
    "import StorageFolderNode",
)

# 2) Helper module-scope, typé avec le VRAI type (union folder/file → on narrow).
sub(
    r'const EXTENSION_PATTERN = /\.[A-Za-z0-9]{1,8}$/;',
    r'''const EXTENSION_PATTERN = /\.[A-Za-z0-9]{1,8}$/;

/**
 * La corbeille est une FEUILLE dans l'arbre du finder : on n'expose jamais son
 * sous-arbre physique `.trash/<uuid>/…`. On elague recursivement les enfants du
 * noeud dont le chemin est exactement `binPath`. (La vue plate lit trash.listBin,
 * le drill-down passe par `list` — aucun ne depend de getTree.)
 */
function stripBinSubtree(node: StorageFolderNode, binPath: string): void {
  for (const child of node.children ?? []) {
    if (child.type !== "folder") continue;
    if (child.path === binPath) {
      child.children = [];
      child.hasChildren = false;
    } else {
      stripBinSubtree(child, binPath);
    }
  }
}''',
    "helper stripBinSubtree",
)

# 3) Appel dans getTree, juste apres la lecture du backend.
sub(
    '''      const result = await reader.getTree({
        path: input.path,
        depth: input.depth,
      });
''',
    '''      const result = await reader.getTree({
        path: input.path,
        depth: input.depth,
      });
      // Corbeille = feuille : jamais de `.trash` dans l'arbre du finder.
      stripBinSubtree(result.root, `${ctx.appRoot}/bin`);
''',
    "appel dans getTree",
)

p.write_text(s, encoding="utf-8")
print("Elagage bin applique a getTree.")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY — pas de typecheck ni commit"; exit 0; fi
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then TC="check"; else TC="typecheck"; fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck ECHOUE — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "typecheck OK"
git add -A
if git commit -m "fix(finder): getTree n'expose plus le sous-arbre .trash (corbeille = feuille)" > /tmp/akfc_commit.log 2>&1; then
  echo "commit $(git rev-parse --short HEAD)"
  echo "-> Pense a: pnpm clean puis relance le dev."
else echo "commit echoue :"; head -10 /tmp/akfc_commit.log; exit 1; fi