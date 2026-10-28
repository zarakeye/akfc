import { Prisma } from "@prisma/client";

import { router, protectedProcedure, publicProcedure } from "@backend/trpc/core";
import { isAdmin } from "@backend/trpc/middleware";
import { z } from "zod";
import generateStrongPassword from "@backend/lib/security/generatePassword";
import { hashPassword } from "@backend/lib/auth/password";
import { sendWelcomeEmail, sendWelcomeNotice } from "@backend/email/templates/welcomeEmailWithPassword";
import { isDemoEmail } from "@backend/lib/demoAccounts";
import { TRPCError } from "@trpc/server";

import type { UserProfile } from "@contracts/users/user-profile.types";
import type { ImageConsentProofValue } from "@contracts/legal/imageConsent";
import { legalInfoInput, legalInfoData } from "@backend/modules/users/legalInfo";
import { pageContentSchemaV1 } from "@contracts/page";
import { emailSchema } from "@contracts/auth/auth.schema";
import { syncPageMediaReferences } from "@backend/modules/media/services/syncPageMediaReferences.service";

/** Les champs du profil, et eux seuls : ni l'empreinte du mot de passe, ni les données légales. */
const userProfileSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  pseudo: true,
  avatar: true,
  aboutMe: true,
  phone: true,
  birthDate: true,
  isFirstLogin: true,
} satisfies Prisma.UserSelect;

type UserProfileRow = Prisma.UserGetPayload<{ select: typeof userProfileSelect }>;

/**
 * Du membre lu en base au contrat partagé avec le front : la date devient « AAAA-MM-JJ ».
 * `satisfies` vérifie la conformité à UserProfile sans élargir le type : le front garde
 * `id: string` (sûr), là où le contrat, plus large, admettrait `null`.
 */
function toUserProfile(user: UserProfileRow) {
  return {
    ...user,
    birthDate: user.birthDate ? user.birthDate.toISOString().split("T")[0] : null,
  } satisfies UserProfile;
}

