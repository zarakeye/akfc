#!/usr/bin/env bash
#
# ═══════════════════════════════════════════════════════════════════════════
#  AKFC — T0 : mergeFolderTrees perd la frontière de profondeur
# ═══════════════════════════════════════════════════════════════════════════
#
#  CONTEXTE
#  --------
#  Le contrat `StorageFolderNode` distingue :
#     children === undefined  → « pas chargé » (profondeur max atteinte)
#     children === []         → « vide pour de vrai »
#
#  `VirtualStorage.getTree` fusionne l'arbre Cloudinary et l'arbre R2 via
#  `mergeFolderTrees`. Or celle-ci fait, inconditionnellement :
#
#     children: [...mergedFolders, ...aFiles, ...bFiles]
#     hasChildren: mergedFolders.length + aFiles.length + bFiles.length > 0
#
#  Donc pour un dossier présent dans les DEUX backends et situé à la
#  frontière de profondeur (children undefined des deux côtés), le merge
#  produit `children: []` + `hasChildren: false`. La TreeView conclut
#  « dossier définitivement vide » et refuse de le déplier. Le hint
#  `hasChildren` posé par `mapClientFolderTreeToStorageNode` (qui le
#  remplit correctement à depth 0) est jeté.
#
#  Aujourd'hui le bug ne frappe que les dossiers ayant du contenu des DEUX
#  côtés (images Cloudinary + docs R2) — typiquement `general`.
#  Il deviendra SYSTÉMATIQUE au chantier « arbre sans strate de statut » :
#  le pliage fait converger `pending/cours` et `published/cours` sur le même
#  path logique, donc « présent des deux côtés » devient le cas NORMAL.
#  → correction préalable obligatoire.
#
#  CE QUE FAIT CE SCRIPT
#  ---------------------
#   1. Réécrit `mergeFolderTrees` pour préserver la sémantique de frontière.
#   2. Retire 3 traces de debug laissées dans le chemin de lecture de l'arbre
#      (`[tree:built]`, `[tree:mapped]`, `[tree:truncated]`) — elles
#      sérialisent l'arbre ENTIER en JSON à chaque appel juste pour un
#      `.includes("taolu-multi-styles")`.
#
#  AUCUNE migration Prisma. Aucun changement de contrat. `git revert` suffit.
#
#  USAGE
#  -----
#     bash step_t0_merge_frontier.sh
#
#  Variable d'échappement (usage Claude, sur clone) :
#     AKFC_APPLY_ONLY=1 bash step_t0_merge_frontier.sh
#        → applique les édits, saute typecheck + commit
#
set -euo pipefail

MARKER="Frontière de profondeur : ne JAMAIS matérialiser"

echo "▶ AKFC — T0 : frontière de profondeur dans mergeFolderTrees"

# ─── Garde : on est bien à la racine du monorepo ? ─────────────────────────
if [ ! -f "pnpm-workspace.yaml" ] || [ ! -d "packages/backend" ]; then
  echo "✗ À lancer depuis la RACINE du monorepo AKFC (pnpm-workspace.yaml introuvable)."
  exit 1
fi

VS="packages/backend/src/modules/storage/virtualStorage.ts"
GT="packages/backend/src/modules/cloudinary/services/getCloudinaryFolderTree.service.ts"
AD="packages/backend/src/modules/storage/adapters/cloudinary/cloudinaryStorageAdapter.ts"

for f in "$VS" "$GT" "$AD"; do
  [ -f "$f" ] || { echo "✗ Fichier introuvable : $f"; exit 1; }
done

# ─── Garde anti-double-application ────────────────────────────────────────
if grep -q "$MARKER" "$VS"; then
  echo "✓ Déjà appliqué (marqueur présent dans virtualStorage.ts). Rien à faire."
  exit 0
fi

# ─── Édits ────────────────────────────────────────────────────────────────
python3 - <<'PYEOF'
import io, sys

