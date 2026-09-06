#!/usr/bin/env bash
#
# AKFC — Perso par admin, INCRÉMENT B1 (backend).
#
# `personal-space` s'aplatit sur le sous-espace de l'admin CONNECTÉ :
#   - grille (adapter.list = getTree depth1 sur personal-space) → on lit en
#     réalité `personal-space/<slug>-<userId>` → il ne voit QUE son contenu ;
#   - arbre racine (getTree appRoot) → le nœud personal-space affiche
#     directement le contenu de son sous-espace, les sous-espaces des AUTRES
#     admins sont masqués.
# Le physique reste `personal-space/<slug>-<userId>/…` (identité intacte) — c'est
# un aplatissement d'AFFICHAGE + un filtre de confidentialité.
#
# Increment B2 (à suivre) : le fil d'Ariane masquera le segment <slug>-<userId>
# quand on descend dans un sous-dossier (pour que l'illusion tienne en profondeur).
#
# PRÉREQUIS : garde ensureContentRoots (apply-fix-content-roots-guard) appliquée.
# Périmètre : BACKEND. Un aller-retour = un typecheck.
# Usage : bash apply-perso-scope-B1-backend.sh
#
set -euo pipefail

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
NEW="packages/backend/src/modules/storage/scopePersoSpace.service.ts"
if [ -f "$NEW" ]; then echo "— déjà appliqué (scopePersoSpace.service.ts existe)"; exit 0; fi
if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

cat > "$NEW" <<'EOF'
import type { StorageFolderNode, StorageNode } from "@contracts/storage";

/**
 * Aplatissement d'AFFICHAGE du conteneur `personal-space` sur le sous-espace de
 * l'utilisateur courant : dans l'arbre, `personal-space` montre directement le
 * contenu de `personal-space/<slug>-<userId>` (illusion « ce dossier est mon
 * espace ») et masque les sous-espaces des autres admins. Le physique reste
 * intact — c'est purement de l'affichage.
 */
export function scopePersoSpaceInTree(
  root: StorageFolderNode,
  appRoot: string,
  userId: string,
): StorageFolderNode {
  const persoContainer = `${appRoot}/personal-space`;
  const rebuild = (n: StorageNode): StorageNode => {
    if (n.type !== "folder") return n;
    if (n.path === persoContainer) {
      const mine = (n.children ?? []).find(
        (c): c is StorageFolderNode =>
          c.type === "folder" && c.path.endsWith(`-${userId}`),
      );
      return {
        ...n,
        children: mine?.children ?? [],
        hasChildren: mine?.hasChildren ?? (mine?.children?.length ?? 0) > 0,
      };
    }
    if (!n.children) return n;
    return { ...n, children: n.children.map(rebuild) };
  };
  return rebuild(root) as StorageFolderNode;
}
EOF
echo "  créé  $NEW"

python3 - <<'PY'
import pathlib
R = "packages/backend/src/modules/storage/router.ts"
s = pathlib.Path(R).read_text(encoding="utf-8")

def sub(old, new, label):
    global s
    n = s.count(old)
    assert n == 1, f"ancre {label} : attendu 1, trouvé {n}"
    s = s.replace(old, new)

# 1) imports
sub(
    'import { resolveGroupBaseFolder } from "@backend/modules/media/services/resolveGroupBaseFolder.service";',
    'import { resolveGroupBaseFolder } from "@backend/modules/media/services/resolveGroupBaseFolder.service";\n'
    'import { resolvePersoBaseFolder } from "@backend/modules/media/services/resolvePersoBaseFolder.service";\n'
    'import { scopePersoSpaceInTree } from "@backend/modules/storage/scopePersoSpace.service";',
    "imports perso",
)

# 2) getTree : redirection de lecture quand on demande le conteneur personal-space
sub(
    '''      const reader = backend;
      const result = await reader.getTree({
        path: input.path,
        depth: input.depth,
      });
      // Corbeille = feuille''',
    '''      const reader = backend;
      // Perso : quand la grille demande le conteneur personal-space
      // (adapter.list = getTree depth1), on lit en réalité le sous-espace de
      // l'utilisateur courant → il ne voit QUE son contenu (privé + illusion).
      const persoContainer = `${ctx.appRoot}/personal-space`;
      let readPath = input.path;
      if (input.path === persoContainer) {
        try {
          readPath = await resolvePersoBaseFolder({
            prisma: ctx.prisma,
            appRoot: ctx.appRoot,
            userId: ctx.user.id,
          });
        } catch {
          readPath = input.path;
        }
      }
      const result = await reader.getTree({
        path: readPath,
        depth: input.depth,
      });
      // Corbeille = feuille''',
    "getTree redirect",
)

# 3) getTree : aplatissement dans l'arbre racine (masque les autres admins)
sub(
    '''      }
      // Nom EXACT des dossiers d'espace de groupe (accents) — c'est getTree
      // que lit l'adapter du finder (et le picker).
      return {
        ...result,
        root: await applyGroupSpaceNamesToTree(result.root, ctx.prisma),
      };''',
    '''      }
      // Perso : dans l'arbre racine, aplatir personal-space sur le contenu du
      // sous-espace de l'utilisateur courant (masque les autres admins).
      if (input.path === ctx.appRoot) {
        result.root = scopePersoSpaceInTree(
          result.root,
          ctx.appRoot,
          ctx.user.id,
        );
      }
      // Nom EXACT des dossiers d'espace de groupe (accents) — c'est getTree
      // que lit l'adapter du finder (et le picker).
      return {
        ...result,
        root: await applyGroupSpaceNamesToTree(result.root, ctx.prisma),
      };''',
    "getTree flatten",
)

pathlib.Path(R).write_text(s, encoding="utf-8")
print("B1 appliqué au router.")
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
if git commit -m "feat(finder): personal-space aplati sur le sous-espace de l'admin connecté (privé + illusion)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "→ Pense à: pnpm clean puis relance le dev."
else echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1; fi