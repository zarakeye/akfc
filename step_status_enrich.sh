#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 6 (suite) — LE LISTING PORTE ENFIN LE STATUT.
#
# Reliquat du chantier « statut en métadonnée » : le statut a quitté le chemin
# (étapes 3-5), mais la LECTURE ne le rapatrie jamais depuis la base. Le
# listing ne renvoie que `{ format }`, donc côté front :
#
#     statusOf(node) = meta.status ?? statusFromPath(chemin PLAT)
#                    = undefined    ?? null
#                    = null   →  pour TOUS les fichiers
#
# Conséquences observées : le point « en attente » ne s'affiche jamais, et les
# filtres « En attente » / « Publiés » ne retiennent rien (seul « Tous » marche).
#
# Correctif — en un seul endroit, provider-agnostique :
#   1) `StorageMetadata` gagne `status?`.
#   2) Un service d'enrichissement joint `MediaAsset.status` aux fichiers
#      listés. Match par `publicId` (Cloudinary : node.path === publicId) OU
#      par `fullPath` (R2 : node.path === fullPath) — une seule requête.
#   3) Les procédures `storage.list` et `storage.getTree` enrichissent avant
#      de répondre : la grille ET l'arbre reçoivent le statut.
#
# Le front n'a rien à changer : `mapFileToFinderNode` recopie déjà
# `file.metadata?.status` vers `meta.status`.
#
# À lancer depuis la RACINE.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

CONTRACT="packages/contracts/src/storage/storage.types.ts"
ROUTER="packages/backend/src/modules/storage/router.ts"
SVC="packages/backend/src/modules/storage/services/enrichStatus.service.ts"

test -f "$CONTRACT" || { echo "✗ $CONTRACT introuvable — lance depuis la racine."; exit 1; }
test -f "$ROUTER"   || { echo "✗ $ROUTER introuvable."; exit 1; }

# Garde sur le DERNIER élément écrit (le router), pas le premier :
# une application partielle ne peut plus se maquiller en succès.
if grep -q "enrichFilesWithStatus" "$ROUTER"; then
  echo "→ déjà appliqué (router enrichi), rien à faire."
  exit 0
fi

# ── 1) Service d'enrichissement ─────────────────────────────────────────────
mkdir -p "$(dirname "$SVC")"
cat > "$SVC" <<'TSEOF'
import type { PrismaClient } from "@prisma/client";
import type { StorageFileNode, StorageNode } from "@contracts/storage";

/**
 * Enrichissement du listing avec le statut de cycle de vie.
 *
 * Depuis l'aplatissement des chemins, le statut ne peut plus être dérivé du
 * path : il vit dans `MediaAsset.status`. Cette couche le rapatrie pour que
 * `meta.status` soit renseigné côté client (badge « en attente », filtres,
 * règle `isPickable`).
 *
 * Le match couvre les deux providers en une requête :
 *   - Cloudinary : `node.path` === `MediaAsset.publicId` (sans extension) ;
 *   - R2         : `node.path` === `MediaAsset.fullPath`.
 */

type LifecycleStatus = "pending" | "published" | "bin";

function isLifecycleStatus(value: string): value is LifecycleStatus {
  return value === "pending" || value === "published" || value === "bin";
}

async function statusByPath(
  prisma: PrismaClient,
  appRoot: string,
  paths: string[],
): Promise<Map<string, LifecycleStatus>> {
  const map = new Map<string, LifecycleStatus>();
  if (paths.length === 0) return map;

  const rows = await prisma.mediaAsset.findMany({
    where: {
      appRoot,
      OR: [{ publicId: { in: paths } }, { fullPath: { in: paths } }],
    },
    select: { publicId: true, fullPath: true, status: true },
  });

  for (const row of rows) {
    if (!isLifecycleStatus(row.status)) continue;
    // On indexe sur les DEUX clés : selon le provider, le node porte l'une
    // ou l'autre. Une clé absente (publicId null pour R2) est ignorée.
    if (row.publicId) map.set(row.publicId, row.status);
    if (row.fullPath) map.set(row.fullPath, row.status);
  }
  return map;
}

