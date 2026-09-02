#!/usr/bin/env bash
#
# AKFC — Dépôt commun, A2 : garde de permission par destination (défense en profondeur).
#
# L'upload est déjà `protectedProcedure` (tout connecté) mais SANS restriction par
# destination (sauf group). Un non-admin pourrait donc, via un appel forgé,
# uploader vers une discipline/event. On resserre : un service commun
# `assertUploadDestinationAllowed` remplace les 4 blocs `if (kind==="group")` :
#   - group                    → assertCanWriteGroupSpace (inchangé)
#   - common_repository, perso → tout utilisateur connecté (perso = son espace)
#   - existing/new-discipline, event → ADMIN requis (isAdminByGroup)
#
# Les 4 mutations (createUploadAuthorization, registerUploadedAsset, createR2Upload,
# registerR2Upload) partagent le même `uploadDestinationSchema` → un garde typé
# sur l'union, exhaustif. Le typecheck prouve la couverture des kinds.
#
# Backend seul. typecheck backend + web.
#
# Usage : bash apply-depot-commun-a2-permission.sh
#         AKFC_APPLY_ONLY=1 bash apply-depot-commun-a2-permission.sh   (clone)
#
set -euo pipefail

SVC="packages/backend/src/modules/storage/assertUploadDestinationAllowed.service.ts"
ROUTER="packages/backend/src/modules/storage/router.ts"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$ROUTER" ]      || { echo "ERREUR: $ROUTER introuvable." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

# ── 1. Service garde ─────────────────────────────────────────────────────────
cat > "$SVC" <<'TS'
import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";

import type { UploadDestination } from "@contracts/cloudinary/upload.types";
import { assertCanWriteGroupSpace } from "@backend/modules/memberGroups/assertCanWriteGroupSpace.service";
import { isAdminByGroup } from "@backend/modules/memberGroups/isAdminByGroup.service";

/**
 * Autorise (ou refuse) une destination d'upload selon l'utilisateur.
 *
 *   - group                     : droit d'écriture sur l'espace (assertCanWriteGroupSpace)
 *   - common_repository, perso  : tout utilisateur CONNECTÉ (perso = son propre
 *                                 espace, dérivé de son userId côté serveur)
 *   - existing/new-discipline,
 *     event                     : réservé aux ADMIN (contenus curatés)
 *
 * Défense en profondeur : l'UI membre ne proposera que `common_repository`, mais
 * ce garde empêche aussi un appel d'API forgé de viser une destination curatée.
 * Le `switch` est exhaustif sur l'union — un nouveau `kind` casserait le
 * typecheck (signal voulu).
 */
export async function assertUploadDestinationAllowed(params: {
  prisma: PrismaClient;
  userId: string;
  destination: UploadDestination;
}): Promise<void> {
  const { prisma, userId, destination } = params;
  switch (destination.kind) {
    case "group":
      await assertCanWriteGroupSpace({
        prisma,
        userId,
        groupId: destination.groupId,
      });
      return;
    case "common_repository":
    case "perso":
      return;
    case "existing-discipline":
    case "new-discipline":
    case "event":
      if (!(await isAdminByGroup(prisma, userId))) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cette destination est réservée aux administrateurs.",
        });
      }
      return;
  }
}
TS
echo "créé  $SVC"

# ── 2. Router : import + remplacement des 4 blocs group ─────────────────────
python3 - "$ROUTER" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

# 2a. import : remplace assertCanWriteGroupSpace (devient inutile dans le router)
imp_old = "import { assertCanWriteGroupSpace } from '@backend/modules/memberGroups/assertCanWriteGroupSpace.service';"
imp_new = "import { assertUploadDestinationAllowed } from '@backend/modules/storage/assertUploadDestinationAllowed.service';"
if "assertUploadDestinationAllowed" in s:
    print("— router déjà migré (assertUploadDestinationAllowed présent)"); sys.exit(0)
assert imp_old in s, "ancre import assertCanWriteGroupSpace introuvable"
s = s.replace(imp_old, imp_new)

# 2b. les 4 blocs identiques → appel du garde
block_old = (
    '      if (input.destination.kind === "group") {\n'
    "        await assertCanWriteGroupSpace({\n"
    "          prisma: ctx.prisma,\n"
    "          userId: ctx.user.id,\n"
    "          groupId: input.destination.groupId,\n"
    "        });\n"
    "      }\n"
)
block_new = (
    "      await assertUploadDestinationAllowed({\n"
    "        prisma: ctx.prisma,\n"
    "        userId: ctx.user.id,\n"
    "        destination: input.destination,\n"
    "      });\n"
)
n = s.count(block_old)
assert n == 4, f"attendu 4 blocs group, trouvé {n}"
s = s.replace(block_old, block_new)

p.write_text(s, encoding="utf-8")
print("router : garde de destination sur les 4 mutations")

# garde-fou : assertCanWriteGroupSpace ne doit plus apparaître dans le router
if "assertCanWriteGroupSpace" in s:
    print("ATTENTION: assertCanWriteGroupSpace encore référencé dans le router — vérifie")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck backend…"
if ! pnpm --filter backend typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck backend KO :"; grep -nE "error TS|assertCanWrite|assertUpload|isAdminByGroup" /tmp/akfc_tc.log | head -20; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "feat(depot-commun): A2 — garde de destination (curatées = admin ; common_repository/perso = tout connecté)" \
  && echo "commit $(git rev-parse --short HEAD)"