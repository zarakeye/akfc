#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# CORRECTIF grid view : le listing ne portait pas le statut → les fichiers
# publiés étaient invisibles (filtre published).
#
# Cause : statusOf(file) = meta.status ?? statusFromPath(path). Le chemin est
# désormais PLAT → statusFromPath renvoie null. Et le backend ne remplissait
# jamais meta.status (il venait historiquement du chemin). Résultat : tous les
# fichiers ont statusOf=null, le filtre "published" n'en garde aucun.
#
# Fix : enrichir le listing avec MediaAsset.status.
#   1. StorageMetadata gagne un champ `status?`.
#   2. cloudinaryStorageAdapter.getTree enrichit chaque fichier : une requête
#      MediaAsset (par fullPath), pose metadata.status sur les nœuds fichiers.
#
# À lancer depuis la RACINE du repo.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

CONTRACT="packages/contracts/src/storage/storage.types.ts"
ADAPTER="packages/backend/src/modules/storage/adapters/cloudinary/cloudinaryStorageAdapter.ts"

test -f "$CONTRACT" || { echo "✗ $CONTRACT introuvable — lance depuis la racine."; exit 1; }
test -f "$ADAPTER"  || { echo "✗ $ADAPTER introuvable."; exit 1; }

if grep -q "enrichFilesWithStatus" "$ADAPTER"; then
  echo "→ enrichissement déjà en place, rien à faire."
  exit 0
fi

python3 - <<'PYEOF'
import pathlib

# ── 1) Contrat : ajouter status? à StorageMetadata ──────────────────────────
c = pathlib.Path("packages/contracts/src/storage/storage.types.ts")
src = c.read_text(encoding="utf-8")
OLD_META = """  /** MIME type complet quand disponible */
  mimeType?: string;
};"""
NEW_META = """  /** MIME type complet quand disponible */
  mimeType?: string;
  /**
   * Statut de cycle de vie, depuis `MediaAsset.status` en DB. Rempli par le
   * listing (adapter) — le chemin étant désormais plat, il ne peut plus être
   * dérivé du path.
   */
  status?: 'pending' | 'published' | 'bin';
};"""
assert src.count(OLD_META) == 1, f"ancre StorageMetadata trouvée {src.count(OLD_META)}x"
c.write_text(src.replace(OLD_META, NEW_META), encoding="utf-8")
print("  ✓ contrat : StorageMetadata.status ajouté")

# ── 2) Adapter : enrichir les fichiers du tree avec MediaAsset.status ───────
a = pathlib.Path("packages/backend/src/modules/storage/adapters/cloudinary/cloudinaryStorageAdapter.ts")
src = a.read_text(encoding="utf-8")

# 2a. injecter la fonction d'enrichissement + appel avant `return { root };`
OLD_RET = """      const root = mapClientFolderTreeToStorageNode(tree, depth);
      if (root.type !== \"folder\") {
        return {
          root: {
            type: \"folder\",
            name: root.name,
            path: options.path,
            children: [],
            hasChildren: false,
          },
        };
      }
      return { root };"""

NEW_RET = """      const root = mapClientFolderTreeToStorageNode(tree, depth);
      if (root.type !== \"folder\") {
        return {
          root: {
            type: \"folder\",
            name: root.name,
            path: options.path,
            children: [],
            hasChildren: false,
          },
        };
      }
      await enrichFilesWithStatus(prisma, appRoot, root);
      return { root };"""

assert src.count(OLD_RET) == 1, f"ancre return root trouvée {src.count(OLD_RET)}x"
src = src.replace(OLD_RET, NEW_RET)

# 2b. définir enrichFilesWithStatus en fin de fichier
HELPER = '''

/**
 * Enrichit récursivement les nœuds FICHIER d'un arbre avec leur statut de
 * cycle de vie, lu depuis `MediaAsset.status`. Le chemin étant plat, le statut
 * ne peut plus être dérivé du path — il vient de la DB. Une seule requête pour
 * tout l'arbre (collecte des fullPath, findMany, application).
 */
async function enrichFilesWithStatus(
  prisma: PrismaClient,
  appRoot: string,
  root: StorageNode,
): Promise<void> {
  const filePaths: string[] = [];
  const fileNodes: StorageFileNode[] = [];

  const walk = (node: StorageNode): void => {
    if (node.type === "file") {
      filePaths.push(node.path);
      fileNodes.push(node);
      return;
    }
    for (const child of node.children ?? []) walk(child);
  };
  walk(root);

  if (filePaths.length === 0) return;

  // Le node.path (Cloudinary) est le public_id, SANS extension pour les images.
  // MediaAsset.fullPath, lui, a l'extension. On matche donc par publicId, qui
  // est justement le fullPath sans extension côté Cloudinary.
  const assets = await prisma.mediaAsset.findMany({
    where: { appRoot, publicId: { in: filePaths } },
    select: { publicId: true, status: true },
  });
  const statusByPublicId = new Map(
    assets.map((a) => [a.publicId, a.status]),
  );

  for (const node of fileNodes) {
    const status = statusByPublicId.get(node.path);
    if (status) {
      node.metadata = { ...(node.metadata ?? {}), status };
    }
  }
}'''

src = src.rstrip() + "\n" + HELPER + "\n"
a.write_text(src, encoding="utf-8")
print("  ✓ adapter : enrichFilesWithStatus ajouté + appelé")

# 2c. s'assurer que les types StorageNode/StorageFileNode/PrismaClient sont importés
src = a.read_text(encoding="utf-8")
needed = []
if "StorageFileNode" not in src.split("enrichFilesWithStatus")[0]:
    needed.append("StorageFileNode")
# PrismaClient
if "PrismaClient" not in src:
    # ajouter un import type
    src = "import type { PrismaClient } from \"@prisma/client\";\n" + src
    a.write_text(src, encoding="utf-8")
    print("  ✓ adapter : import PrismaClient ajouté")
PYEOF

echo
echo "→ vérif : StorageNode et StorageFileNode importés dans l'adapter ?"
grep -q "StorageNode" "$ADAPTER" && echo "  ✓ StorageNode présent" || echo "  ⚠ StorageNode à importer manuellement"
grep -q "StorageFileNode" "$ADAPTER" && echo "  ✓ StorageFileNode présent" || echo "  ⚠ StorageFileNode à importer manuellement"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "→ AKFC_APPLY_ONLY=1 : stop avant typecheck/commit."
  exit 0
fi

echo "→ typecheck backend…"
if ! pnpm --filter backend typecheck; then echo "✗ backend ROUGE — aucun commit."; exit 1; fi
echo "→ typecheck racine…"
if ! pnpm typecheck; then echo "✗ racine ROUGE — aucun commit."; exit 1; fi

git add -A && git commit -m "fix(storage): enrichit le listing avec MediaAsset.status — fichiers publies visibles (etape 6)"
echo "✓ commité."