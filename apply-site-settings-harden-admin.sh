#!/usr/bin/env bash
#
# AKFC — Réglages du site : durcissement admin de `siteSettings.save`.
#
# Avant : `save` = protectedProcedure (tout membre connecté peut écrire, calqué
# homeHero/sitePage). L'identité du site étant club-wide, on la réserve aux
# administrateurs — même mécanisme que `pageVisibility` (`assertAdmin`, role.name
# === "ADMIN"). `get` reste PUBLIC (header, onglet, e-mails le lisent pour les
# visiteurs anonymes).
#
# Édite le router créé à l'incrément 1 (ancres sur son contenu exact) :
#   1. imports  : + TRPCError (@trpc/server) + type PrismaClient (@prisma/client)
#   2. helper   : `assertAdmin(ctx)` (copie conforme de pageVisibility)
#   3. mutation : `.mutation(async …)` + `await assertAdmin(ctx)` en tête
#
# Aucune migration. Pas de generate (schéma inchangé). Prend effet côté serveur
# au prochain build de l'image `akfc` (comme le reste du router, pas encore
# déployé).
#
# Usage : bash apply-site-settings-harden-admin.sh
#         AKFC_APPLY_ONLY=1 bash apply-site-settings-harden-admin.sh   (clone)
#
set -euo pipefail

ROUTER="packages/backend/src/modules/siteSettings/router.ts"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$ROUTER" ]      || { echo "ERREUR: $ROUTER introuvable (incrément 1 pas appliqué ?)." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

python3 - "$ROUTER" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

if "assertAdmin" in s:
    print("déjà durci (assertAdmin présent)"); sys.exit(0)

# 1. imports
old_imp = (
    'import { z } from "zod";\n'
    '\n'
    'import { router, publicProcedure, protectedProcedure } from "@backend/trpc/core";\n'
)
assert s.count(old_imp) == 1, "ancre imports introuvable/multiple"
new_imp = (
    'import { z } from "zod";\n'
    'import { TRPCError } from "@trpc/server";\n'
    'import type { PrismaClient } from "@prisma/client";\n'
    '\n'
    'import { router, publicProcedure, protectedProcedure } from "@backend/trpc/core";\n'
)
s = s.replace(old_imp, new_imp)

# 2. helper assertAdmin (après le const SETTINGS_ID)
old_id = 'const SETTINGS_ID = "site";\n'
assert s.count(old_id) == 1, "ancre SETTINGS_ID introuvable/multiple"
helper = (
    'const SETTINGS_ID = "site";\n'
    '\n'
    '/** Réserve l\'action aux administrateurs (role.name === "ADMIN"). */\n'
    'async function assertAdmin(ctx: {\n'
    '  prisma: PrismaClient;\n'
    '  user: { id: string };\n'
    '}): Promise<void> {\n'
    '  const me = await ctx.prisma.user.findUnique({\n'
    '    where: { id: ctx.user.id },\n'
    '    select: { role: { select: { name: true } } },\n'
    '  });\n'
    '  if (me?.role?.name !== "ADMIN") {\n'
    '    throw new TRPCError({\n'
    '      code: "FORBIDDEN",\n'
    '      message: "Réservé aux administrateurs.",\n'
    '    });\n'
    '  }\n'
    '}\n'
)
s = s.replace(old_id, helper)

# 3. mutation async + gate
old_mut = (
    '    .mutation(({ ctx, input }) => {\n'
    '      const clean ='
)
assert s.count(old_mut) == 1, "ancre mutation introuvable/multiple"
new_mut = (
    '    .mutation(async ({ ctx, input }) => {\n'
    '      await assertAdmin(ctx);\n'
    '      const clean ='
)
s = s.replace(old_mut, new_mut)

p.write_text(s, encoding="utf-8")
print("router durci (siteSettings.save réservé ADMIN)")
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
git commit -m "feat(settings): réserve siteSettings.save aux ADMIN (assertAdmin, comme pageVisibility)" \
  && echo "commit $(git rev-parse --short HEAD)"