export const userRouter = router({
  getAll: protectedProcedure
    .use(isAdmin)
    .query(async ({ ctx }) => {
      // Jamais l'empreinte du mot de passe vers le navigateur.
      const users = await ctx.prisma.user.findMany({
        orderBy: { id: "asc" },
        omit: { password: true },
        include: {
          memberGroupMemberships: {
            select: { group: { select: { id: true, name: true, isAdminGroup: true } } },
          },
          // Droit à l'image : voie de la version la plus récente, et demande en attente du parent.
          imageConsentForms: { orderBy: { createdAt: "desc" }, take: 1, select: { source: true } },
          imageConsentRequest: { select: { expiresAt: true } },
        },
      });
      const now = new Date();
      return users.map(({ memberGroupMemberships, imageConsentForms, imageConsentRequest, ...u }) => ({
        ...u,
        isDemo: isDemoEmail(u.email),
        consentProof: (imageConsentForms[0]?.source ??
          (imageConsentRequest?.expiresAt && imageConsentRequest.expiresAt > now
            ? "PENDING_GUARDIAN"
            : "NONE")) satisfies ImageConsentProofValue,
        // Groupes du membre : Administrateurs d'abord, puis ordre alphabétique.
        groups: memberGroupMemberships
          .map((m) => m.group)
          .sort((a, b) => Number(b.isAdminGroup) - Number(a.isAdminGroup) || a.name.localeCompare(b.name, "fr")),
      }));
    }),

  getById: protectedProcedure
    .use(isAdmin)
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.id },
        omit: { password: true },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Membre introuvable.",
        });
      }

      return user;
    }),

  getByEmail: protectedProcedure
    .use(isAdmin)
    .input(z.object({ email: emailSchema }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
        omit: { password: true },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Membre introuvable.",
        });
      }

      return user;
    }),

  create: protectedProcedure
    .use(isAdmin)
    .input(
      z.object({
        // Même règle que la connexion : nettoyée, en minuscules (sinon le membre ne retrouverait
        // pas son compte en tapant son adresse autrement).
        email: emailSchema,
        /** Un ou plusieurs groupes (au moins un). */
        groupIds: z.array(z.string().min(1)).min(1, "Choisissez au moins un groupe."),
        /** Majorité et, pour un mineur, date de naissance et parent référent (tous obligatoires). */
        legal: legalInfoInput,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const groupIds = [...new Set(input.groupIds)];
      const found = await ctx.prisma.memberGroup.count({ where: { id: { in: groupIds } } });
      if (found !== groupIds.length) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Groupe inconnu : rechargez la page." });
      }
      // Mot de passe généré côté serveur (jamais saisi par l'admin), robuste par
      // construction, puis envoyé au SEUL membre (voir welcomeEmailWithPassword.ts).
      // isFirstLogin=true (défaut Prisma) : le site lui propose de compléter son profil.
      const password = generateStrongPassword();
      const hash = await hashPassword(password);

      if (input.legal.legalAge === "UNKNOWN") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Indiquez si le membre est majeur ou mineur." });
      }
      const legal = legalInfoData(input.legal, input.email, { requireComplete: true });

      // L'adresse est unique en base (@unique). Plutôt que de vérifier avant d'écrire (deux
      // créations simultanées passeraient toutes les deux la vérification), on écrit, et on
      // traduit le refus de la base.
      let user;
      try {
        user = await ctx.prisma.user.create({
          data: {
            email: input.email,
            password: hash,
            ...legal,
            memberGroupMemberships: {
              create: groupIds.map((id) => ({
                group: { connect: { id } },
                access: "EDITOR" as const,
              })),
            },
          },
          omit: { password: true },
        });
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
          throw new TRPCError({ code: "CONFLICT", message: "Un membre utilise déjà cette adresse e-mail." });
        }
        throw err;
      }

      // E-mail de bienvenue au membre, puis avis SANS mot de passe à la boîte du club.
      // Un échec d'envoi n'annule pas la création : il est journalisé et signalé au club.
      // Compte de démonstration : son adresse ne peut rien recevoir, pas d'e-mail.
      if (!isDemoEmail(input.email)) {
        let sendError: string | null = null;
        try {
          await sendWelcomeEmail({ to: input.email, password });
        } catch (err) {
          sendError = err instanceof Error ? err.message : String(err);
          console.error("[user.create] e-mail de bienvenue non envoyé :", sendError);
        }
        const [groups, admin] = await Promise.all([
          ctx.prisma.memberGroup.findMany({ where: { id: { in: groupIds } }, select: { name: true } }),
          ctx.prisma.user.findUnique({
            where: { id: ctx.sessionClient.user.id },
            select: { firstName: true, lastName: true, email: true },
          }),
        ]);
        const adminName = admin
          ? [admin.firstName, admin.lastName].filter(Boolean).join(" ").trim() || admin.email
          : null;
        await sendWelcomeNotice({
          kind: sendError ? "send-failed" : "sent",
          memberEmail: input.email,
          groupNames: groups.map((g) => g.name),
          createdBy: adminName,
          detail: sendError,
        }).catch((err) =>
          console.error("[user.create] avis au club non envoyé :", err instanceof Error ? err.message : err),
        );
      }

      return {
        success: true,
        user,
      };
    }),

  /**
   * Majorité, date de naissance et parent référent (admins). Un mineur peut être enregistré avant
   * que tout soit connu (tri des comptes existants) : l'envoi au parent reste bloqué tant qu'il
   * manque quelque chose. Majeur : les coordonnées du parent sont effacées.
   */
  setLegalInfo: protectedProcedure
    .use(isAdmin)
    .input(z.object({ userId: z.string().min(1), legal: legalInfoInput }))
    .mutation(async ({ ctx, input }) => {
      const u = await ctx.prisma.user.findUnique({ where: { id: input.userId }, select: { email: true } });
      if (!u) throw new TRPCError({ code: "NOT_FOUND", message: "Compte introuvable." });
      await ctx.prisma.user.update({
        where: { id: input.userId },
        data: legalInfoData(input.legal, u.email, { requireComplete: false }),
        select: { id: true },
      });
      return { ok: true };
    }),

  /** Droit à l'image (admins) : autorisation recueillie par le club pour ce membre. */
  setImageConsent: protectedProcedure
    .use(isAdmin)
    .input(z.object({ userId: z.string().min(1), consent: z.enum(["UNKNOWN", "GRANTED", "REFUSED"]) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.user.update({
        where: { id: input.userId },
        data: { imageConsent: input.consent, imageConsentAt: new Date() },
        select: { id: true },
      });
      return { ok: true };
    }),

  delete: protectedProcedure
    .use(isAdmin)
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Règle métier, pas question de droit : l'administrateur a le droit de supprimer un compte,
      // mais pas le sien (il perdrait l'accès, et le club pourrait se retrouver sans administrateur).
      // L'interface désactive déjà le bouton ; c'est ici que la règle est garantie.
      if (input.id === ctx.sessionClient.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Vous ne pouvez pas supprimer votre propre compte." });
      }
      return ctx.prisma.$transaction(async (tx) => {
        // Formulaires de droit à l'image signés : gardés 5 ans comme preuve (purge nocturne).
        await tx.imageConsentForm.updateMany({ where: { userId: input.id }, data: { detachedAt: new Date() } });
        // `pageId` n'a pas de clé étrangère : sans ce nettoyage, les liens de
        // la bio bloqueraient pour toujours la suppression de ses images.
        await syncPageMediaReferences(tx, {
          pageType: "INSTRUCTOR_BIO",
          pageId: input.id,
          newContent: null,
        });
        // Seul l'identifiant repart vers le navigateur : la ligne complète contient l'empreinte
        // du mot de passe.
        return tx.user.delete({
          where: { id: input.id },
          select: { id: true },
        });
      });
    }),

  getCurrentUserProfile: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.sessionClient.user.id;

    const user = await ctx.prisma.user.findUnique({
      where: { id: userId },
      select: userProfileSelect,
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Membre introuvable.",
      });
    }

    return toUserProfile(user);
  }),

  getProfileById: protectedProcedure
    .use(isAdmin)
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.id },
        select: userProfileSelect,
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Membre introuvable.",
        });
      }

      return toUserProfile(user);
    }),

  /**
   * L'utilisateur courant est-il titulaire, et quelle est sa bio ?
   *
   * Alimente l'éditeur du profil : la section n'apparaît que pour un
   * titulaire, et se pré-remplit avec ce qu'il a déjà écrit. Le critère de
   * titulaire est le MEME OR que `getInstructors` / `listPublicInstructors`.
   */
  getMyInstructorState: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.sessionClient.user.id;
    const user = await ctx.prisma.user.findUnique({
      where: { id: userId },
      select: {
        instructorBio: true,
        instructorOrder: true,
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

    const c = user?._count;
    const isInstructor = Boolean(
      c &&
        (c.disciplinesAsInstructor > 0 ||
          c.coursesAsInstructor > 0 ||
          c.seminarsAsPrimaryAnimator > 0 ||
          c.seminarsAsAnimator > 0),
    );

    return {
      isInstructor,
      bio: user?.instructorBio ?? null,
      order: user?.instructorOrder ?? null,
    };
  }),

  /**
   * Un instructeur enregistre SA PROPRE présentation.
   *
   * La cible est toujours `ctx.sessionClient.user.id`, jamais un id reçu en
   * entrée : la garde « c'est mon profil » est structurelle. Aucune
   * permission d'administration n'entre en jeu — on n'édite que soi.
   *
   * `bio` est un document du constructeur de pages (validé par son schéma), ou `null`
   * pour retirer sa présentation. L'ordre est optionnel.
   */
  saveMyInstructorBio: protectedProcedure
    .input(
      z.object({
        // Le même contrat que tout contenu du constructeur de pages : un document invalide est
        // refusé à l'entrée, au lieu d'être enregistré tel quel.
        bio: pageContentSchemaV1.nullable(),
        order: z.number().int().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.sessionClient.user.id;
      await ctx.prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: {
            instructorBio: input.bio === null ? Prisma.DbNull : (input.bio as Prisma.InputJsonValue),
            ...(input.order !== undefined
              ? { instructorOrder: input.order }
              : {}),
          },
        });
        // Déclare les fichiers de la bibliothèque utilisés par la bio : sans
        // ce lien, ils ne sont ni protégés, ni servis aux visiteurs.
        await syncPageMediaReferences(tx, {
          pageType: "INSTRUCTOR_BIO",
          pageId: userId,
          newContent: input.bio,
        });
      });
      return { success: true };
    }),

  /**
   * La page publique des instructeurs titulaires.
   *
   * PUBLIQUE : elle alimente une page ouverte à tous. Deux filtres —
   *   1. titulaire : le MEME critere que `getInstructors` (rattachement a
   *      une discipline, un cours ou un stage). Reutilise, pas redefini.
   *   2. presente : `instructorBio` non nul, sinon on afficherait une carte
   *      vide pour un titulaire qui ne s'est pas encore decrit.
   *
   * Tri par `instructorOrder` (les nuls en dernier), puis par nom.
   */
  listPublicInstructors: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.prisma.user.findMany({
      where: {
        AND: [
          { instructorBio: { not: Prisma.DbNull } },
          {
            OR: [
              { disciplinesAsInstructor: { some: {} } },
              { coursesAsInstructor: { some: {} } },
              { seminarsAsPrimaryAnimator: { some: {} } },
              { seminarsAsAnimator: { some: {} } },
            ],
          },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        pseudo: true,
        avatar: true,
        instructorBio: true,
        instructorOrder: true,
      },
      orderBy: [
        { instructorOrder: { sort: "asc", nulls: "last" } },
        { lastName: "asc" },
        { firstName: "asc" },
      ],
    });
    return rows;
  }),

  /**
   * Vivier d'AFFECTATION du select instructeur (≠ « titulaires » réels).
   * Résout l'œuf-et-la-poule : membres du groupe ADMIN (le staff) OU déjà
   * rattachés (pour ne perdre aucun instructeur existant, même non-admin).
   * `getInstructors` / `listPublicInstructors` restent la vérité publique.
   */
  getAssignableInstructors: protectedProcedure.use(isAdmin).query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({
      where: {
        OR: [
          { memberGroupMemberships: { some: { group: { isAdminGroup: true } } } },
          { disciplinesAsInstructor: { some: {} } },
          { coursesAsInstructor: { some: {} } },
          { seminarsAsPrimaryAnimator: { some: {} } },
          { seminarsAsAnimator: { some: {} } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        pseudo: true,
        email: true,
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });
  }),

  /**
   * Liste tous les users qui sont **factuellement** instructeurs — c'est-à-dire
   * qui ont au moins une relation d'animation dans le club : ils animent
   * une discipline, un cours, ou un stage (en tant qu'animateur principal
   * ou secondaire).
   *
   * Le club n'a pas de rôle "instructor" nominal en schéma ; cette
   * définition factuelle permet de peupler les sélecteurs des forms admin
   * (Course, Stage, etc.) sans dépendre d'un signal qui n'existe pas.
   *
   * Si un jour tu veux désigner un nouvel instructeur qui n'anime encore
   * rien, il faudra introduire un autre signal (rôle dédié ou flag
   * `isInstructor` sur User) — auquel cas cette query devra évoluer.
   *
   * Sélection minimale (id + nom) suffisante pour l'affichage en dropdown.
   * Tri par lastName puis firstName pour l'UX du select.
   */
  getInstructors: protectedProcedure.use(isAdmin).query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({
      where: {
        OR: [
          { disciplinesAsInstructor: { some: {} } },
          { coursesAsInstructor: { some: {} } },
          { seminarsAsPrimaryAnimator: { some: {} } },
          { seminarsAsAnimator: { some: {} } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        pseudo: true,
        email: true,
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });
  }),

  /**
   * Adresse du club d'un membre (alias @<domaine du club>), saisie par un administrateur.
   * Le domaine est celui de l'adresse de contact des Réglages du site (contact@akfc.fr par
   * défaut) : on n'attribue pas d'adresse d'un autre domaine. Chaîne vide → adresse retirée.
   */
  setClubEmail: protectedProcedure
    .use(isAdmin)
    .input(z.object({ id: z.string().min(1), clubEmail: z.string().trim().max(254) }))
    .mutation(async ({ ctx, input }) => {
      const value = input.clubEmail.toLowerCase();
      if (value !== "") {
        if (!z.string().email().safeParse(value).success) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Adresse e-mail invalide." });
        }
        const settings = await ctx.prisma.siteSettings.findUnique({ where: { id: "site" }, select: { contactEmail: true } });
        const domain = (settings?.contactEmail ?? "contact@akfc.fr").split("@")[1]?.toLowerCase() ?? "akfc.fr";
        if (!value.endsWith(`@${domain}`)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `L'adresse du club doit se terminer par @${domain}.` });
        }
      }
      await ctx.prisma.user.update({ where: { id: input.id }, data: { clubEmail: value || null } });
      return { clubEmail: value || null };
    }),

  /**
   * Liste les administrateurs (membres du groupe Administrateurs) avec leur avatar courant,
   * pour peupler le sélecteur d'avatar du bloc media-text (« utiliser
   * l'avatar de X »). Inclut les admins SANS avatar (avatar `null`) — l'UI
   * affichera un placeholder. `avatar` est la clé de stockage brute ;
   * l'URL d'affichage est construite côté client comme pour l'avatar du
   * header.
   */
  listAvatarCandidates: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({
      where: {
        memberGroupMemberships: {
          some: { group: { isAdminGroup: true } },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        pseudo: true,
        avatar: true,
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });
  }),
});
