#!/usr/bin/env bash
#
# AKFC — Point 2 — cascade suppression de GROUPE.
#
# Remplace le delete naïf (prisma.memberGroup.delete) par une cascade sûre :
#   1. refuse le groupe Administrateurs (isAdminGroup)
#   2. résout le chemin d'espace par le suffixe -{groupId} (robuste au renommage)
#   3. VÉRIFIE l'espace vide (MediaAsset + sous-dossiers Folder sous le chemin —
#      couvre Cloudinary ET R2 via MediaAsset ; layout plat → espaces enfants
#      non comptés) → sinon refuse « videz d'abord »
#   4. re-parente les enfants vers le parent du groupe (AVANT delete)
#   5. supprime les lignes de registre Folder de l'espace (vide)
#   6. supprime la ligne MemberGroup (cascade DB memberships + liens docs)
#
# Crée deleteGroupWithSpace.service.ts + branche le router. Non testable sur
# clone (module collab absent) → asserts count==1 (abort avant commit).
# Usage : bash apply-group-delete-cascade.sh
#
set -euo pipefail
SVC="packages/backend/src/modules/memberGroups/deleteGroupWithSpace.service.ts"
RT="packages/backend/src/modules/memberGroups/router.ts"
[ -f package.json ] || { echo "ERREUR: racine du repo requise." >&2; exit 1; }
[ -f "$RT" ] || { echo "ERREUR: $RT introuvable." >&2; exit 1; }
B="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
[ "$B" = "main" ] || [ "$B" = "master" ] && { echo "NOTE: sur '$B' (Ctrl-C pour annuler)."; sleep 2; }

cat > "$SVC" <<'TS'
import type { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { resolveGroupBaseFolder } from "@backend/modules/media/services/resolveGroupBaseFolder.service";

/**
 * Supprime un groupe et son espace, en cascade SÛRE.
 *
 * Invariants respectés (décisions Stéphane A→E) :
 *  - le groupe Administrateurs (isAdminGroup) n'est jamais supprimable ;
 *  - l'espace doit être VIDE de contenu géré (fichiers Cloudinary ET R2 via
 *    MediaAsset, + sous-dossiers Folder) — sinon on refuse et on invite à
 *    vider ; le layout étant PLAT, les espaces des groupes enfants sont des
 *    dossiers frères (pas sous ce chemin) → ils ne comptent pas ;
 *  - les groupes enfants sont RE-PARENTÉS vers le parent du groupe supprimé
 *    (au pire Administrateurs, puisqu'on interdit sa suppression) AVANT delete,
 *    pour éviter le SetNull qui les enverrait à la racine.
 *
 * Résolution du chemin d'espace : par le SUFFIXE `-{groupId}` dans le registre
 * Folder (stable même après renommage), avec repli sur le chemin canonique.
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

  // ── Chemin(s) de l'espace : suffixe -{groupId} (robuste au renommage) ──
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
      // groupe non collaboratif ou espace jamais matérialisé → rien à vérifier
    }
  }

  // ── Vérifie que chaque espace est VIDE (contenu géré : fichiers + sous-dossiers) ──
  for (const sp of spacePaths) {
    const [asset, sub] = await Promise.all([
      prisma.mediaAsset.findFirst({
        where: { appRoot, fullPath: { startsWith: `${sp}/` } },
        select: { id: true },
      }),
      prisma.folder.findFirst({
        where: { appRoot, fullPath: { startsWith: `${sp}/` } },
        select: { id: true },
      }),
    ]);
    if (asset || sub) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `L'espace du groupe « ${group.name} » n'est pas vide. Videz-le (fichiers et sous-dossiers) avant de supprimer le groupe.`,
      });
    }
  }

  // ── Re-parente les enfants vers le parent (AVANT le delete) ──
  await prisma.memberGroup.updateMany({
    where: { parentGroupId: groupId },
    data: { parentGroupId: group.parentGroupId },
  });

  // ── Supprime les lignes de registre de l'espace (vide) ──
  if (spacePaths.size > 0) {
    await prisma.folder.deleteMany({
      where: { appRoot, fullPath: { in: [...spacePaths] } },
    });
  }

  // ── Supprime le groupe (cascade DB : memberships + liens documents) ──
  await prisma.memberGroup.delete({ where: { id: groupId } });
}
TS
echo "créé : $SVC"

python3 - "$RT" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "deleteGroupWithSpace" in s:
    print("déjà à jour"); sys.exit(0)

def sub(old, new, label):
    assert s.count(old) == 1, f"ancre introuvable/multiple: {label}"
    return s.replace(old, new, 1)

s = sub(
'import { ensureGroupSpaceFolder } from "@backend/modules/memberGroups/ensureGroupSpaceFolder.service";\n',
'import { ensureGroupSpaceFolder } from "@backend/modules/memberGroups/ensureGroupSpaceFolder.service";\n'
'import { deleteGroupWithSpace } from "@backend/modules/memberGroups/deleteGroupWithSpace.service";\n',
"import service")

s = sub(
'  delete: adminProcedure\n'
'    .input(z.object({ id: z.string() }))\n'
'    .mutation(async ({ ctx, input }) => {\n'
'      await ctx.prisma.memberGroup.delete({ where: { id: input.id } });\n'
'      return { success: true };\n'
'    }),\n',
'  delete: adminProcedure\n'
'    .input(z.object({ id: z.string() }))\n'
'    .mutation(async ({ ctx, input }) => {\n'
'      await deleteGroupWithSpace({\n'
'        prisma: ctx.prisma,\n'
'        appRoot: ctx.appRoot,\n'
'        groupId: input.id,\n'
'      });\n'
'      return { success: true };\n'
'    }),\n',
"router delete")

p.write_text(s, encoding="utf-8")
print("router delete branché sur la cascade")
PY

echo "typecheck backend…"
pnpm --filter backend typecheck > /tmp/tc.log 2>&1 || { echo "KO:"; grep -nE "error TS" /tmp/tc.log | head; tail -6 /tmp/tc.log; exit 1; }
echo OK
[ -z "$(git status --porcelain)" ] && { echo "rien à committer"; exit 0; }
git add -A && git commit -m "feat(groups): cascade sûre de suppression de groupe (vide+reparent+espace) (point 2)" && echo "commit $(git rev-parse --short HEAD)"