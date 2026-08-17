#!/usr/bin/env bash
#
# AKFC — Étape 3b (gardes) : HÉRITAGE d'accès à l'enforcement.
#
# Un membre d'un groupe PARENT hérite de l'accès (même niveau) aux espaces des
# groupes DESCENDANTS. On remplace, dans les 3 gardes, la vérification
# d'appartenance DIRECTE par un helper qui remonte la chaîne des ancêtres
# (parentGroupId) et prend le niveau MAXIMUM (EDITOR > VIEWER > NONE).
#
#   - NOUVEAU `resolveGroupAccessForUser.service.ts`
#   - assertCanWriteGroupSpace : EDITOR effectif (direct ou hérité)
#   - assertCanReadPath        : accès effectif != NONE
#   - assertCanTrashPaths      : EDITOR effectif par chemin
#
# (myCollaborativeSpaces, pour que le membre VOIE les espaces descendants,
#  = incrément suivant 3b-spaces.)
#
# Prérequis : 1a-1e + 3a (parentGroupId). Pas de migration.
# Usage : bash apply-collab-3b-guards-inheritance.sh
#         AKFC_APPLY_ONLY=1 bash apply-collab-3b-guards-inheritance.sh   (clone)
#
set -euo pipefail

DIR="packages/backend/src/modules/memberGroups"
HELPER="$DIR/resolveGroupAccessForUser.service.ts"
WRITE="$DIR/assertCanWriteGroupSpace.service.ts"
READ="$DIR/assertCanReadPath.service.ts"
TRASH="$DIR/assertCanTrashPaths.service.ts"

for f in "package.json" "$WRITE" "$READ" "$TRASH"; do
  [ -f "$f" ] || { echo "ERREUR: fichier attendu manquant: $f (prérequis 1b/1c/1e ?)." >&2; exit 1; }
done

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "ERREUR: tu es sur '$BRANCH'. Le chantier va sur sa branche." >&2
    echo "  git switch feat/groupes-collaboratifs" >&2
    exit 1
  fi
fi

# ── helper ──────────────────────────────────────────────────────────────────
if [ ! -f "$HELPER" ]; then
  cat > "$HELPER" <<'TS'
import type { PrismaClient } from "@prisma/client";

export type GroupAccessLevel = "NONE" | "VIEWER" | "EDITOR";

/**
 * Accès EFFECTIF d'un utilisateur à l'espace d'un groupe, HÉRITAGE compris.
 *
 * On remonte la chaîne des ancêtres (parentGroupId) depuis le groupe visé et on
 * prend le niveau MAXIMUM parmi l'appartenance directe et celles aux groupes
 * ancêtres (EDITOR > VIEWER > NONE). Un membre d'un groupe parent hérite ainsi
 * de l'accès (même niveau) aux espaces des groupes descendants.
 *
 * NB : ne traite PAS l'admin (les gardes court-circuitent l'admin en amont).
 */
export async function resolveGroupAccessForUser(
  prisma: PrismaClient,
  userId: string,
  groupId: string,
): Promise<GroupAccessLevel> {
  let best: GroupAccessLevel = "NONE";
  let cursor: string | null = groupId;
  const seen = new Set<string>();

  while (cursor && !seen.has(cursor)) {
    seen.add(cursor);

    const membership = await prisma.memberGroupMembership.findUnique({
      where: { groupId_userId: { groupId: cursor, userId } },
      select: { access: true },
    });
    if (membership?.access === "EDITOR") return "EDITOR";
    if (membership?.access === "VIEWER") best = "VIEWER";

    const group: { parentGroupId: string | null } | null =
      await prisma.memberGroup.findUnique({
        where: { id: cursor },
        select: { parentGroupId: true },
      });
    cursor = group?.parentGroupId ?? null;
  }

  return best;
}
TS
  echo "helper écrit : $HELPER"
else
  echo "helper déjà présent"
fi

IMP='import { resolveGroupAccessForUser } from "@backend/modules/memberGroups/resolveGroupAccessForUser.service";'

# ── assertCanWriteGroupSpace ────────────────────────────────────────────────
python3 - "$WRITE" "$IMP" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); imp = sys.argv[2]; s = p.read_text(encoding="utf-8")
if "resolveGroupAccessForUser" in s:
    print("write déjà à jour"); sys.exit(0)
anchor_imp = 'import type { PrismaClient } from "@prisma/client";'
assert s.count(anchor_imp) == 1, "ancre import (write)"
s = s.replace(anchor_imp, anchor_imp + "\n" + imp)

