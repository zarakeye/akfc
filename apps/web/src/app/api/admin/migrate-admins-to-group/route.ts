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
