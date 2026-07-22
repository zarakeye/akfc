#!/usr/bin/env bash
#
# fix_cloudinary_rename_target.sh
#
# `cloudinaryStorageAdapter.move` délègue tout à `moveService`, dont le
# contrat est « déplacer dans un dossier ». Pour s'y conformer, l'adapter
# retire le dernier segment du chemin cible — puis `moveService` reconstruit
# le nom du fichier À PARTIR DE LA SOURCE :
#
#     const newPath = moveFileIntoFolder(source.fullPath, target.fullPath);
#     // → `${folderPath}/${filePath.split('/').pop()}`
#
# Le nouveau nom est donc jeté en route, et `renameAsset` reçoit une cible
# identique à son origine. Cet adapter ne sait exprimer qu'un déplacement à
# nom constant — jamais un renommage. L'adapter R2, lui, passe
# `operation.target.path` tel quel : d'où l'asymétrie entre les deux.
#
# Le contrôle de collision de `storage.rename` masquait tout cela, puisqu'il
# refusait chaque nom avant d'arriver ici.
#
# Correctif : pour une source FICHIER, l'adapter appelle directement la
# primitive de renommage avec le chemin cible COMPLET. C'est une
# généralisation stricte — un déplacement sans changement de nom produit le
# même appel qu'avant (`moveFileIntoFolder` construisait précisément cela).
# Les sources DOSSIER continuent de passer par `moveService`, dont la
# sémantique folder→folder attend bien le parent.
#
# `renameAsset` cesse d'être privé au module : il porte l'invalidation du
# cache de resources et la mise à jour du dossier-entité (dynamic folders),
# qu'il ne faut surtout pas réimplémenter ailleurs.
#
# Usage :
#   bash fix_cloudinary_rename_target.sh
#   AKFC_APPLY_ONLY=1 bash fix_cloudinary_rename_target.sh
#
set -euo pipefail

MOVE_SVC="packages/backend/src/modules/cloudinary/services/move.service.ts"
ADPT="packages/backend/src/modules/storage/adapters/cloudinary/cloudinaryStorageAdapter.ts"

# ── Prérequis ───────────────────────────────────────────────────────────────
[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }
for f in "$MOVE_SVC" "$ADPT"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ──────────
if grep -q "Un FICHIER ne passe pas par" "$ADPT"; then
  echo "✓ déjà appliqué (marqueur présent dans $ADPT) — rien à faire"
  exit 0
fi

python3 - <<'PY'
import io

def edit(path, old, new):
    with io.open(path, encoding='utf-8') as fh:
        src = fh.read()
    n = src.count(old)
    assert n == 1, "ancre %d fois dans %s :\n%s" % (n, path, old[:120])
    with io.open(path, 'w', encoding='utf-8') as fh:
        fh.write(src.replace(old, new))
    print("  ~ %s" % path.rsplit('/', 1)[-1])

MOVE_SVC = "packages/backend/src/modules/cloudinary/services/move.service.ts"
ADPT = "packages/backend/src/modules/storage/adapters/cloudinary/cloudinaryStorageAdapter.ts"

# ── 1/3 : exposer renameAsset ───────────────────────────────────────────────
# Ancre au DÉBUT DE LIGNE : sans le saut de ligne, l'ancre serait incluse
# dans son propre résultat et une seconde passe produirait « export export ».
edit(MOVE_SVC, """
async function renameAsset(""",
"""
export async function renameAsset(""")

# ── 2/3 : l'importer dans l'adapter ─────────────────────────────────────────
edit(ADPT, """import { moveService } from "@backend/modules/cloudinary/services/move.service";""",
"""import {
  moveService,
  renameAsset,
} from "@backend/modules/cloudinary/services/move.service";""")

# ── 3/3 : router les fichiers vers renameAsset (DERNIER fichier écrit) ──────
edit(ADPT, """      const intent: CloudinaryMoveIntent = {
        source:
          operation.source.type === "file"
            ? { type: "file", fullPath: operation.source.path }
            : { type: "folder", fullPath: operation.source.path },
        target: { type: "folder", fullPath: targetParentPath },
      };

      await moveService(intent);""",
"""      if (operation.source.type === "file") {
        // ⚠️ Un FICHIER ne passe pas par `moveService`.
        //
        // Sa branche file→folder reconstruit le nom depuis la source
        // (`moveFileIntoFolder`), ce qui écrase le nom cible : un renommage
        // devenait un rename de l'asset sur lui-même. On appelle donc
        // directement la primitive, avec le chemin cible COMPLET.
        //
        // Généralisation stricte : quand le nom ne change pas — le cas d'un
        // déplacement — `operation.target.path` vaut exactement ce que
        // `moveFileIntoFolder` construisait. Rien ne change pour le DnD.
        const info = await getAssetInfo(operation.source.path);
        await renameAsset(
          operation.source.path,
          operation.target.path,
          info.resource_type,
        );
      } else {
        // Les DOSSIERS gardent `moveService` : sa branche folder→folder
        // concatène elle-même le nom du dossier au parent, d'où le
        // `targetParentPath` calculé plus haut.
        const intent: CloudinaryMoveIntent = {
          source: { type: "folder", fullPath: operation.source.path },
          target: { type: "folder", fullPath: targetParentPath },
        };

        await moveService(intent);
      }""")
PY

echo "✓ 3 substitutions appliquées"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → ni typecheck ni commit."
  exit 0
fi

# ── Typechecks, séparément ──────────────────────────────────────────────────
if ! pnpm --filter backend typecheck; then
  echo "✗ typecheck backend — rien n'est commité"
  exit 1
fi

if ! pnpm typecheck; then
  echo "✗ typecheck web — rien n'est commité"
  exit 1
fi

git add -A
git commit -m "fix(storage): l'adapter Cloudinary respecte le nom cible d'un fichier

moveService reconstruit le nom du fichier depuis la source
(moveFileIntoFolder), ce qui ecrasait le nom cible : un renommage
se traduisait par un rename de l'asset sur lui-meme. Les fichiers
appellent desormais renameAsset avec le chemin cible complet.

Les dossiers restent sur moveService, dont la semantique
folder->folder attend bien le dossier parent."

echo "✓ commité"
git log -1 --oneline