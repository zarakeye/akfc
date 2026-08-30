#!/usr/bin/env bash
#
# AKFC — Auth role→groupe, PHASE E1c-2 (backend) : dernier volet CODE.
#
#   - modules/index.ts        : démonte + retire les imports des routers role/permission
#   - modules/roles, /permissions : supprimés
#   - users/router.ts         : retire l'import updateUserRoleByIdSchema, les 3
#                               include:{role}, le select role:true, la mutation
#                               updateUserRoleById
#   - /api/session/route.ts   : include user:{role} → user:true
#   - trpc/middleware.ts      : retire l'export requirePermission (best-effort)
#   - contracts/index.ts      : retire les 3 exports de schémas
#   - contracts/forms/*.schema.ts : createUserForm / saveRoleForm / updateUserRoleById supprimés
#
# Après ça, plus AUCUNE référence à role/permission/roleId côté code → prêt pour
# E2 (schéma). Typecheck backend + web.
#
# Usage : bash apply-auth-phaseE1c2-backend.sh
#         AKFC_APPLY_ONLY=1 bash apply-auth-phaseE1c2-backend.sh   (clone)
#
set -euo pipefail

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "⚠️  Tu es sur '$BRANCH' — attendu : feat/auth-role-to-group. (Ctrl-C pour annuler.)"; sleep 3
  fi
fi

# ── Suppression des routers role/permission ─────────────────────────────────
rm -rf packages/backend/src/modules/roles packages/backend/src/modules/permissions
echo "routers roles/permissions supprimés"

python3 - <<'PY'
import pathlib, sys

def edit(path, old, new, *, required=True, count=1):
    p = pathlib.Path(path)
    if not p.exists():
        if required: print(f"ERREUR: {path} introuvable", file=sys.stderr); sys.exit(1)
        return
    s = p.read_text(encoding="utf-8")
    if old not in s:
        if (new and new in s) or not required:
            print(f"— {path}: ancre absente (déjà fait ?)"); return
        print(f"ERREUR: ancre introuvable dans {path}", file=sys.stderr); sys.exit(1)
    c = s.count(old)
    assert c == count, f"ancre x{c} (attendu {count}) dans {path}"
    p.write_text(s.replace(old, new), encoding="utf-8")
    print(f"✓ {path}" + (f" (x{count})" if count > 1 else ""))

# ── modules/index.ts ─────────────────────────────────────────────────────────
IDX = "packages/backend/src/modules/index.ts"
edit(IDX, 'import { roleRouter } from "@backend/modules/roles/router";\n', "")
edit(IDX, 'import { permissionRouter } from "@backend/modules/permissions/router";\n', "")
edit(IDX, "  role: roleRouter,\n", "")
edit(IDX, "  permission: permissionRouter,\n", "")

# ── users/router.ts ──────────────────────────────────────────────────────────
UR = "packages/backend/src/modules/users/router.ts"
edit(UR, 'import { updateUserRoleByIdSchema } from "@contracts/forms/updateUserRoleById.schema";\n', "")
# 3 include:{role} identiques (getAll/getById/getByEmail)
edit(UR,
"""        relationLoadStrategy: "join",
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
""", "", count=3)
# select role:true (getCurrentUserProfile)
edit(UR,
"""        isFirstLogin: true,
        role: true,
      },
""",
"""        isFirstLogin: true,
      },
""")
# mutation updateUserRoleById (version branche : .use(isAdmin) après E1a)
edit(UR,
"""  updateUserRoleById: protectedProcedure
    .use(isAdmin)
    .input(updateUserRoleByIdSchema)
    .mutation(async ({ ctx, input }) => {
      const actorId = ctx.sessionClient.user.id;

      if (actorId === input.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot change your own role.",
        });
      }

      const role = await ctx.prisma.role.findUnique({
        where: { id: input.roleId },
        select: { id: true },
      });

      if (!role) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Role not found",
        });
      }

      const user = await ctx.prisma.user.update({
        where: { id: input.userId },
        data: { roleId: input.roleId },
        relationLoadStrategy: "join",
        include: {
          role: {
            include: {
              permissions: {
                include: { permission: true },
              },
            },
          },
        },
      });

      return user;
    }),

""", "")

# ── /api/session ─────────────────────────────────────────────────────────────
edit("apps/web/src/app/api/session/route.ts",
     "include: { user: { include: { role: true } } },",
     "include: { user: true },")

# ── middleware : retirer l'export requirePermission (best-effort) ────────────
edit("packages/backend/src/trpc/middleware.ts",
"""export const requirePermission = (permissionName: string) =>
  t.middleware(({ ctx, next }) => {
    const user = ctx.sessionClient?.user;

    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Authentication required.",
      });
    }

    // Auth collapsée sur le groupe Administrateurs : toute permission ⇒
    // réservé aux admins (source unique user.isAdmin). Signature conservée →
    // les sites d'appel `requirePermission(...)` ne changent pas.
    if (!user.isAdmin) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Missing permission: ${permissionName}`,
      });
    }

    return next();
  });

""", "", required=False)

# ── contracts/index.ts : retirer les 3 exports de schémas ────────────────────
CIDX = "packages/contracts/src/index.ts"
edit(CIDX, "export * from '@contracts/forms/createUserForm.schema';\n", "", required=False)
edit(CIDX, "export * from '@contracts/forms/saveRoleForm.schema';\n", "", required=False)
edit(CIDX, "export * from '@contracts/forms/updateUserRoleById.schema';\n", "", required=False)
PY

# ── Suppression des 3 schémas ────────────────────────────────────────────────
rm -f packages/contracts/src/forms/createUserForm.schema.ts \
      packages/contracts/src/forms/saveRoleForm.schema.ts \
      packages/contracts/src/forms/updateUserRoleById.schema.ts
echo "schémas createUserForm/saveRoleForm/updateUserRoleById supprimés"

# ── Garde-fou : plus aucune référence code à role/roleId/Permission ? ────────
echo "--- références résiduelles (hors schema.prisma / migrations / node_modules) ---"
grep -rn 'requirePermission\|updateUserRoleById\|roleRouter\|permissionRouter\|\broleId\b' \
  packages/backend/src packages/contracts/src apps/web/src --include=*.ts --include=*.tsx 2>/dev/null \
  | grep -v node_modules || echo "  (aucune)"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck backend…"
if ! pnpm --filter backend typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck backend KO :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head -20; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|role|Role" /tmp/akfc_tc.log | head -20; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "refactor(auth): phase E1c-2 — role retiré du backend (routers, users router, session, middleware, schémas)" \
  && echo "commit $(git rev-parse --short HEAD)"