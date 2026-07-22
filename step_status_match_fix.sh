#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# FIX — la pastille de statut ne s'appliquait qu'aux fichiers R2.
#
# Cause : le `node.path` d'un fichier Cloudinary est son public_id RÉEL, donc
# SANS extension pour les images/vidéos :
#
#     node.path  : AKFC/cours/x/photo
#     DB publicId: AKFC/cours/x/photo.png     ← l'extension est en base
#     DB fullPath: AKFC/cours/x/photo.png
#
# Le `WHERE publicId IN (paths)` ne matchait donc aucun asset Cloudinary. Les
# R2 matchaient (node.path === fullPath, extension des deux côtés) : d'où une
# pastille sur eux seulement.
#
# Correctif : pour chaque fichier, on cherche DEUX clés — le chemin nu et le
# chemin + son `format` (que le node porte déjà). Couvre les deux providers
# et les deux conventions, sans toucher aux données.
#
# ⚠️ DETTE laissée en place : `MediaAsset.publicId` contient l'extension pour
#    les images/vidéos, ce qui ne reflète PAS la convention Cloudinary (le
#    public_id réel n'en a pas). Ce correctif contourne l'écart ; l'aligner en
#    base serait un chantier à part, à faire avec précaution (13 appelants).
#
# À lancer depuis la RACINE.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SVC="packages/backend/src/modules/storage/services/enrichStatus.service.ts"
test -f "$SVC" || { echo "✗ $SVC introuvable (step_status_enrich pas appliqué ?)."; exit 1; }

if grep -q "candidateKeys" "$SVC"; then
  echo "→ déjà appliqué, rien à faire."
  exit 0
fi

cat > "$SVC" <<'TSEOF'
import type { PrismaClient } from "@prisma/client";
import type { StorageFileNode, StorageNode } from "@contracts/storage";

/**
 * Enrichissement du listing avec le statut de cycle de vie.
 *
 * Depuis l'aplatissement des chemins, le statut ne peut plus être dérivé du
 * path : il vit dans `MediaAsset.status`. Cette couche le rapatrie pour que
 * `meta.status` soit renseigné côté client (pastille de statut, filtres,
 * règle `isPickable`).
 *
 * ─── Le point délicat : deux conventions de clé ────────────────────────────
 *
 * Le `path` d'un node est ce que le provider expose :
 *   - Cloudinary image/vidéo : le public_id, SANS extension
 *       node.path = "AKFC/cours/x/photo"
 *   - Cloudinary raw et R2   : le chemin complet, AVEC extension
 *       node.path = "AKFC/general/doc.pdf"
 *
 * En base, `publicId` et `fullPath` portent l'extension dans les deux cas.
 * On interroge donc avec DEUX clés par fichier — le chemin nu et le chemin
 * suffixé de son `format` — et on résout dans le même ordre.
 */

type LifecycleStatus = "pending" | "published" | "bin";

function isLifecycleStatus(value: string): value is LifecycleStatus {
  return value === "pending" || value === "published" || value === "bin";
}

/** Les clés sous lesquelles ce fichier peut être connu en base. */
function candidateKeys(file: StorageFileNode): string[] {
  const keys = [file.path];
  const format = file.metadata?.format?.toLowerCase();
  if (format && !file.path.toLowerCase().endsWith(`.${format}`)) {
    keys.push(`${file.path}.${format}`);
  }
  return keys;
}

async function statusByKey(
  prisma: PrismaClient,
  appRoot: string,
  keys: string[],
): Promise<Map<string, LifecycleStatus>> {
  const map = new Map<string, LifecycleStatus>();
  if (keys.length === 0) return map;

  const rows = await prisma.mediaAsset.findMany({
    where: {
      appRoot,
      OR: [{ publicId: { in: keys } }, { fullPath: { in: keys } }],
    },
    select: { publicId: true, fullPath: true, status: true },
  });

  for (const row of rows) {
    if (!isLifecycleStatus(row.status)) continue;
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

  const allKeys = files.flatMap(candidateKeys);
  const byKey = await statusByKey(prisma, appRoot, allKeys);

  for (const file of files) {
    for (const key of candidateKeys(file)) {
      const status = byKey.get(key);
      if (status) {
        file.metadata = { ...(file.metadata ?? {}), status };
        break;
      }
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
echo "✓ $SVC réécrit (double clé : chemin nu + chemin.format)"

echo "→ contrôle croisé"
grep -q "export async function enrichFilesWithStatus" "$SVC" && echo "  ✓ enrichFilesWithStatus exporté" || { echo "  ✗"; exit 1; }
grep -q "export async function enrichTreeWithStatus" "$SVC"  && echo "  ✓ enrichTreeWithStatus exporté"  || { echo "  ✗"; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "→ stop avant typecheck/commit."; exit 0; fi
echo "→ typecheck backend…"; if ! pnpm --filter backend typecheck; then echo "✗ backend rouge"; exit 1; fi
echo "→ typecheck racine…"; if ! pnpm typecheck; then echo "✗ racine rouge"; exit 1; fi
git add -A && git commit -m "fix(storage): le statut matche aussi les publicId Cloudinary (extension en base)"
echo "✓ commité."