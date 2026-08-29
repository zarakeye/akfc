#!/usr/bin/env bash
#
# AKFC — Auth role→groupe, PHASE 0 (donnée) : admins → groupe Administrateurs.
#
# Prérequis conceptuel : on bascule la source de vérité « admin » vers
# l'appartenance au groupe Administrateurs (isAdminGroup). AVANT tout changement
# de code d'auth, il faut que la donnée reflète ça, sinon les admins se
# verrouillent dehors.
#
# CE QUE FAIT LA ROUTE : pour chaque user de rôle ADMIN, crée (si absente) une
# adhésion `MemberGroupMembership` au groupe Administrateurs (access EDITOR).
# Idempotent (skipDuplicates + @@unique(groupId,userId)). L'auth continue de lire
# `role` à ce stade : AUCUN changement de comportement.
#
# Le report signale aussi les membres INATTENDUS du groupe Administrateurs (ceux
# qui n'ont pas role=ADMIN) — ils deviendraient admin au basculement (phase B/C).
# À vérifier avant d'aller plus loin.
#
# Réservée ADMIN (session, via le rôle — encore actif). Dry-run par défaut :
#   GET /api/admin/migrate-admins-to-group          → aperçu
#   GET /api/admin/migrate-admins-to-group?apply=1  → applique
#
# 1 fichier neuf (route), typecheck web. À lancer sur la branche feat/auth-role-to-group,
# en local d'abord.
#
# Usage : bash apply-auth-phase0-admins-to-group.sh
#         AKFC_APPLY_ONLY=1 bash apply-auth-phase0-admins-to-group.sh   (clone)
#
set -euo pipefail

ROUTE_DIR="apps/web/src/app/api/admin/migrate-admins-to-group"
ROUTE="$ROUTE_DIR/route.ts"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "⚠️  Tu es sur '$BRANCH' — ce chantier doit se faire sur feat/auth-role-to-group."
    echo "   (Ctrl-C pour annuler.)"; sleep 3
  fi
fi

mkdir -p "$ROUTE_DIR"
cat > "$ROUTE" <<'TS'
/**
 * 🛠 Route admin — PHASE 0 auth role→groupe.
 *
 * Aligne l'appartenance au groupe Administrateurs (isAdminGroup) sur les users de
 * rôle ADMIN, avant de basculer la source de vérité « admin » vers le groupe.
 * Idempotent. Réservée ADMIN. Dry-run par défaut ; `?apply=1` pour écrire.
 */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createTRPCContext } from "@backend/trpc";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<Response> {
  const ctx = await createTRPCContext({ req });

  const userId = ctx.sessionClient?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  const me = await ctx.prisma.user.findUnique({
    where: { id: userId },
    select: { role: { select: { name: true } } },
  });
  if (me?.role?.name !== "ADMIN") {
    return NextResponse.json(
      { error: "Réservé aux administrateurs." },
      { status: 403 },
    );
  }

  const apply = req.nextUrl.searchParams.get("apply") === "1";

  try {
    const adminGroup = await ctx.prisma.memberGroup.findFirst({
      where: { isAdminGroup: true },
      select: { id: true, name: true },
    });
    if (!adminGroup) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Groupe Administrateurs (isAdminGroup) introuvable — ensureAdminGroup a-t-il tourné ?",
        },
        { status: 500 },
      );
    }

    const adminUsers = await ctx.prisma.user.findMany({
      where: { role: { name: "ADMIN" } },
      select: { id: true, email: true },
    });

    const existing = await ctx.prisma.memberGroupMembership.findMany({
      where: {
        groupId: adminGroup.id,
        userId: { in: adminUsers.map((u) => u.id) },
      },
      select: { userId: true },
    });
    const existingSet = new Set(existing.map((e) => e.userId));
    const toAdd = adminUsers.filter((u) => !existingSet.has(u.id));

    // Membres INATTENDUS : dans le groupe Administrateurs mais role != ADMIN.
    // Ils deviendraient admin au basculement — à vérifier.
    const groupMembers = await ctx.prisma.memberGroupMembership.findMany({
      where: { groupId: adminGroup.id },
      select: { user: { select: { email: true, role: { select: { name: true } } } } },
    });
    const unexpectedMembers = groupMembers
      .filter((m) => m.user.role?.name !== "ADMIN")
      .map((m) => m.user.email);

    if (apply && toAdd.length > 0) {
      await ctx.prisma.memberGroupMembership.createMany({
        data: toAdd.map((u) => ({
          groupId: adminGroup.id,
          userId: u.id,
          access: "EDITOR" as const,
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json({
      ok: true,
      apply,
      adminGroup: adminGroup.name,
      adminUsers: adminUsers.length,
      alreadyMembers: existingSet.size,
      added: apply ? toAdd.map((u) => u.email) : [],
      wouldAdd: apply ? [] : toAdd.map((u) => u.email),
      unexpectedMembers,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
TS
echo "écrit  $ROUTE"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head; tail -6 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "chore(auth): phase 0 — route de migration des admins vers le groupe Administrateurs (dry-run par défaut)" \
  && echo "commit $(git rev-parse --short HEAD)"