def sub_once(path, old, new, label):
    with io.open(path, encoding="utf-8") as f:
        s = f.read()
    n = s.count(old)
    assert n == 1, f"[{label}] ancre trouvée {n} fois dans {path} (attendu 1)"
    with io.open(path, "w", encoding="utf-8") as f:
        f.write(s.replace(old, new, 1))
    print(f"  ✓ {label}")

VS = "packages/backend/src/modules/storage/virtualStorage.ts"
GT = "packages/backend/src/modules/cloudinary/services/getCloudinaryFolderTree.service.ts"
AD = "packages/backend/src/modules/storage/adapters/cloudinary/cloudinaryStorageAdapter.ts"

# ── 1. mergeFolderTrees ───────────────────────────────────────────────────
old = '''/**
 * Fusionne deux folder trees (racines partagées) en un seul arbre logique.
 *
 * Algo récursif : pour chaque sous-folder, on cherche les occurrences
 * dans les deux côtés et on les merge récursivement. Les files sont
 * concaténés (chaque file appartient à un seul backend).
 */
function mergeFolderTrees(
  a: StorageFolderNode,
  b: StorageFolderNode
): StorageFolderNode {
  const childrenA = a.children ?? [];
  const childrenB = b.children ?? [];
'''

new = '''/**
 * Fusionne deux folder trees (racines partagées) en un seul arbre logique.
 *
 * Algo récursif : pour chaque sous-folder, on cherche les occurrences
 * dans les deux côtés et on les merge récursivement. Les files sont
 * concaténés (chaque file appartient à un seul backend).
 *
 * ─── Frontière de profondeur : ne JAMAIS matérialiser un `undefined` ─────
 *
 * Le contrat `StorageFolderNode` distingue deux états très différents :
 *
 *   children === undefined  → « non chargé » (profondeur max de getTree)
 *   children === []         → « vide pour de vrai »
 *
 * `mapClientFolderTreeToStorageNode` respecte scrupuleusement cette
 * distinction : à depth 0 il renvoie `{ children: undefined, hasChildren }`
 * pour que la TreeView sache qu'il reste quelque chose à charger.
 *
 * La version précédente de ce merge écrasait le premier état par le second :
 *
 *   children: [...mergedFolders, ...aFiles, ...bFiles]   // → [] si rien chargé
 *   hasChildren: mergedFolders.length + ... > 0          // → false
 *
 * Résultat : un dossier présent dans les DEUX backends et situé à la
 * frontière de profondeur ressortait `{ children: [], hasChildren: false }`.
 * La TreeView le traitait comme définitivement vide → impossible à déplier,
 * son contenu invisible. Le hint `hasChildren` des deux côtés était perdu.
 *
 * Règles rétablies ici :
 *   - `children` n'est matérialisé que si AU MOINS un côté l'a chargé.
 *     Si aucun des deux n'a chargé, on propage `undefined`.
 *   - `hasChildren` est l'OU des deux hints, jamais recalculé à la baisse.
 *     Un hint à `true` d'un côté survit même si l'autre côté est vide.
 *
 * ⚠️ Ce point devient critique avec le chantier « arbre sans strate de
 * statut » : le pliage fait converger `pending/<x>` et `published/<x>` sur
 * un même path logique, donc « présent des deux côtés » y est le cas NORMAL
 * et non plus l'exception.
 */
function mergeFolderTrees(
  a: StorageFolderNode,
  b: StorageFolderNode
): StorageFolderNode {
  // Hint de présence d'enfants : c'est un OU, jamais un recalcul. Un côté
  // qui sait qu'il a des enfants (sans les avoir chargés) fait autorité.
  const hasChildrenHint = (a.hasChildren ?? false) || (b.hasChildren ?? false);

  const aLoaded = a.children !== undefined;
  const bLoaded = b.children !== undefined;

  // Aucun des deux n'a chargé ses enfants → on est à la frontière de
  // profondeur. On propage `undefined` (et surtout PAS `[]`), avec le hint.
  if (!aLoaded && !bLoaded) {
    return {
      type: "folder",
      name: a.name,
      path: a.path,
      hasChildren: hasChildrenHint,
    };
  }

  const childrenA = a.children ?? [];
  const childrenB = b.children ?? [];
'''
sub_once(VS, old, new, "mergeFolderTrees — garde de frontière")

