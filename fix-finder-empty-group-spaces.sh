#!/usr/bin/env bash
#
# AKFC — Finder : espaces de groupe visibles même VIDES.
#
# PROBLÈME : le listing du finder lit le stockage PHYSIQUE (Cloudinary + R2).
# Or ces backends n'ont pas de vrais dossiers — un dossier n'existe que tant
# qu'il contient un asset. Conséquence déroutante : sortir le dernier fichier
# d'un espace de groupe fait « disparaître » son dossier du finder (et `/groups`
# peut paraître vide) alors que le groupe existe toujours en base.
#
# FIX : quand on liste le conteneur `groups`, on réinjecte les espaces des
# groupes COLLABORATIFS connus en base (via `resolveGroupBaseFolder`), fusionnés
# avec le résultat physique. Déduplication par le suffixe STABLE `-<groupId>`
# (robuste même si le groupe a été renommé → slug différent). Visibilité : admin
# → tous les groupes collaboratifs ; membre → ses espaces accessibles (mêmes
# droits que `myCollaborativeSpaces`). Le physique gagne : aucun doublon.
#
# NB : ne touche QUE le listing du conteneur `groups`. Les espaces `persos`
# souffrent du même symptôme — même recette applicable si tu le veux (dis-le).
#
# 2 fichiers : nouveau service + câblage dans storage/router.ts (list). Backend
# seul, typecheck backend.
#
# Usage : bash fix-finder-empty-group-spaces.sh
#         AKFC_APPLY_ONLY=1 bash fix-finder-empty-group-spaces.sh   (clone)
#
set -euo pipefail

SVC="packages/backend/src/modules/storage/mergeGroupSpaceFolders.service.ts"
ROUTER="packages/backend/src/modules/storage/router.ts"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$ROUTER" ]      || { echo "ERREUR: $ROUTER introuvable." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

# ── 1. Service de fusion ────────────────────────────────────────────────────
cat > "$SVC" <<'TS'
import type { PrismaClient } from "@prisma/client";

import type { ListResult, StorageFolderNode } from "@contracts/storage";

import { resolveGroupBaseFolder } from "@backend/modules/media/services/resolveGroupBaseFolder.service";
import { collaborativeEntriesForMember } from "@backend/modules/memberGroups/collaborativeEntriesForMember.service";

/**
 * Réinjecte, dans le listing du conteneur `groups`, les espaces des groupes
 * COLLABORATIFS connus en base — même vides.
 *
 * Cloudinary/R2 n'ont pas de vrais dossiers : un espace sans aucun asset
 * n'existe pas physiquement et s'évapore du listing. On rétablit la vérité en
 * fusionnant les dossiers dérivés de la base avec le résultat physique.
 *
 * Déduplication par le suffixe STABLE `-<groupId>` (et non le chemin complet) :
 * un groupe renommé a un dossier physique à l'ancien slug mais toujours le même
 * `-<groupId>` → on ne le réinjecte pas en double.
 *
 * Visibilité : admin → tous les groupes collaboratifs ; membre → ses espaces
 * accessibles. Le physique prime (aucun doublon).
 */
export async function mergeGroupSpaceFolders(params: {
  result: ListResult;
  prisma: PrismaClient;
  appRoot: string;
  userId: string;
}): Promise<ListResult> {
  const { result, prisma, appRoot, userId } = params;

  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: { select: { name: true } } },
  });
  const isAdmin = me?.role?.name === "ADMIN";

  const groupIds = isAdmin
    ? (
        await prisma.memberGroup.findMany({
          where: { isCollaborative: true },
          select: { id: true },
        })
      ).map((g) => g.id)
    : (await collaborativeEntriesForMember(prisma, userId)).map((e) => e.groupId);

  if (groupIds.length === 0) return result;

  const physicalPaths = result.folders.map((f) => f.path);
  const extra: StorageFolderNode[] = [];

  for (const groupId of groupIds) {
    // Déjà présent physiquement (même à un ancien slug) → on ne double pas.
    if (physicalPaths.some((p) => p.endsWith(`-${groupId}`))) continue;
    try {
      const path = await resolveGroupBaseFolder({ prisma, appRoot, groupId });
      extra.push({
        type: "folder",
        name: path.slice(path.lastIndexOf("/") + 1),
        path,
        hasChildren: false,
      });
    } catch {
      // Groupe disparu entre les deux requêtes : on l'ignore.
    }
  }

  if (extra.length === 0) return result;
  return { ...result, folders: [...result.folders, ...extra] };
}
TS
echo "écrit  $SVC"

# ── 2. Câblage dans le handler list ─────────────────────────────────────────
python3 - "$ROUTER" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "mergeGroupSpaceFolders" in s:
    print("router déjà câblé"); sys.exit(0)

# import
imp_anchor = 'import { collaborativeEntriesForMember } from "@backend/modules/memberGroups/collaborativeEntriesForMember.service";\n'
assert s.count(imp_anchor) == 1, "ancre import collaborativeEntriesForMember introuvable/multiple"
s = s.replace(
    imp_anchor,
    imp_anchor
    + 'import { mergeGroupSpaceFolders } from "@backend/modules/storage/mergeGroupSpaceFolders.service";\n',
)

# wiring dans list (l'ancre inclut enrichFilesWithStatus → unique à `list`)
old = (
    "      await enrichFilesWithStatus(ctx.prisma, ctx.appRoot, result.files);\n"
    "      return result;\n"
    "    }),\n"
)
assert s.count(old) == 1, "ancre fin de list introuvable/multiple"
new = (
    "      await enrichFilesWithStatus(ctx.prisma, ctx.appRoot, result.files);\n"
    "      // Espaces de groupe visibles même vides : Cloudinary/R2 n'ont pas de\n"
    "      // vrais dossiers, un espace sans asset s'évaporerait du listing.\n"
    "      if (input.path === `${ctx.appRoot}/groups`) {\n"
    "        return mergeGroupSpaceFolders({\n"
    "          result,\n"
    "          prisma: ctx.prisma,\n"
    "          appRoot: ctx.appRoot,\n"
    "          userId: ctx.user.id,\n"
    "        });\n"
    "      }\n"
    "      return result;\n"
    "    }),\n"
)
s = s.replace(old, new)

p.write_text(s, encoding="utf-8")
print("router câblé (list réinjecte les espaces de groupe)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck backend…"
if ! pnpm --filter backend typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck backend KO :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "fix(finder): affiche les espaces de groupe collaboratifs même vides (réinjection depuis la base)" \
  && echo "commit $(git rev-parse --short HEAD)"