OLD = ('  const membership = await prisma.memberGroupMembership.findUnique({\n'
       '    where: { groupId_userId: { groupId, userId } },\n'
       '    select: { access: true },\n'
       '  });\n'
       '\n'
       '  if (!membership || membership.access !== "EDITOR") {\n'
       '    throw new TRPCError({\n'
       '      code: "FORBIDDEN",\n'
       '      message: "Dépôt réservé aux éditeurs de ce groupe.",\n'
       '    });\n'
       '  }')
NEW = ('  const access = await resolveGroupAccessForUser(prisma, userId, groupId);\n'
       '  if (access !== "EDITOR") {\n'
       '    throw new TRPCError({\n'
       '      code: "FORBIDDEN",\n'
       '      message: "Dépôt réservé aux éditeurs de ce groupe.",\n'
       '    });\n'
       '  }')
assert s.count(OLD) == 1, "ancre membership (write)"
s = s.replace(OLD, NEW)
p.write_text(s, encoding="utf-8"); print("assertCanWriteGroupSpace patché")
PY

# ── assertCanReadPath ───────────────────────────────────────────────────────
python3 - "$READ" "$IMP" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); imp = sys.argv[2]; s = p.read_text(encoding="utf-8")
if "resolveGroupAccessForUser" in s:
    print("read déjà à jour"); sys.exit(0)
anchor_imp = 'import type { PrismaClient } from "@prisma/client";'
assert s.count(anchor_imp) == 1, "ancre import (read)"
s = s.replace(anchor_imp, anchor_imp + "\n" + imp)

OLD = ('  const membership = await prisma.memberGroupMembership.findUnique({\n'
       '    where: { groupId_userId: { groupId, userId } },\n'
       '    select: { access: true },\n'
       '  });\n'
       '  if (!membership) {\n'
       '    throw new TRPCError({\n'
       '      code: "FORBIDDEN",\n'
       '      message: "Accès refusé à ce dossier.",\n'
       '    });\n'
       '  }')
NEW = ('  const access = await resolveGroupAccessForUser(prisma, userId, groupId);\n'
       '  if (access === "NONE") {\n'
       '    throw new TRPCError({\n'
       '      code: "FORBIDDEN",\n'
       '      message: "Accès refusé à ce dossier.",\n'
       '    });\n'
       '  }')
assert s.count(OLD) == 1, "ancre membership (read)"
s = s.replace(OLD, NEW)
p.write_text(s, encoding="utf-8"); print("assertCanReadPath patché")
PY

# ── assertCanTrashPaths ─────────────────────────────────────────────────────
python3 - "$TRASH" "$IMP" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); imp = sys.argv[2]; s = p.read_text(encoding="utf-8")
if "resolveGroupAccessForUser" in s:
    print("trash déjà à jour"); sys.exit(0)
anchor_imp = 'import type { PrismaClient } from "@prisma/client";'
assert s.count(anchor_imp) == 1, "ancre import (trash)"
s = s.replace(anchor_imp, anchor_imp + "\n" + imp)

OLD = ('    const membership = await prisma.memberGroupMembership.findUnique({\n'
       '      where: { groupId_userId: { groupId, userId } },\n'
       '      select: { access: true },\n'
       '    });\n'
       '    if (!membership || membership.access !== "EDITOR") {\n'
       '      throw new TRPCError({\n'
       '        code: "FORBIDDEN",\n'
       '        message: "Suppression réservée aux éditeurs de ce groupe.",\n'
       '      });\n'
       '    }')
NEW = ('    const access = await resolveGroupAccessForUser(prisma, userId, groupId);\n'
       '    if (access !== "EDITOR") {\n'
       '      throw new TRPCError({\n'
       '        code: "FORBIDDEN",\n'
       '        message: "Suppression réservée aux éditeurs de ce groupe.",\n'
       '      });\n'
       '    }')
assert s.count(OLD) == 1, "ancre membership (trash)"
s = s.replace(OLD, NEW)
p.write_text(s, encoding="utf-8"); print("assertCanTrashPaths patché")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"
  exit 0
fi

echo "typecheck (backend + web, direct)…"
if ! { pnpm --filter backend typecheck && pnpm --filter web typecheck; } > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
git add -A
if git commit -m "feat(groups): étape 3b — héritage d'accès dans les gardes (remontée des ancêtres)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi