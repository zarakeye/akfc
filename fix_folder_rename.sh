#!/usr/bin/env bash
#
# fix_folder_rename.sh
#
# Renommer un DOSSIER, en arbre comme en grille.
#
# Trois défauts se cumulaient — le premier suffisait à rendre l'opération
# silencieusement inopérante :
#
# 1. BACKEND, même bug que pour les fichiers. La branche folder→folder de
#    `moveService` reconstruit le nom depuis la SOURCE :
#
#        const folderName = source.fullPath.split("/").pop();
#        const targetPrefix = `${target.fullPath}/${folderName}`;
#
#    Comme l'adapter lui passe le dossier PARENT de la cible, `targetPrefix`
#    revient exactement au chemin d'origine, et `moveFolderRecursively`
#    renomme chaque asset sur lui-même. Aucune erreur, aucun effet. On appelle
#    donc `moveFolderRecursively` directement avec le chemin cible complet,
#    exactement comme on l'a fait pour les fichiers.
#
# 2. BACKEND, le registre `Folder` reste en arrière. `move` ne met à jour que
#    `MediaAsset` ; les lignes `Folder` (qui portent les dossiers VIDES, et
#    servent à les afficher) gardent leur ancien `fullPath`. Un dossier
#    renommé réapparaîtrait sous son ancien nom. On réécrit ces lignes par
#    substitution de préfixe, comme pour `MediaAsset`.
#
# 3. BACKEND, `storage.rename` réapplique une pseudo-extension aux dossiers.
#    `EXTENSION_PATTERN` est appliqué sans distinction de type : renommer un
#    dossier « photos.2024 » en « archives » produirait « archives.2024 ».
#    Un dossier n'a pas d'extension — on n'en réapplique plus.
#
# 4. FRONT, l'arbre n'offre pas l'action. `FinderTreeFolder` n'a qu'un
#    « Supprimer » dans son menu, là où `FinderTreeFile` a déjà les trois.
#    On lui ajoute Renommer + `RenameInput`, avec le double-clic sur le nom.
#    (La grille propose déjà Renommer sur les dossiers : son menu n'a jamais
#    filtré sur le type. Elle était juste sans effet, cf. point 1.)
#
# Usage :
#   bash fix_folder_rename.sh
#   AKFC_APPLY_ONLY=1 bash fix_folder_rename.sh
#
set -euo pipefail

MOVE_SVC="packages/backend/src/modules/cloudinary/services/move.service.ts"
ADPT="packages/backend/src/modules/storage/adapters/cloudinary/cloudinaryStorageAdapter.ts"
ROUTER="packages/backend/src/modules/storage/router.ts"
TREE_FOLDER="apps/web/src/features/finder-core/components/FinderTreeFolder.tsx"

# ── Prérequis ───────────────────────────────────────────────────────────────
[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }
for f in "$MOVE_SVC" "$ADPT" "$ROUTER" "$TREE_FOLDER"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done
grep -q "Un FICHIER ne passe pas par" "$ADPT" || {
  echo "✗ fix_cloudinary_rename_target.sh doit être appliqué d'abord"; exit 1; }

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ──────────
if grep -q "isRenamingFolder" "$TREE_FOLDER"; then
  echo "✓ déjà appliqué (marqueur présent dans $TREE_FOLDER) — rien à faire"
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

MOVE_SVC    = "packages/backend/src/modules/cloudinary/services/move.service.ts"
ADPT        = "packages/backend/src/modules/storage/adapters/cloudinary/cloudinaryStorageAdapter.ts"
ROUTER      = "packages/backend/src/modules/storage/router.ts"
TREE_FOLDER = "apps/web/src/features/finder-core/components/FinderTreeFolder.tsx"

# ── 1/6 backend : exposer moveFolderRecursively ─────────────────────────────
edit(MOVE_SVC, """
async function moveFolderRecursively(""",
"""
export async function moveFolderRecursively(""")

