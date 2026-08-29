#!/usr/bin/env bash
#
# AKFC — Auth role→groupe, PHASES C2+C3 (backend) : plus aucun check de rôle.
#
# Helper unique `isAdminByGroup(prisma, userId)` = membre du groupe Administrateurs.
#
#   C2 (procédures/route avec session) :
#     - disciplines.getAllForMenu (public)  → ctx.sessionClient.user.isAdmin
#     - page-access (route)                 → ctx.sessionClient.user.isAdmin
#     - storage ×3 (requêtes `me` retirées) → isAdminByGroup(ctx.prisma, ctx.user.id)
#     - pageVisibility.assertAdmin          → isAdminByGroup(ctx.prisma, ctx.user.id)
#   C3 (services memberGroups, sans ctx) :
#     - assertCanReadPath / assertCanWriteGroupSpace / assertCanTrashPaths
#                                           → isAdminByGroup(prisma, userId)
#
# Neutre (isAdminByGroup == ancien role-admin, donnée alignée). Après ça, plus
# personne ne lit `user.role` → prêt pour la phase D (formulaire) puis E (schéma).
#
# Backend + 1 route web, typecheck backend + web.
#
# Usage : bash apply-auth-phaseC23-backend.sh
#         AKFC_APPLY_ONLY=1 bash apply-auth-phaseC23-backend.sh   (clone)
#
set -euo pipefail

HELPER="packages/backend/src/modules/memberGroups/isAdminByGroup.service.ts"
IMPORT_LINE='import { isAdminByGroup } from "@backend/modules/memberGroups/isAdminByGroup.service";'

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "⚠️  Tu es sur '$BRANCH' — attendu : feat/auth-role-to-group. (Ctrl-C pour annuler.)"; sleep 3
  fi
fi

# ── Helper ───────────────────────────────────────────────────────────────────
cat > "$HELPER" <<'TS'
import type { PrismaClient } from "@prisma/client";

/**
 * Source de vérité unique « admin » : l'utilisateur est-il membre du groupe
 * Administrateurs (isAdminGroup) ? Remplace l'ancien check `role.name === "ADMIN"`
 * dans tout le backend sans accès à la session (services, helpers).
 */
export async function isAdminByGroup(
  prisma: PrismaClient,
  userId: string,
): Promise<boolean> {
  const membership = await prisma.memberGroupMembership.findFirst({
    where: { userId, group: { isAdminGroup: true } },
    select: { id: true },
  });
  return membership !== null;
}
TS
echo "écrit  $HELPER"

python3 - "$IMPORT_LINE" <<'PY'
import pathlib, sys
IMPORT = sys.argv[1] + "\n"

def prepend_import(path: str) -> None:
    p = pathlib.Path(path)
    s = p.read_text(encoding="utf-8")
    if "isAdminByGroup" in s:
        return
    p.write_text(IMPORT + s, encoding="utf-8")

def edit(path: str, old: str, new: str, *, required=True) -> None:
    p = pathlib.Path(path)
    if not p.exists():
        print(f"ERREUR: {path} introuvable", file=sys.stderr); sys.exit(1)
    s = p.read_text(encoding="utf-8")
    if new.strip() and new.strip() in s and old not in s:
        print(f"— {path}: déjà migré"); return
    n = s.count(old)
    if n == 0:
        if required:
            print(f"ERREUR: ancre introuvable dans {path}", file=sys.stderr); sys.exit(1)
        print(f"— {path}: ancre absente (ignoré)"); return
    assert n == 1, f"ancre multiple ({n}) dans {path}"
    p.write_text(s.replace(old, new), encoding="utf-8")
    print(f"✓ {path}")

