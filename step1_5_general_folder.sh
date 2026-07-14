#!/usr/bin/env bash
###############################################################################
# G1.5 — La destination `general` gagne un SOUS-DOSSIER nommé
#
# Chaque contenu `general` va dans un sous-dossier sous `general/` (existant ou
# créé à la volée). Requiert G1 (R2 general) appliqué.
#
#   1. contracts/upload.schema.ts : general → { kind, folder } (Cloudinary).
#   2. storage/router.ts : r2UploadDestinationSchema general → + folder (R2).
#   3. resolvePendingUploadFolder.ts : general → `${appRoot}/pending/general/${slug(folder)}`.
#   4. listGeneralFolders.service.ts (NOUVEAU) : sous-dossiers existants sous
#      general (pending + published), dérivés des fullPath.
#   5. storage/router.ts : query `listGeneralFolders`.
###############################################################################
set -euo pipefail

cd "$(dirname "$0")"
echo "== Repo : $(pwd) =="
test -f package.json || { echo "ERREUR: lance-moi depuis la racine du monorepo."; exit 1; }

# Prérequis : G1 (R2 general).
if ! grep -q "z.literal('general')" packages/backend/src/modules/storage/router.ts 2>/dev/null; then
  echo "ERREUR: G1 absent (R2 general). Applique stepG1_r2_general.sh d'abord."; exit 1
fi

# Anti double-application.
if grep -q "listGeneralFolders" packages/backend/src/modules/storage/router.ts 2>/dev/null; then
  echo "Déjà appliqué (listGeneralFolders présent). Rien à faire."; exit 0
fi

# --------------------------------------------------------------------------- #
# 1. contracts : general + folder                                             #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "packages/contracts/src/cloudinary/upload.schema.ts"
s = open(p, encoding="utf-8").read()
a = '''  z.object({
    kind: z.literal("general"),
  }),'''
b = '''  z.object({
    kind: z.literal("general"),
    // Sous-dossier nommé sous `general/` (existant ou créé à la volée).
    folder: z.string().trim().min(1).max(120),
  }),'''
assert s.count(a) == 1, f"[1] contracts general : {s.count(a)} match(es)."
open(p, "w", encoding="utf-8").write(s.replace(a, b))
print("  [1] upload.schema.ts : general + folder OK")
PY

# --------------------------------------------------------------------------- #
# 2. router : r2UploadDestinationSchema general + folder                       #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "packages/backend/src/modules/storage/router.ts"
s = open(p, encoding="utf-8").read()
a = '''  z.object({
    kind: z.literal('general'),
  }),
]);'''
b = '''  z.object({
    kind: z.literal('general'),
    folder: z.string().trim().min(1).max(120),
  }),
]);'''
assert s.count(a) == 1, f"[2] r2 general : {s.count(a)} match(es)."
open(p, "w", encoding="utf-8").write(s.replace(a, b))
print("  [2] router.ts : r2 general + folder OK")
PY

# --------------------------------------------------------------------------- #
# 3. resolvePendingUploadFolder : general → general/<slug(folder)>            #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "packages/backend/src/modules/cloudinary/services/resolvePendingUploadFolder.service.ts"
s = open(p, encoding="utf-8").read()
a = '''  if (destination.kind === "general") {
    return `${appRoot}/pending/general`;
  }'''
b = '''  if (destination.kind === "general") {
    const folderSlug = slug(destination.folder);
    if (!folderSlug) {
      throw new Error(
        "General folder name must contain at least one slug-friendly character",
      );
    }
    return `${appRoot}/pending/general/${folderSlug}`;
  }'''
assert s.count(a) == 1, f"[3] resolve general : {s.count(a)} match(es)."
open(p, "w", encoding="utf-8").write(s.replace(a, b))
print("  [3] resolvePendingUploadFolder.ts : general/<slug(folder)> OK")
PY

# --------------------------------------------------------------------------- #
# 4. listGeneralFolders.service.ts (nouveau)                                   #
# --------------------------------------------------------------------------- #
cat > packages/backend/src/modules/media/services/listGeneralFolders.service.ts << 'EOF'
import type { PrismaClient } from "@prisma/client";

/**
 * Liste les sous-dossiers existants sous `general/` (statuts pending +
 * published), dérivés des `fullPath` des MediaAsset. Renvoie les slugs de
 * dossier, dédupliqués et triés — pour peupler le select « dossier existant »
 * de l'uploader général.
 *
 * Le segment survit au move pending→published (qui ne change que le segment de
 * statut), donc un dossier reste listé quel que soit l'état de ses contenus.
 */
export async function listGeneralFolders(params: {
  prisma: PrismaClient;
  appRoot: string;
}): Promise<string[]> {
  const { prisma, appRoot } = params;

  const assets = await prisma.mediaAsset.findMany({
    where: {
      appRoot,
      status: { in: ["pending", "published"] },
      fullPath: { contains: "/general/" },
    },
    select: { fullPath: true },
  });

  const prefixes = [
    `${appRoot}/pending/general/`,
    `${appRoot}/published/general/`,
  ];
  const names = new Set<string>();
  for (const { fullPath } of assets) {
    for (const prefix of prefixes) {
      if (fullPath.startsWith(prefix)) {
        const segment = fullPath.slice(prefix.length).split("/")[0];
        if (segment) names.add(segment);
        break;
      }
    }
  }

  return [...names].sort((a, b) => a.localeCompare(b, "fr"));
}
EOF
echo "  [4] listGeneralFolders.service.ts OK"

# --------------------------------------------------------------------------- #
# 5. router : query listGeneralFolders                                        #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "packages/backend/src/modules/storage/router.ts"
s = open(p, encoding="utf-8").read()

imp = 'import { PERSO_PHOTO_QUOTA } from "@backend/modules/media/services/persoPhotoQuota.constants";'
imp_add = imp + '''
import { listGeneralFolders } from "@backend/modules/media/services/listGeneralFolders.service";'''
assert s.count(imp) == 1, f"[5.imp] : {s.count(imp)} match(es)."
s = s.replace(imp, imp_add)

anchor = '''    const remaining = Math.max(0, PERSO_PHOTO_QUOTA - counts.total);
    return {
      quota: PERSO_PHOTO_QUOTA,
      pending: counts.pending,
      published: counts.published,
      total: counts.total,
      remaining,
    };
  }),'''
add = anchor + '''

  /**
   * Sous-dossiers existants sous `general/` (pending + published), pour peupler
   * le select « dossier existant » de l'uploader général.
   */
  listGeneralFolders: protectedProcedure.query(async ({ ctx }) => {
    return listGeneralFolders({ prisma: ctx.prisma, appRoot: ctx.appRoot });
  }),'''
assert s.count(anchor) == 1, f"[5.proc] ancre getPersoPhotoQuota : {s.count(anchor)} match(es)."
s = s.replace(anchor, add)

open(p, "w", encoding="utf-8").write(s)
print("  [5] router.ts : query listGeneralFolders OK")
PY

echo
echo "== Éditions appliquées =="
if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → tooling & commit sautés."; exit 0
fi

echo "== prisma generate =="
pnpm prisma generate
echo "== typecheck backend =="
pnpm --filter backend typecheck
echo "== typecheck web =="
pnpm typecheck

echo "== typecheck OK -> commit =="
git add -A
git commit -m "feat(upload): general destination gains a named subfolder + listGeneralFolders query"
echo "OK — G1.5 commité."