# ── 2/6 backend : l'importer dans l'adapter ─────────────────────────────────
edit(ADPT, """import {
  moveService,
  renameAsset,
} from "@backend/modules/cloudinary/services/move.service";""",
"""import {
  moveService,
  renameAsset,
  moveFolderRecursively,
} from "@backend/modules/cloudinary/services/move.service";""")

# ── 3/6 backend : la branche dossier vise le chemin cible complet ───────────
edit(ADPT, """      } else {
        // Les DOSSIERS gardent `moveService` : sa branche folder→folder
        // concatène elle-même le nom du dossier au parent, d'où le
        // `targetParentPath` calculé plus haut.
        const intent: CloudinaryMoveIntent = {
          source: { type: "folder", fullPath: operation.source.path },
          target: { type: "folder", fullPath: targetParentPath },
        };

        await moveService(intent);
      }""",
"""      } else {
        // ⚠️ Un DOSSIER non plus ne passe pas par `moveService`.
        //
        // Sa branche folder→folder reconstruit le nom du dossier depuis la
        // source, exactement comme `moveFileIntoFolder` le fait pour les
        // fichiers. Le nom cible était donc écrasé, `targetPrefix` revenait
        // au chemin d'origine, et chaque asset était renommé sur lui-même —
        // un renommage silencieusement sans effet.
        //
        // Généralisation stricte, ici encore : quand le nom ne change pas,
        // `operation.target.path` vaut `targetParentPath + '/' + nom`, soit
        // précisément ce que la branche construisait.
        void targetParentPath;
        await moveFolderRecursively(
          operation.source.path,
          operation.target.path,
        );
      }""")

# ── 4/6 backend : réécrire le registre Folder avec les assets ───────────────
edit(ADPT, """      } else {
        const oldPrefix = `${srcDb}/`;
        const newPrefix = `${dstDb}/`;
        await prisma.$executeRaw`
          UPDATE "MediaAsset"
          SET "fullPath" = ${newPrefix} || SUBSTRING("fullPath" FROM ${oldPrefix.length + 1}::int),
              "publicId" = ${newPrefix} || SUBSTRING("publicId" FROM ${oldPrefix.length + 1}::int),
              "status" = COALESCE(${nextStatus}, "status")
          WHERE "appRoot" = ${appRoot}
            AND "fullPath" LIKE ${escLike(oldPrefix) + "%"} ESCAPE '\\\\';
        `;
      }""",
"""      } else {
        const oldPrefix = `${srcDb}/`;
        const newPrefix = `${dstDb}/`;
        await prisma.$executeRaw`
          UPDATE "MediaAsset"
          SET "fullPath" = ${newPrefix} || SUBSTRING("fullPath" FROM ${oldPrefix.length + 1}::int),
              "publicId" = ${newPrefix} || SUBSTRING("publicId" FROM ${oldPrefix.length + 1}::int),
              "status" = COALESCE(${nextStatus}, "status")
          WHERE "appRoot" = ${appRoot}
            AND "fullPath" LIKE ${escLike(oldPrefix) + "%"} ESCAPE '\\\\';
        `;

        // ─── Registre `Folder` (table "CloudinaryFolder") ─────────────────
        //
        // Les dossiers Cloudinary n'existent pas comme entités : ils sont
        // dérivés des préfixes de public_id, et ce registre les persiste
        // pour pouvoir afficher les dossiers VIDES. Sans cette réécriture,
        // un dossier renommé garde sa ligne à l'ancien chemin et
        // réapparaît sous son ancien nom, vide, à côté du nouveau.
        //
        // Deux mises à jour : la descendance (substitution de préfixe),
        // puis le dossier lui-même (égalité stricte). Cet ordre est
        // volontaire — l'inverse ferait qu'un UPDATE de préfixe ne
        // retrouverait plus ses lignes filles, le parent ayant déjà changé.
        await prisma.$executeRaw`
          UPDATE "CloudinaryFolder"
          SET "fullPath" = ${newPrefix} || SUBSTRING("fullPath" FROM ${oldPrefix.length + 1}::int)
          WHERE "appRoot" = ${appRoot}
            AND "fullPath" LIKE ${escLike(oldPrefix) + "%"} ESCAPE '\\\\';
        `;
        await prisma.$executeRaw`
          UPDATE "CloudinaryFolder"
          SET "fullPath" = ${dstDb}
          WHERE "appRoot" = ${appRoot}
            AND "fullPath" = ${srcDb};
        `;
      }""")

