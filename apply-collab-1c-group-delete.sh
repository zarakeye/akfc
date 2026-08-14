#!/usr/bin/env bash
#
# AKFC — Chantier collaboratif, incrément 1c : suppression (corbeille) dans
# l'espace d'un groupe.
#
# Ouvre `trash.trashToBin` aux non-admins, mais SCOPÉ : un membre ne peut
# envoyer à la corbeille QUE des cibles situées dans un espace de groupe
# collaboratif dont il est EDITOR. Toute cible hors espace de groupe, ou dans un
# groupe où il n'est pas EDITOR, est refusée (FORBIDDEN). La purge définitive
# (deleteForever / purge) et le reste de la corbeille (listBin / readTrashFolder
# / restoreFromBin) RESTENT admin.
#
# Miroir de la garde de dépôt (1b), mais côté suppression : ici la cible est un
# CHEMIN, donc on extrait le groupId du segment `groups/${slug}-${groupId}`.
#
# Fichiers :
#   - NOUVEAU assertCanTrashPaths.service.ts (extraction groupId + garde)
#   - trash/router.ts : trashToBin passe protectedProcedure + garde + import
#
# Prérequis : incréments 1a (access) et 1b déjà appliqués. Pas de migration.
#
# Usage : bash apply-collab-1c-group-delete.sh
#         AKFC_APPLY_ONLY=1 bash apply-collab-1c-group-delete.sh   (clone)
#
set -euo pipefail

ROUTER="packages/backend/src/modules/trash/router.ts"
GUARD="packages/backend/src/modules/memberGroups/assertCanTrashPaths.service.ts"

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

# ── Router trash : import + trashToBin protectedProcedure + garde ───────────
python3 - "$ROUTER" <<'PY'
import sys, pathlib
rp = pathlib.Path(sys.argv[1]); s = rp.read_text(encoding="utf-8")

if "assertCanTrashPaths" in s:
    print("router trash déjà à jour")
else:
    IMP_OLD = 'import { trashToBin } from "@backend/modules/trash/services/trashToBin.service";'
    IMP_NEW = (IMP_OLD + "\n"
               'import { assertCanTrashPaths } from "@backend/modules/memberGroups/assertCanTrashPaths.service";')
    assert s.count(IMP_OLD) == 1, "ancre import trashToBin introuvable"
    s = s.replace(IMP_OLD, IMP_NEW)

    P_OLD = ("  trashToBin: adminProcedure\n"
             "    .input(trashToBinInputSchema)\n"
             "    .mutation(async ({ ctx, input }): Promise<TrashToBinOutput> => {\n"
             "      const sources = input.logical")
    P_NEW = ("  trashToBin: protectedProcedure\n"
             "    .input(trashToBinInputSchema)\n"
             "    .mutation(async ({ ctx, input }): Promise<TrashToBinOutput> => {\n"
             "      // Garde : admin partout ; sinon uniquement dans un espace de groupe\n"
             "      // (`groups/…`) dont l'utilisateur est EDITOR. Purge/restore restent admin.\n"
             "      await assertCanTrashPaths({\n"
             "        prisma: ctx.prisma,\n"
             "        userId: ctx.user.id,\n"
             "        paths: input.sources.flatMap((source) =>\n"
             '          source.kind === "selection" ? source.roots : [source.fullPath],\n'
             "        ),\n"
             "      });\n"
             "\n"
             "      const sources = input.logical")
    assert s.count(P_OLD) == 1, "ancre trashToBin introuvable"
    s = s.replace(P_OLD, P_NEW)

    rp.write_text(s, encoding="utf-8")
    print("router trash patché (trashToBin protectedProcedure + garde)")
PY

# ── Garde partagée (nouveau fichier) ────────────────────────────────────────
if [ ! -f "$GUARD" ]; then
  cat > "$GUARD" <<'TS'
import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";

/**
 * Extrait le groupId d'un chemin (logique ou physique) situé dans l'espace d'un
 * groupe collaboratif : `.../groups/${slug}-${groupId}/...`. Le groupId (cuid)
 * ne contient pas de tiret, il suit donc le DERNIER tiret du segment.
 * Renvoie null si le chemin n'est pas dans un espace de groupe.
 */
export function groupIdFromLogicalPath(path: string): string | null {
  const parts = path.split("/").filter(Boolean);
  const i = parts.indexOf("groups");
  if (i === -1 || i + 1 >= parts.length) return null;
  const segment = parts[i + 1];
  const dash = segment.lastIndexOf("-");
  if (dash === -1) return null;
  const groupId = segment.slice(dash + 1);
  return groupId.length > 0 ? groupId : null;
}

/**
 * Garde de SUPPRESSION (mise en corbeille) : un ADMIN peut tout envoyer à la
 * corbeille ; un non-admin ne le peut QUE pour des cibles situées dans un
 * espace de groupe collaboratif dont il est membre EDITOR. Toute cible hors
 * d'un espace de groupe, ou dans un groupe où il n'est pas EDITOR, est refusée.
 */
export async function assertCanTrashPaths(params: {
  prisma: PrismaClient;
  userId: string;
  paths: readonly string[];
}): Promise<void> {
  const { prisma, userId, paths } = params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: { select: { name: true } } },
  });
  if (user?.role?.name === "ADMIN") return;

  for (const path of paths) {
    const groupId = groupIdFromLogicalPath(path);
    if (!groupId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Suppression hors espace de groupe réservée aux admins.",
      });
    }
    const membership = await prisma.memberGroupMembership.findUnique({
      where: { groupId_userId: { groupId, userId } },
      select: { access: true },
    });
    if (!membership || membership.access !== "EDITOR") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Suppression réservée aux éditeurs de ce groupe.",
      });
    }
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
if git commit -m "feat(groups): suppression (corbeille) scopée aux éditeurs dans l'espace du groupe" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi