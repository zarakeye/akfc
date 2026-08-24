import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { router, protectedProcedure } from "@backend/trpc/core";
import { isAdmin } from "@backend/trpc/middleware";
import { ensureGroupSpaceFolder } from "@backend/modules/memberGroups/ensureGroupSpaceFolder.service";
import { deleteGroupWithSpace } from "@backend/modules/memberGroups/deleteGroupWithSpace.service";

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
        parentGroupId: true,
        _count: { select: { memberships: true } },
      },
    });
    return groups.map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description,
      isCollaborative: g.isCollaborative,
      parentGroupId: g.parentGroupId,
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
        parentGroupId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Règle « Administrateurs ancêtre de tout » : sans parent explicite,
      // le nouveau groupe est rattaché au groupe Administrateurs.
      const parentGroupId =
        input.parentGroupId ??
        (
          await ctx.prisma.memberGroup.findFirst({
            where: { isAdminGroup: true },
            select: { id: true },
          })
        )?.id ??
        null;

      const group = await ctx.prisma.memberGroup.create({
        data: {
          name: input.name,
          description: input.description,
          isCollaborative: input.isCollaborative ?? false,
          parentGroupId,
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
      await deleteGroupWithSpace({
        prisma: ctx.prisma,
        appRoot: ctx.appRoot,
        groupId: input.id,
      });
      return { success: true };
    }),

  /**
   * Définit (ou retire, si parentGroupId=null) le groupe PARENT d'un
   * groupe — l'inclusion/hiérarchie (arbre). Garde anti-cycle : le nouveau
   * parent ne peut être ni le groupe lui-même ni l'un de ses descendants.
   */
  setParentGroup: adminProcedure
    .input(
      z.object({
        groupId: z.string(),
        parentGroupId: z.string().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { groupId, parentGroupId } = input;

      if (parentGroupId === groupId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Un groupe ne peut pas être son propre parent.",
        });
      }

      if (parentGroupId) {
        const exists = await ctx.prisma.memberGroup.findUnique({
          where: { id: parentGroupId },
          select: { id: true },
        });
        if (!exists) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Groupe parent introuvable." });
        }

        // Le parent ne doit pas être un DESCENDANT du groupe (→ cycle) :
        // on remonte la chaîne des ancêtres du parent ; si on croise le
        // groupe, c'est qu'il est déjà un ancêtre du parent.
        let cursor: string | null = parentGroupId;
        const seen = new Set<string>();
        while (cursor) {
          if (cursor === groupId) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Cycle interdit : le parent choisi est un descendant du groupe.",
            });
          }
          if (seen.has(cursor)) break;
          seen.add(cursor);
          const parent: { parentGroupId: string | null } | null =
            await ctx.prisma.memberGroup.findUnique({
              where: { id: cursor },
              select: { parentGroupId: true },
            });
          cursor = parent?.parentGroupId ?? null;
        }
      }

      await ctx.prisma.memberGroup.update({
        where: { id: groupId },
        data: { parentGroupId },
      });
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