# ── 5/6 backend : pas de pseudo-extension sur un dossier ───────────────────
edit(ROUTER, """      const extensionMatch = EXTENSION_PATTERN.exec(currentName);
      const extension = extensionMatch ? extensionMatch[0] : "";""",
"""      // Un DOSSIER n'a pas d'extension : « photos.2024 » renommé en
      // « archives » doit donner « archives », pas « archives.2024 ».
      const extensionMatch =
        input.type === "folder" ? null : EXTENSION_PATTERN.exec(currentName);
      const extension = extensionMatch ? extensionMatch[0] : "";""")

# ── 6/6 front : Renommer dans l'arbre (DERNIER fichier écrit) ───────────────
edit(TREE_FOLDER, """import ContextMenu, {
  type ContextMenuItem,
} from "@features/finder-core/components/ContextMenu";""",
"""import ContextMenu, {
  type ContextMenuItem,
} from "@features/finder-core/components/ContextMenu";
import { RenameInput } from "@features/finder-core/components/RenameInput";""")

edit(TREE_FOLDER, """  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const { effectiveNodesFor, deleteNodes, deleteLabel } = useNodeActions();

  function buildMenuItems(): ContextMenuItem[] {
    const targetNodes = effectiveNodesFor(node);
    return [
      {
        label: deleteLabel(targetNodes.length, targetNodes),
        destructive: true,
        onClick: () => {
          void deleteNodes(targetNodes);
        },
      },
    ];
  }""",
"""  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [isRenamingFolder, setIsRenamingFolder] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);
  const { effectiveNodesFor, deleteNodes, deleteLabel, renameNode } =
    useNodeActions();

  function buildMenuItems(): ContextMenuItem[] {
    const targetNodes = effectiveNodesFor(node);
    return [
      {
        label: "Renommer",
        onClick: () => {
          setRenameError(null);
          setIsRenamingFolder(true);
        },
      },
      {
        label: deleteLabel(targetNodes.length, targetNodes),
        destructive: true,
        onClick: () => {
          void deleteNodes(targetNodes);
        },
      },
    ];
  }""")

edit(TREE_FOLDER, """        <span className="truncate capitalize">{displayLabel}</span>""",
"""        {isRenamingFolder ? (
          <span className="min-w-0 flex-1" onClick={(e) => e.stopPropagation()}>
            <RenameInput
              initial={displayLabel}
              error={renameError}
              onCancel={() => {
                setIsRenamingFolder(false);
                setRenameError(null);
              }}
              onCommit={async (value) => {
                const message = await renameNode(node, value);
                if (message) {
                  setRenameError(message);
                  return;
                }
                setIsRenamingFolder(false);
                setRenameError(null);
              }}
            />
          </span>
        ) : (
          <span
            className="truncate capitalize"
            onDoubleClick={(e) => {
              // Double-clic sur le NOM : renommer. Le clic simple sur la
              // ligne garde son rôle d'ouverture / de repli.
              e.stopPropagation();
              if (!isStatus) {
                setRenameError(null);
                setIsRenamingFolder(true);
              }
            }}
          >
            {displayLabel}
          </span>
        )}""")
PY

echo "✓ 8 substitutions appliquées"

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
git commit -m "feat(finder): renommer un dossier, en arbre comme en grille

moveService reconstruisait le nom du dossier depuis la source, comme
il le faisait pour les fichiers : le nom cible etait ecrase et chaque
asset renomme sur lui-meme. La branche dossier appelle desormais
moveFolderRecursively avec le chemin cible complet.

Le registre CloudinaryFolder, qui porte les dossiers vides, suit
maintenant le renommage -- sinon le dossier reapparait sous son
ancien nom.

storage.rename ne reapplique plus de pseudo-extension a un dossier.

FinderTreeFolder recoit Renommer et RenameInput."

echo "✓ commité"
git log -1 --oneline