#!/usr/bin/env bash
#
# AKFC — Chantier collaboratif, incrément 1e : scoping LECTURE du finder.
#
# Ferme le dernier volet de l'étape 1. Aujourd'hui les lectures du finder
# (list / getTree / getNode / getMetadata) sont protectedProcedure SANS garde de
# chemin : un non-admin authentifié pourrait lire n'importe quel dossier.
# On ajoute une garde : un ADMIN lit partout ; un non-admin ne lit QUE dans
# l'espace d'un groupe collaboratif dont il est MEMBRE (VIEWER ou EDITOR — la
# consultation est ouverte aux deux). Aucune surface membre/publique n'appelle
# ces lectures aujourd'hui (audit), donc rien d'existant n'est cassé.
#
# + query `storage.myCollaborativeSpaces` : les racines de finder d'un membre
#   (chemin + droit par groupe collaboratif) — de quoi câbler un finder membre.
#
# Fichiers :
#   - NOUVEAU assertCanReadPath.service.ts (réutilise groupIdFromLogicalPath de 1c)
#   - storage/router.ts : 2 imports + garde ×4 (lectures) + myCollaborativeSpaces
#
# Prérequis : 1a, 1b, 1c appliqués. Pas de migration.
#
# Usage : bash apply-collab-1e-finder-read-scope.sh
#         AKFC_APPLY_ONLY=1 bash apply-collab-1e-finder-read-scope.sh   (clone)
#
set -euo pipefail

ROUTER="packages/backend/src/modules/storage/router.ts"
GUARD="packages/backend/src/modules/memberGroups/assertCanReadPath.service.ts"

if [ ! -f "package.json" ] || [ ! -f "$ROUTER" ]; then
  echo "ERREUR: lance depuis la racine du repo AKFC ($ROUTER attendu)." >&2
  exit 1
fi

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "ERREUR: tu es sur '$BRANCH'. Le chantier collaboratif va sur sa branche." >&2
    echo "  git switch feat/groupes-collaboratifs" >&2
    exit 1
  fi
fi

python3 - "$ROUTER" <<'PY'
import sys, pathlib
rp = pathlib.Path(sys.argv[1]); s = rp.read_text(encoding="utf-8")

if "assertCanReadPath" in s:
    print("router storage déjà à jour (lecture)")
    sys.exit(0)

def sub(old, new, label):
    assert s.count(old) == 1, f"ancre introuvable/multiple: {label}"
    return s.replace(old, new)

READ_GUARD = (
    "      await assertCanReadPath({\n"
    "        prisma: ctx.prisma,\n"
    "        userId: ctx.user.id,\n"
    "        path: input.path,\n"
    "      });\n"
)

# imports (ancrés sur un import pristine, présent avant/après 1b)
s = sub(
    "import { resolvePendingUploadFolder } from '@backend/modules/cloudinary/services/resolvePendingUploadFolder.service';",
    "import { resolvePendingUploadFolder } from '@backend/modules/cloudinary/services/resolvePendingUploadFolder.service';\n"
    "import { assertCanReadPath } from \"@backend/modules/memberGroups/assertCanReadPath.service\";\n"
    "import { resolveGroupBaseFolder } from \"@backend/modules/media/services/resolveGroupBaseFolder.service\";",
    "imports 1e")

# myCollaborativeSpaces après listGeneralFolders
s = sub(
    "  listGeneralFolders: protectedProcedure.query(async ({ ctx }) => {\n"
    "    return listGeneralFolders({ prisma: ctx.prisma, appRoot: ctx.appRoot });\n"
    "  }),",
    "  listGeneralFolders: protectedProcedure.query(async ({ ctx }) => {\n"
    "    return listGeneralFolders({ prisma: ctx.prisma, appRoot: ctx.appRoot });\n"
    "  }),\n"
    "\n"
    "  /**\n"
    "   * Espaces des groupes collaboratifs accessibles à l'utilisateur courant\n"
    "   * (racines du finder côté membre) : chemin + droit par groupe.\n"
    "   */\n"
    "  myCollaborativeSpaces: protectedProcedure.query(async ({ ctx }) => {\n"
    "    const memberships = await ctx.prisma.memberGroupMembership.findMany({\n"
    "      where: { userId: ctx.user.id, group: { isCollaborative: true } },\n"
    "      select: { access: true, group: { select: { id: true, name: true } } },\n"
    "    });\n"
    "    return Promise.all(\n"
    "      memberships.map(async (m) => ({\n"
    "        groupId: m.group.id,\n"
    "        name: m.group.name,\n"
    "        access: m.access,\n"
    "        path: await resolveGroupBaseFolder({\n"
    "          prisma: ctx.prisma,\n"
    "          appRoot: ctx.appRoot,\n"
    "          groupId: m.group.id,\n"
    "        }),\n"
    "      })),\n"
    "    );\n"
    "  }),",
    "myCollaborativeSpaces")