/** Pose `metadata.status` sur chaque fichier d'une liste plate. */
export async function enrichFilesWithStatus(
  prisma: PrismaClient,
  appRoot: string,
  files: ReadonlyArray<StorageFileNode>,
): Promise<void> {
  if (files.length === 0) return;
  const byPath = await statusByPath(
    prisma,
    appRoot,
    files.map((f) => f.path),
  );
  for (const file of files) {
    const status = byPath.get(file.path);
    if (status) {
      file.metadata = { ...(file.metadata ?? {}), status };
    }
  }
}

/** Même chose, en parcourant récursivement un arbre. */
export async function enrichTreeWithStatus(
  prisma: PrismaClient,
  appRoot: string,
  root: StorageNode,
): Promise<void> {
  const files: StorageFileNode[] = [];
  const walk = (node: StorageNode): void => {
    if (node.type === "file") {
      files.push(node);
      return;
    }
    for (const child of node.children ?? []) walk(child);
  };
  walk(root);
  await enrichFilesWithStatus(prisma, appRoot, files);
}
TSEOF
echo "✓ $SVC créé"

python3 - <<'PYEOF'
import pathlib

def edit(path, old, new, label, count=1):
    p = pathlib.Path(path)
    src = p.read_text(encoding="utf-8")
    n = src.count(old)
    assert n == count, f"[{label}] ancre trouvee {n}x, attendu {count}"
    p.write_text(src.replace(old, new), encoding="utf-8")
    print(f"  ✓ {label}")

# ── 2) Contrat : StorageMetadata.status ─────────────────────────────────────
edit("packages/contracts/src/storage/storage.types.ts",
     """export type StorageMetadata = {
  bytes?: number;""",
     """export type StorageMetadata = {
  /**
   * Statut de cycle de vie, depuis `MediaAsset.status`. Rempli par la couche
   * d'enrichissement du listing — le chemin étant plat, il ne peut plus être
   * dérivé du path.
   */
  status?: 'pending' | 'published' | 'bin';
  bytes?: number;""",
     "contrat : StorageMetadata.status")

# ── 3) Router : enrichir list et getTree ────────────────────────────────────
edit("packages/backend/src/modules/storage/router.ts",
     'import { z } from "zod";',
     '''import { z } from "zod";
import {
  enrichFilesWithStatus,
  enrichTreeWithStatus,
} from "@backend/modules/storage/services/enrichStatus.service";''',
     "router : import du service")

edit("packages/backend/src/modules/storage/router.ts",
     """      return reader.list({
        path: input.path,
        cursor: input.cursor,
        limit: input.limit,
      });""",
     """      const result = await reader.list({
        path: input.path,
        cursor: input.cursor,
        limit: input.limit,
      });
      // Le statut vit en DB depuis l'aplatissement : on le rapatrie ici.
      await enrichFilesWithStatus(ctx.prisma, ctx.appRoot, result.files);
      return result;""",
     "router : list enrichi")

edit("packages/backend/src/modules/storage/router.ts",
     "      return reader.getTree({ path: input.path, depth: input.depth });",
     """      const result = await reader.getTree({
        path: input.path,
        depth: input.depth,
      });
      await enrichTreeWithStatus(ctx.prisma, ctx.appRoot, result.root);
      return result;""",
     "router : getTree enrichi")
PYEOF

echo
echo "→ contrôle croisé usage/import"
grep -q "export async function enrichFilesWithStatus" "$SVC" && echo "  ✓ enrichFilesWithStatus exporté" || { echo "  ✗ export manquant"; exit 1; }
grep -q "export async function enrichTreeWithStatus" "$SVC"  && echo "  ✓ enrichTreeWithStatus exporté"  || { echo "  ✗ export manquant"; exit 1; }
grep -q "status?: 'pending' | 'published' | 'bin';" "$CONTRACT" && echo "  ✓ contrat à jour" || { echo "  ✗ contrat"; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "→ stop avant typecheck/commit."; exit 0; fi
echo "→ typecheck backend…"; if ! pnpm --filter backend typecheck; then echo "✗ backend ROUGE — aucun commit."; exit 1; fi
echo "→ typecheck racine…"; if ! pnpm typecheck; then echo "✗ racine ROUGE — aucun commit."; exit 1; fi
git add -A && git commit -m "feat(storage): le listing rapatrie MediaAsset.status (grid + tree)"
echo "✓ commité."