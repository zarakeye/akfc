import type { Prisma, PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { ensureGroupSpaceFolder } from "#modules/memberGroups/ensureGroupSpaceFolder.service.ts";
import {
  SYSTEM_GROUP_KINDS,
  SYSTEM_GROUP_NAME,
  isAdultGroup,
  type SystemGroupKindValue,
} from "@akfc/contracts/groups/systemGroups.ts";
import { effectiveLegalAge } from "@akfc/contracts/legal/imageConsent.ts";

/** Prisma : les groupes dont les membres sont majeurs d'office (Administrateurs, Instructeurs, Bureau). */
export const ADULT_GROUP_WHERE = {
  OR: [{ isAdminGroup: true }, { systemKind: { not: null } }],
} satisfies Prisma.MemberGroupWhereInput;

/** Prisma : l'affectation d'un membre comme instructeur (discipline, cours, stage). */
export const ASSIGNED_INSTRUCTOR_WHERE = {
  OR: [
    { disciplinesAsInstructor: { some: {} } },
    { coursesAsInstructor: { some: {} } },
    { seminarsAsPrimaryAnimator: { some: {} } },
    { seminarsAsAnimator: { some: {} } },
  ],
} satisfies Prisma.UserWhereInput;

/**
 * Garantit les groupes système Instructeurs et Bureau, sous Administrateurs. Idempotent, appelé au
 * démarrage, après ensureAdminGroup.
 *
 * - Un groupe ordinaire qui porte déjà le nom (« Bureau ») est ADOPTÉ, avec ses membres.
 * - Les instructeurs déjà affectés à une discipline, un cours ou un stage entrent dans Instructeurs :
 *   le groupe devient la source de vérité des affectations sans en perdre aucun.
 * - Les membres de ces groupes dont la majorité n'est pas renseignée deviennent majeurs. Un membre
 *   noté mineur n'est pas touché : la contradiction est signalée dans le journal.
 */
export async function ensureSystemGroups(
  prisma: PrismaClient,
  appRoot: string,
): Promise<{ created: string[]; adopted: string[]; instructorsAdded: number; markedAdult: number }> {
  const admin = await prisma.memberGroup.findFirst({ where: { isAdminGroup: true }, select: { id: true } });
  const created: string[] = [];
  const adopted: string[] = [];
  const ids = {} as Record<SystemGroupKindValue, string>;

  for (const kind of SYSTEM_GROUP_KINDS) {
    const name = SYSTEM_GROUP_NAME[kind];
    let group = await prisma.memberGroup.findUnique({
      where: { systemKind: kind },
      select: { id: true, isCollaborative: true },
    });
    if (!group) {
      const homonym = await prisma.memberGroup.findFirst({
        where: { name: { equals: name, mode: "insensitive" }, systemKind: null, isAdminGroup: false },
        select: { id: true, parentGroupId: true },
      });
      if (homonym) {
        group = await prisma.memberGroup.update({
          where: { id: homonym.id },
          data: { systemKind: kind, parentGroupId: homonym.parentGroupId ?? admin?.id ?? null },
          select: { id: true, isCollaborative: true },
        });
        adopted.push(name);
      } else {
        group = await prisma.memberGroup.create({
          data: { name, systemKind: kind, isCollaborative: true, parentGroupId: admin?.id ?? null },
          select: { id: true, isCollaborative: true },
        });
        created.push(name);
      }
    }
    ids[kind] = group.id;
    if (group.isCollaborative) await ensureGroupSpaceFolder({ prisma, appRoot, groupId: group.id });
  }

  const assigned = await prisma.user.findMany({ where: ASSIGNED_INSTRUCTOR_WHERE, select: { id: true } });
  const { count: instructorsAdded } = await prisma.memberGroupMembership.createMany({
    data: assigned.map((u) => ({ groupId: ids.INSTRUCTORS, userId: u.id })),
    skipDuplicates: true,
  });

  const { count: markedAdult } = await prisma.user.updateMany({
    where: { legalAge: "UNKNOWN", memberGroupMemberships: { some: { group: ADULT_GROUP_WHERE } } },
    data: { legalAge: "ADULT" },
  });
  const contradictions = await prisma.user.count({
    where: { legalAge: "MINOR", memberGroupMemberships: { some: { group: ADULT_GROUP_WHERE } } },
  });
  if (contradictions > 0) {
    console.warn(
      `[ensureSystemGroups] ${contradictions} membre(s) noté(s) mineur(s) dans Administrateurs, Instructeurs ou Bureau : à vérifier.`,
    );
  }

  return { created, adopted, instructorsAdded, markedAdult };
}

/**
 * Entrée dans un groupe : s'il impose la majorité, refuse un mineur, et fixe la majorité d'un membre
 * dont elle n'était pas renseignée (le parent référent n'a plus lieu d'être).
 */
export async function applyAdultGroupRule(
  prisma: Pick<PrismaClient, "memberGroup" | "user">,
  groupIds: string[],
  userId: string,
): Promise<void> {
  if (groupIds.length === 0) return;
  const groups = await prisma.memberGroup.findMany({
    where: { id: { in: groupIds } },
    select: { name: true, isAdminGroup: true, systemKind: true },
  });
  const adultGroup = groups.find(isAdultGroup);
  if (!adultGroup) return;
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { legalAge: true, birthDate: true, birthDateVerified: true },
  });
  if (!u) throw new TRPCError({ code: "NOT_FOUND", message: "Compte introuvable." });
  if (effectiveLegalAge(u) === "MINOR") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Un mineur ne peut pas faire partie du groupe ${adultGroup.name}.`,
    });
  }
  if (u.legalAge !== "ADULT") {
    await prisma.user.update({
      where: { id: userId },
      data: { legalAge: "ADULT", guardianName: null, guardianEmail: null, guardianRelation: null, guardianPhone: null },
    });
  }
}

/** Sortie du groupe Instructeurs : refusée tant que le membre est affecté à une discipline, un cours ou un stage. */
export async function assertCanLeaveInstructors(prisma: Pick<PrismaClient, "user">, userId: string): Promise<void> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      _count: {
        select: {
          disciplinesAsInstructor: true,
          coursesAsInstructor: true,
          seminarsAsPrimaryAnimator: true,
          seminarsAsAnimator: true,
        },
      },
    },
  });
  if (!u) return;
  const c = u._count;
  const parts = [
    c.disciplinesAsInstructor && `${c.disciplinesAsInstructor} discipline(s)`,
    c.coursesAsInstructor && `${c.coursesAsInstructor} cours`,
    c.seminarsAsPrimaryAnimator + c.seminarsAsAnimator && `${c.seminarsAsPrimaryAnimator + c.seminarsAsAnimator} stage(s)`,
  ].filter(Boolean);
  if (parts.length > 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Ce membre est encore instructeur de ${parts.join(", ")} : retirez-le d'abord de ces affectations.`,
    });
  }
}