# garde de lecture ×4 (chaque ancre démarre par le nom UNIQUE de la procédure)
s = sub(
    "  list: protectedProcedure\n"
    "    .input(\n"
    "      z.object({\n"
    "        provider: storageProviderSchema.optional(),\n"
    "        path: z.string().min(1),\n"
    "        cursor: z.string().optional(),\n"
    "        limit: z.number().int().positive().optional(),\n"
    "        logical: z.boolean().optional(),\n"
    "      })\n"
    "    )\n"
    "    .query(async ({ ctx, input }) => {\n"
    "      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };",
    "  list: protectedProcedure\n"
    "    .input(\n"
    "      z.object({\n"
    "        provider: storageProviderSchema.optional(),\n"
    "        path: z.string().min(1),\n"
    "        cursor: z.string().optional(),\n"
    "        limit: z.number().int().positive().optional(),\n"
    "        logical: z.boolean().optional(),\n"
    "      })\n"
    "    )\n"
    "    .query(async ({ ctx, input }) => {\n"
    + READ_GUARD +
    "      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };",
    "garde list")

s = sub(
    "  getTree: protectedProcedure\n"
    "    .input(\n"
    "      z.object({\n"
    "        provider: storageProviderSchema.optional(),\n"
    "        path: z.string().min(1),\n"
    "        depth: z.number().int().positive().optional(),\n"
    "        logical: z.boolean().optional(),\n"
    "      })\n"
    "    )\n"
    "    .query(async ({ ctx, input }) => {\n"
    "      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };",
    "  getTree: protectedProcedure\n"
    "    .input(\n"
    "      z.object({\n"
    "        provider: storageProviderSchema.optional(),\n"
    "        path: z.string().min(1),\n"
    "        depth: z.number().int().positive().optional(),\n"
    "        logical: z.boolean().optional(),\n"
    "      })\n"
    "    )\n"
    "    .query(async ({ ctx, input }) => {\n"
    + READ_GUARD +
    "      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };",
    "garde getTree")

s = sub(
    "  getNode: protectedProcedure\n"
    "    .input(\n"
    "      z.object({\n"
    "        provider: storageProviderSchema.optional(),\n"
    "        path: z.string().min(1),\n"
    "        logical: z.boolean().optional(),\n"
    "      })\n"
    "    )\n"
    "    .query(async ({ ctx, input }) => {\n"
    "      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };",
    "  getNode: protectedProcedure\n"
    "    .input(\n"
    "      z.object({\n"
    "        provider: storageProviderSchema.optional(),\n"
    "        path: z.string().min(1),\n"
    "        logical: z.boolean().optional(),\n"
    "      })\n"
    "    )\n"
    "    .query(async ({ ctx, input }) => {\n"
    + READ_GUARD +
    "      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };",
    "garde getNode")

s = sub(
    "  getMetadata: protectedProcedure\n"
    "    .input(\n"
    "      z.object({\n"
    "        provider: storageProviderSchema.optional(),\n"
    "        path: z.string().min(1),\n"
    "        logical: z.boolean().optional(),\n"
    "      })\n"
    "    )\n"
    "    .query(async ({ ctx, input }) => {\n"
    "      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };",
    "  getMetadata: protectedProcedure\n"
    "    .input(\n"
    "      z.object({\n"
    "        provider: storageProviderSchema.optional(),\n"
    "        path: z.string().min(1),\n"
    "        logical: z.boolean().optional(),\n"
    "      })\n"
    "    )\n"
    "    .query(async ({ ctx, input }) => {\n"
    + READ_GUARD +
    "      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };",
    "garde getMetadata")

rp.write_text(s, encoding="utf-8")
print("router storage patché (garde lecture ×4 + myCollaborativeSpaces + imports)")
PY

# ── Garde de lecture (nouveau fichier) ──────────────────────────────────────
if [ ! -f "$GUARD" ]; then
  cat > "$GUARD" <<'TS'
import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";
import { groupIdFromLogicalPath } from "@backend/modules/memberGroups/assertCanTrashPaths.service";

/**
 * Garde de LECTURE du finder : un ADMIN lit partout ; un non-admin ne peut lire
 * QUE dans l'espace d'un groupe collaboratif dont il est MEMBRE (VIEWER ou
 * EDITOR — la consultation est ouverte aux deux). Tout chemin hors d'un espace
 * de groupe (racine, `groups` nu, general, perso, disciplines, autre groupe)
 * est refusé (FORBIDDEN) pour un non-admin.
 */
export async function assertCanReadPath(params: {
  prisma: PrismaClient;
  userId: string;
  path: string;
}): Promise<void> {
  const { prisma, userId, path } = params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: { select: { name: true } } },
  });
  if (user?.role?.name === "ADMIN") return;

  const groupId = groupIdFromLogicalPath(path);
  if (!groupId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Accès refusé à ce dossier.",
    });
  }

  const membership = await prisma.memberGroupMembership.findUnique({
    where: { groupId_userId: { groupId, userId } },
    select: { access: true },
  });
  if (!membership) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Accès refusé à ce dossier.",
    });
  }
}
TS
  echo "garde écrite : $GUARD"
else
  echo "garde déjà présente"
fi

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de prisma generate, ni typecheck, ni commit"
  exit 0
fi

echo "prisma generate…"
pnpm prisma generate > /tmp/akfc_gen.log 2>&1 || { echo "❌ prisma generate a échoué :"; tail -8 /tmp/akfc_gen.log; exit 1; }
echo "✅ client régénéré"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  echo "aucune modification"; exit 0
fi

if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then TC="check"; else TC="typecheck"; fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

git add -A
if git commit -m "feat(groups): scoping lecture finder (non-admin borné à ses espaces de groupe) + myCollaborativeSpaces" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi