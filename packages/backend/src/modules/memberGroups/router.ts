import { z } from "zod";

import { router, protectedProcedure } from "@backend/trpc/core";
import { isAdmin } from "@backend/trpc/middleware";
import { ensureGroupSpaceFolder } from "@backend/modules/memberGroups/ensureGroupSpaceFolder.service";

const adminProcedure = protectedProcedure.use(isAdmin);

/** Nom affichable d'un membre (prénom/nom, sinon email). */
function memberName(u: {
  firstName: string | null;
  lastName: string | null;
  email: string;
}): string {
  return [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || u.email;
}

/**
 * Groupes de membres (ex. « Bureau »), gérés dans le panneau de contrôle.
 * Servent de listes de diffusion : l'appartenance est dynamique (utilisée à la
 * volée pour la visibilité des documents, cf. router memberDocument).
 */
export const memberGroupRouter = router({
  /** Groupes + nombre de membres. */
  list: adminProcedure.query(async ({ ctx }) => {
    const groups = await ctx.prisma.memberGroup.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        isCollaborative: true,
        _count: { select: { memberships: true } },
      },
    });
    return groups.map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description,
      isCollaborative: g.isCollaborative,
      memberCount: g._count.memberships,
    }));
  }),

  /** Crée un groupe. */
  create: adminProcedure
    .input(
      z.object({
        name: z.string().trim().min(1).max(120),
        description: z.string().trim().max(500).optional(),
        isCollaborative: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const group = await ctx.prisma.memberGroup.create({
        data: {
          name: input.name,
          description: input.description,
          isCollaborative: input.isCollaborative ?? false,
        },
        select: { id: true },
      });
      if (input.isCollaborative) {
        await ensureGroupSpaceFolder({
          prisma: ctx.prisma,
          appRoot: ctx.appRoot,
          groupId: group.id,
        });
      }
      return { id: group.id };
    }),

  /** Renomme / met à jour un groupe. */
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().trim().min(1).max(120),
        description: z.string().trim().max(500).optional(),
        isCollaborative: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.memberGroup.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description ?? null,
          isCollaborative: input.isCollaborative,
        },
      });
      if (input.isCollaborative === true) {
        await ensureGroupSpaceFolder({
          prisma: ctx.prisma,
          appRoot: ctx.appRoot,
          groupId: input.id,
        });
      }
      return { success: true };
    }),

  /** Supprime un groupe (cascade appartenances + liens documents). */
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.memberGroup.delete({ where: { id: input.id } });
      return { success: true };
    }),

  /** Membres d'un groupe. */
  members: adminProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ ctx, input }) => {
      const memberships = await ctx.prisma.memberGroupMembership.findMany({
        where: { groupId: input.groupId },
        select: {
          access: true,
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      });
      return memberships
        .map((m) => ({ id: m.user.id, name: memberName(m.user), access: m.access }))
        .sort((a, b) => a.name.localeCompare(b.name, "fr"));
    }),

  /** Ajoute un membre à un groupe (idempotent). */
  addMember: adminProcedure
    .input(
      z.object({
        groupId: z.string(),
        userId: z.string(),
        access: z.enum(["VIEWER", "EDITOR"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.memberGroupMembership.upsert({
        where: {
          groupId_userId: { groupId: input.groupId, userId: input.userId },
        },
        create: {
          groupId: input.groupId,
          userId: input.userId,
          access: input.access ?? "EDITOR",
        },
        update: input.access ? { access: input.access } : {},
      });
      return { success: true };
    }),

  /** Retire un membre d'un groupe. */
  removeMember: adminProcedure
    .input(z.object({ groupId: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.memberGroupMembership.deleteMany({
        where: { groupId: input.groupId, userId: input.userId },
      });
      return { success: true };
    }),

  /** Change le droit d'un membre dans un groupe collaboratif (VIEWER/EDITOR). */
  setMemberAccess: adminProcedure
    .input(
      z.object({
        groupId: z.string(),
        userId: z.string(),
        access: z.enum(["VIEWER", "EDITOR"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.memberGroupMembership.update({
        where: {
          groupId_userId: { groupId: input.groupId, userId: input.userId },
        },
        data: { access: input.access },
      });
      return { success: true };
    }),
});
