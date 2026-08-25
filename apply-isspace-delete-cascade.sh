#!/usr/bin/env bash
#
# AKFC — Service partagé isSpaceEmpty (check PHYSIQUE) + correctif cascade groupe.
#
# Pourquoi : le cycle corbeille ne supprime JAMAIS les lignes MediaAsset (ni
# trashToBin, ni purge/deleteForever). Un check « vide » basé sur MediaAsset ne
# se vide donc jamais du point de vue utilisateur → suppression bloquée à tort.
# On bascule sur un check PHYSIQUE (ce que le finder montre) : Cloudinary + R2 +
# sous-dossiers registre.
#
#  1. crée packages/backend/src/modules/storage/isSpaceEmpty.service.ts
#  2. réécrit deleteGroupWithSpace.service.ts pour l'utiliser (au lieu de MediaAsset)
#
# Prérequis : incrément R2 1 (r2TrashOps) + apply-group-delete-cascade.sh (router).
# Usage : bash apply-isspace-empty-and-fix-group.sh
#
set -euo pipefail
EMPTY="packages/backend/src/modules/storage/isSpaceEmpty.service.ts"
GRP="packages/backend/src/modules/memberGroups/deleteGroupWithSpace.service.ts"
[ -f package.json ] || { echo "ERREUR: racine du repo requise." >&2; exit 1; }
B="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
[ "$B" = "main" ] || [ "$B" = "master" ] && { echo "NOTE: sur '$B' (Ctrl-C pour annuler)."; sleep 2; }

cat > "$EMPTY" <<'TS'
import type { PrismaClient } from "@prisma/client";

import { cloudinary } from "@backend/modules/cloudinary/cloudinary.client";
import { r2ListByPrefix } from "@backend/modules/trash/services/r2TrashOps";

/**
 * Un dossier est-il VIDE au sens du finder ? Contrôle PHYSIQUE, volontairement
 * indépendant des lignes MediaAsset : le cycle corbeille ne les nettoie pas
 * (trashToBin/purge/deleteForever ne touchent pas MediaAsset), donc un test
 * basé dessus donnerait un faux « non vide » après un vidage pourtant réel.
 *
 * Vide ⇔ aucun objet Cloudinary (image/video/raw) NI R2 sous `path/`, ET aucun
 * sous-dossier au registre `Folder`. `path` = chemin du dossier, sans slash final.
 *
 * NB : layout plat des espaces de groupe → les espaces des groupes enfants sont
 * des dossiers frères (hors `path/`) et ne comptent donc pas.
 */
export async function isSpaceEmpty(params: {
  prisma: PrismaClient;
  appRoot: string;
  path: string;
}): Promise<boolean> {
  const { prisma, appRoot, path } = params;
  const prefix = `${path}/`;

  // 1) Cloudinary : un asset sous le préfixe ? (existence : max_results 1)
  for (const rt of ["image", "video", "raw"] as const) {
    const res = await cloudinary.api.resources({
      type: "authenticated",
      resource_type: rt,
      prefix,
      max_results: 1,
    });
    if ((res.resources?.length ?? 0) > 0) return false;
  }

  // 2) R2 : un objet sous le préfixe ?
  if ((await r2ListByPrefix(prefix)).length > 0) return false;

  // 3) Registre : un sous-dossier ?
  const sub = await prisma.folder.findFirst({
    where: { appRoot, fullPath: { startsWith: prefix } },
    select: { id: true },
  });
  return sub === null;
}
TS
echo "créé : $EMPTY"

cat > "$GRP" <<'TS'
import type { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { resolveGroupBaseFolder } from "@backend/modules/media/services/resolveGroupBaseFolder.service";
import { isSpaceEmpty } from "@backend/modules/storage/isSpaceEmpty.service";

/**
 * Supprime un groupe et son espace, en cascade SÛRE (décisions A→E) :
 *  - refuse le groupe Administrateurs (isAdminGroup) ;
 *  - l'espace doit être VIDE — contrôle PHYSIQUE (isSpaceEmpty), aligné sur ce
 *    que montre le finder (les lignes MediaAsset orphelines ne faussent rien) ;
 *    layout plat → les espaces enfants (dossiers frères) ne comptent pas ;
 *  - les groupes enfants sont RE-PARENTÉS vers le parent du groupe supprimé
 *    (au pire Administrateurs) AVANT le delete, pour éviter le SetNull racine.
 *
 * Chemin d'espace résolu par le SUFFIXE `-{groupId}` du registre (stable au
 * renommage), repli sur le chemin canonique.
 */
export async function deleteGroupWithSpace(params: {
  prisma: PrismaClient;
  appRoot: string;
  groupId: string;
}): Promise<void> {
  const { prisma, appRoot, groupId } = params;

  const group = await prisma.memberGroup.findUnique({
    where: { id: groupId },
    select: {
      id: true,
      name: true,
      isAdminGroup: true,
      isCollaborative: true,
      parentGroupId: true,
    },
  });
  if (!group) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Groupe introuvable." });
  }
  if (group.isAdminGroup) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Le groupe Administrateurs ne peut pas être supprimé.",
    });
  }

  // Chemin(s) de l'espace : suffixe -{groupId} (robuste au renommage).
  const registered = await prisma.folder.findMany({
    where: { appRoot, fullPath: { endsWith: `-${groupId}` } },
    select: { fullPath: true },
  });
  const spacePaths = new Set<string>(
    registered.map((r) => r.fullPath).filter((fp) => fp.includes("/groups/")),
  );
  if (spacePaths.size === 0 && group.isCollaborative) {
    try {
      spacePaths.add(await resolveGroupBaseFolder({ prisma, appRoot, groupId }));
    } catch {
      // non collaboratif / espace jamais matérialisé → rien à vérifier
    }
  }

  // Vérifie que chaque espace est VIDE (contrôle physique).
  for (const sp of spacePaths) {
    if (!(await isSpaceEmpty({ prisma, appRoot, path: sp }))) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `L'espace du groupe « ${group.name} » n'est pas vide. Videz-le (fichiers et sous-dossiers) avant de supprimer le groupe.`,
      });
    }
  }

  // Re-parente les enfants vers le parent (AVANT le delete).
  await prisma.memberGroup.updateMany({
    where: { parentGroupId: groupId },
    data: { parentGroupId: group.parentGroupId },
  });

  // Supprime les lignes de registre de l'espace (vide).
  if (spacePaths.size > 0) {
    await prisma.folder.deleteMany({
      where: { appRoot, fullPath: { in: [...spacePaths] } },
    });
  }

  // Supprime le groupe (cascade DB : memberships + liens documents).
  await prisma.memberGroup.delete({ where: { id: groupId } });
}
TS
echo "réécrit : $GRP (check physique)"

echo "typecheck backend…"
pnpm --filter backend typecheck > /tmp/tc.log 2>&1 || { echo "KO:"; grep -nE "error TS" /tmp/tc.log | head; tail -6 /tmp/tc.log; exit 1; }
echo OK
[ -z "$(git status --porcelain)" ] && { echo "rien à committer"; exit 0; }
git add -A && git commit -m "fix(groups): check espace vide PHYSIQUE (Cloudinary+R2) via isSpaceEmpty partagé" && echo "commit $(git rev-parse --short HEAD)"