STORAGE = "packages/backend/src/modules/storage/router.ts"
PAGEVIS = "packages/backend/src/modules/pageVisibility/router.ts"
DISC = "packages/backend/src/modules/disciplines/router.ts"
PAGEACCESS = "apps/web/src/app/api/page-access/route.ts"
SERVICES = [
    "packages/backend/src/modules/memberGroups/assertCanReadPath.service.ts",
    "packages/backend/src/modules/memberGroups/assertCanWriteGroupSpace.service.ts",
    "packages/backend/src/modules/memberGroups/assertCanTrashPaths.service.ts",
]

# ── C3 services (bloc identique dans les 3) ─────────────────────────────────
svc_old = (
    "  const user = await prisma.user.findUnique({\n"
    "    where: { id: userId },\n"
    "    select: { role: { select: { name: true } } },\n"
    "  });\n"
    '  if (user?.role?.name === "ADMIN") return;\n'
)
svc_new = "  if (await isAdminByGroup(prisma, userId)) return;\n"
for svc in SERVICES:
    prepend_import(svc)
    edit(svc, svc_old, svc_new)

# ── C2 storage ×3 (ancre = requête + ligne if distincte) ────────────────────
prepend_import(STORAGE)
edit(
    STORAGE,
    "    const me = await ctx.prisma.user.findUnique({\n"
    "      where: { id: ctx.user.id },\n"
    "      select: { role: { select: { name: true } } },\n"
    "    });\n"
    '    if (me?.role?.name === "ADMIN") {\n',
    "    if (await isAdminByGroup(ctx.prisma, ctx.user.id)) {\n",
)
edit(
    STORAGE,
    "    const me = await ctx.prisma.user.findUnique({\n"
    "      where: { id: ctx.user.id },\n"
    "      select: { role: { select: { name: true } } },\n"
    "    });\n"
    '    if (me?.role?.name !== "ADMIN") return [];\n',
    "    if (!(await isAdminByGroup(ctx.prisma, ctx.user.id))) return [];\n",
)
edit(
    STORAGE,
    "    const user = await ctx.prisma.user.findUnique({\n"
    "      where: { id: ctx.user.id },\n"
    "      select: { role: { select: { name: true } } },\n"
    "    });\n"
    '    const isAdmin = user?.role?.name === "ADMIN";\n',
    "    const isAdmin = await isAdminByGroup(ctx.prisma, ctx.user.id);\n",
)

# ── C2 pageVisibility.assertAdmin ───────────────────────────────────────────
prepend_import(PAGEVIS)
edit(
    PAGEVIS,
    "  const me = await ctx.prisma.user.findUnique({\n"
    "    where: { id: ctx.user.id },\n"
    "    select: { role: { select: { name: true } } },\n"
    "  });\n"
    '  if (me?.role?.name !== "ADMIN") {\n',
    "  if (!(await isAdminByGroup(ctx.prisma, ctx.user.id))) {\n",
)

# ── C2 disciplines (public, session) ────────────────────────────────────────
edit(
    DISC,
    '    const isAdmin = ctx.sessionClient?.user?.role?.name === "ADMIN";\n',
    "    const isAdmin = ctx.sessionClient?.user?.isAdmin ?? false;\n",
)

# ── C2 page-access route (session) ──────────────────────────────────────────
edit(
    PAGEACCESS,
    "  const userId = ctx.sessionClient?.user?.id;\n"
    "  if (userId) {\n"
    "    const me = await ctx.prisma.user.findUnique({\n"
    "      where: { id: userId },\n"
    "      select: { role: { select: { name: true } } },\n"
    "    });\n"
    '    if (me?.role?.name === "ADMIN") return Response.json({ allowed: true });\n'
    "  }\n",
    "  if (ctx.sessionClient?.user?.isAdmin) {\n"
    "    return Response.json({ allowed: true });\n"
    "  }\n",
)
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck backend…"
if ! pnpm --filter backend typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck backend KO :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "feat(auth): phases C2+C3 — backend (ctx + services) sur isAdminByGroup, plus aucun check de rôle" \
  && echo "commit $(git rev-parse --short HEAD)"