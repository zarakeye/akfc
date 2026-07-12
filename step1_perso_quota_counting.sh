#!/usr/bin/env bash
###############################################################################
# ÉTAPE 1b — Comptage images perso + quota (constante) + procédure de statut
#
# Lecture seule. Fournit au front (étape 2) la donnée nécessaire au message
# "X pending / Y published / Z restantes" et au blocage. L'ENFORCEMENT backend
# (refus d'upload si quota atteint) N'EST PAS ici : il sera fait à l'étape 2,
# couplé au front, avec traitement correct du ré-upload/écrasement.
#
#   1. persoPhotoQuota.constants.ts : PERSO_PHOTO_QUOTA (constante, pas de DB).
#   2. countPersoImages.service.ts  : compte les images perso par statut.
#   3. storage/router.ts            : query `getPersoPhotoQuota` (ctx.user.id).
###############################################################################
set -euo pipefail

cd "$(dirname "$0")"
echo "== Repo : $(pwd) =="

test -f package.json || { echo "ERREUR: lance-moi depuis la racine du monorepo."; exit 1; }

# Pré-requis : 1a présent.
if ! grep -q 'kind: z.literal("perso")' packages/contracts/src/cloudinary/upload.schema.ts 2>/dev/null; then
  echo "ERREUR: l'étape 1a n'est pas dans l'arbre. Lance-la d'abord."
  exit 1
fi

# Anti double-application.
if grep -q "getPersoPhotoQuota" packages/backend/src/modules/storage/router.ts 2>/dev/null; then
  echo "Déjà appliqué (getPersoPhotoQuota présent). Rien à faire."
  exit 0
fi

MEDIA_SVC="packages/backend/src/modules/media/services"
test -d "$MEDIA_SVC" || { echo "ERREUR: $MEDIA_SVC introuvable."; exit 1; }

# --------------------------------------------------------------------------- #
# 1. Constante de quota                                                        #
# --------------------------------------------------------------------------- #
cat > "$MEDIA_SVC/persoPhotoQuota.constants.ts" << 'EOF'
/**
 * Quota d'images de l'espace perso d'un admin.
 *
 * Constante volontaire (pas de modèle DB) : le club est petit, le réglage est
 * global et rarement modifié. Le jour où d'autres réglages arrivent, on
 * introduira une table AppConfig clé-valeur et cette constante en deviendra le
 * défaut. En attendant, ajuster le quota = éditer cette ligne.
 */
export const PERSO_PHOTO_QUOTA = 30;
EOF
echo "  [1] persoPhotoQuota.constants.ts (PERSO_PHOTO_QUOTA=30) OK"

# --------------------------------------------------------------------------- #
# 2. Service de comptage                                                       #
# --------------------------------------------------------------------------- #
cat > "$MEDIA_SVC/countPersoImages.service.ts" << 'EOF'
import type { PrismaClient } from "@prisma/client";

export type PersoImageCounts = {
  pending: number;
  published: number;
  total: number;
};

/**
 * Compte les images de l'espace perso d'un admin, ventilées par statut.
 *
 * Un asset perso est identifié par la conjonction :
 *   - `uploaderUserId = userId` : le dossier perso est dérivé de `ctx.user.id`
 *     à l'upload, donc l'uploader est toujours le propriétaire du dossier ;
 *   - `fullPath` contient `/persos/` : distingue le perso du `general` et des
 *     disciplines. Le segment survit au move pending→published (qui ne change
 *     que le segment de statut, `segment[1]`) ;
 *   - `resourceType = "image"` : le quota ne porte que sur les images ;
 *   - `status ∈ {pending, published}` : la corbeille (`bin`) ne compte pas.
 */
export async function countPersoImages(params: {
  prisma: PrismaClient;
  appRoot: string;
  userId: string;
}): Promise<PersoImageCounts> {
  const { prisma, appRoot, userId } = params;

  const grouped = await prisma.mediaAsset.groupBy({
    by: ["status"],
    where: {
      appRoot,
      uploaderUserId: userId,
      resourceType: "image",
      status: { in: ["pending", "published"] },
      fullPath: { contains: "/persos/" },
    },
    _count: true,
  });

  let pending = 0;
  let published = 0;
  for (const row of grouped) {
    if (row.status === "pending") {
      pending = row._count;
    } else if (row.status === "published") {
      published = row._count;
    }
  }

  return { pending, published, total: pending + published };
}
EOF
echo "  [2] countPersoImages.service.ts OK"

# --------------------------------------------------------------------------- #
# 3. storage/router.ts — imports + query getPersoPhotoQuota                    #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "packages/backend/src/modules/storage/router.ts"
s = open(p, encoding="utf-8").read()

# 3.1 imports (après le dernier import backend du router)
imp_anchor = 'import { assertOperationsDontUnpublishReferencedAssets } from "@backend/modules/media/services/assertOperationsDontUnpublishReferencedAssets.service";'
imp_add = imp_anchor + '''
import { countPersoImages } from "@backend/modules/media/services/countPersoImages.service";
import { PERSO_PHOTO_QUOTA } from "@backend/modules/media/services/persoPhotoQuota.constants";'''
assert s.count(imp_anchor) == 1, f"[3.1] ancre import : {s.count(imp_anchor)} match(es)."
s = s.replace(imp_anchor, imp_add)

# 3.2 procédure, insérée juste après getAttentionCounts
proc_anchor = '''    const [pending, bin] = await Promise.all([
      ctx.prisma.mediaAsset.count({ where: { status: "pending" } }),
      ctx.prisma.trashEntry.count({ where: { status: "IN_BIN" } }),
    ]);
    return { pending, bin };
  }),'''
proc_add = proc_anchor + '''

  /**
   * Statut du quota d'images de l'espace perso de l'admin courant (lecture
   * seule). Le dossier perso est dérivé de `ctx.user.id`, jamais d'un input.
   */
  getPersoPhotoQuota: protectedProcedure.query(async ({ ctx }) => {
    const counts = await countPersoImages({
      prisma: ctx.prisma,
      appRoot: ctx.appRoot,
      userId: ctx.user.id,
    });
    const remaining = Math.max(0, PERSO_PHOTO_QUOTA - counts.total);
    return {
      quota: PERSO_PHOTO_QUOTA,
      pending: counts.pending,
      published: counts.published,
      total: counts.total,
      remaining,
    };
  }),'''
assert s.count(proc_anchor) == 1, f"[3.2] ancre getAttentionCounts : {s.count(proc_anchor)} match(es)."
s = s.replace(proc_anchor, proc_add)

open(p, "w", encoding="utf-8").write(s)
print("  [3] storage/router.ts : import + query getPersoPhotoQuota OK")
PY

echo
echo "== Éditions appliquées =="

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → tooling & commit sautés."
  exit 0
fi

echo "== prisma generate =="
pnpm prisma generate
echo "== typecheck backend =="
pnpm --filter backend typecheck
echo "== typecheck web =="
pnpm typecheck

echo "== typecheck OK -> commit =="
git add -A
git commit -m "feat(upload): perso photo counting service + quota constant + getPersoPhotoQuota query"
echo "OK — 1b commité."