old = '''  return {
    type: "folder",
    name: a.name,
    path: a.path,
    children: [...mergedFolders, ...aFiles, ...bFiles],
    hasChildren: mergedFolders.length + aFiles.length + bFiles.length > 0,
  };
}'''

new = '''  const children = [...mergedFolders, ...aFiles, ...bFiles];

  return {
    type: "folder",
    name: a.name,
    path: a.path,
    children,
    // Le hint des deux côtés prime ; `children.length > 0` n'est qu'un
    // repli quand ni a ni b ne portaient de hint explicite.
    hasChildren: hasChildrenHint || children.length > 0,
  };
}'''
sub_once(VS, old, new, "mergeFolderTrees — retour")

# ── 2. Traces de debug ────────────────────────────────────────────────────
old = '''    console.log("[tree:built]", normalizedPath, "taolu?", JSON.stringify(finderTree).includes("taolu-multi-styles"));

    const mapped = mapCloudinaryFolderToClient(finderTree);
    console.log("[tree:mapped]", normalizedPath, "taolu?", JSON.stringify(mapped).includes("taolu-multi-styles"));
    
    return mapped;'''

new = '''    return mapCloudinaryFolderToClient(finderTree);'''
sub_once(GT, old, new, "getCloudinaryFolderTree — traces [tree:built]/[tree:mapped]")

old = '''      const root = mapClientFolderTreeToStorageNode(tree, depth);

      console.log(
        "[tree:truncated]",
        options.path,
        "depth=",
        depth,
        "taolu?",
        JSON.stringify(root).includes("taolu-multi-styles"),
        "tchoy?",
        JSON.stringify(root).includes("tchoy-lee-fut"),
      );

'''
new = '''      const root = mapClientFolderTreeToStorageNode(tree, depth);

'''
sub_once(AD, old, new, "cloudinaryStorageAdapter — trace [tree:truncated]")
PYEOF

echo "✓ Édits appliqués."

# ─── Escape-hatch (usage Claude sur clone) ────────────────────────────────
if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "⏭  AKFC_APPLY_ONLY=1 → typecheck et commit sautés."
  exit 0
fi

# ─── Tooling ──────────────────────────────────────────────────────────────
echo "▶ pnpm --filter backend typecheck"
pnpm --filter backend typecheck

echo "▶ pnpm typecheck (web)"
pnpm typecheck

# ─── Commit (uniquement si les typechecks passent, grâce à set -e) ────────
git add -A
git commit -m "fix(storage): mergeFolderTrees préserve la frontière de profondeur

VirtualStorage.getTree fusionne l'arbre Cloudinary et l'arbre R2 via
mergeFolderTrees. Celle-ci matérialisait inconditionnellement children en
tableau et recalculait hasChildren depuis sa longueur — écrasant ainsi la
distinction du contrat entre children:undefined (non chargé) et [] (vide).

Un dossier présent dans les deux backends et situé à la frontière de
profondeur ressortait donc {children: [], hasChildren: false} : la TreeView
le considérait comme vide et refusait de le déplier.

- children n'est matérialisé que si au moins un côté l'a chargé
- hasChildren est l'OU des deux hints, jamais recalculé à la baisse

Retire au passage 3 traces de debug du chemin de lecture de l'arbre, qui
sérialisaient l'arbre entier en JSON à chaque appel.

Prérequis du chantier « arbre sans strate de statut » : le pliage y fait
converger pending/<x> et published/<x> sur un même path logique, donc
« présent des deux côtés » devient le cas normal."

echo "✅ T0 appliqué, typechecké et commité."