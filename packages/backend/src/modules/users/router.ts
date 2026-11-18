import { Prisma } from "@prisma/client";

import { router, protectedProcedure } from "#trpc/core.ts";
import { isAdmin } from "#trpc/middleware.ts";
import { z } from "zod";
import { isDemoEmail } from "#lib/demoAccounts.ts";
import { TRPCError } from "@trpc/server";

import type { UserProfile } from "@akfc/contracts/users/user-profile.types.ts";
import { effectiveLegalAge, type ImageConsentProofValue } from "@akfc/contracts/legal/imageConsent.ts";
import { legalInfoInput, legalInfoData } from "#modules/users/legalInfo.ts";
import { existingCourseIds } from "#modules/users/existingCourseIds.ts";
import { createMemberAccount, createMemberAccountInput } from "#modules/users/createMemberAccount.service.ts";
import { syncPageMediaReferences } from "#modules/media/services/syncPageMediaReferences.service.ts";
import { pageContentSchemaV1 } from "@akfc/contracts/page/index.ts";
import { makeAdult } from "#modules/users/comingOfAge.service.ts";
import { assertBioMediaAllowed, isInstructorUser } from "#modules/users/instructorBio.service.ts";
import { ADULT_GROUP_WHERE, ASSIGNED_INSTRUCTOR_WHERE } from "#modules/memberGroups/systemGroups.service.ts";
import { removeAvatarFile } from "#modules/avatar/avatar.service.ts";
import { resolvePersoBaseFolder } from "#modules/media/services/resolvePersoBaseFolder.service.ts";
import { assertOwnAvatars } from "#modules/media/services/assertOwnAvatars.service.ts";
import { assertPublicContentRights } from "#modules/mediaPeople/publicContentRights.service.ts";
import { byEffectiveDesc } from "#modules/imageConsent/formOrder.ts";
import { clubRolesBlockingDeletion } from "./clubRolesBlockingDeletion.service";

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

/** Les créneaux que donne un membre : attitré, ou instructeur de la discipline sans attitré. */
function taughtByWhere(userId: string) {
  return {
    OR: [{ instructorId: userId }, { instructorId: null, discipline: { instructorId: userId } }],
  } satisfies Prisma.CourseWhereInput;
}

export const userRouter = router({
  getAll: protectedProcedure
    .use(isAdmin)
    .query(async ({ ctx }) => {
      // Jamais l'empreinte du mot de passe. La date de naissance sert ici à calculer la majorité,
      // puis reste sur le serveur : une fois le compte créé, seul le membre la voit.
      const users = await ctx.prisma.user.findMany({
        orderBy: { id: "asc" },
        omit: { password: true },
        include: {
          memberGroupMemberships: {
            select: { group: { select: { id: true, name: true, isAdminGroup: true } } },
          },
          // Droit à l'image : voie de la version la plus récente (par date des droits), et demande en
          // attente du parent.
          imageConsentForms: { select: { source: true, signedAt: true, createdAt: true } },
          imageConsentRequest: { select: { expiresAt: true } },
        },
      });
      const now = new Date();
      return users.map(({ memberGroupMemberships, imageConsentForms, imageConsentRequest, birthDate, ...u }) => ({
        ...u,
        // Majorité effective : un mineur dont la date vérifiée atteint 18 ans apparaît majeur.
        effectiveLegalAge: effectiveLegalAge({ ...u, birthDate }, now),
        isDemo: isDemoEmail(u.email),
        consentProof: (imageConsentForms.sort(byEffectiveDesc)[0]?.source ??
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
        omit: { password: true, birthDate: true },
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
    .input(createMemberAccountInput)
    .mutation(async ({ ctx, input }) => {
      // La logique est dans le service, partagé avec la server action du formulaire.
      const user = await createMemberAccount(ctx.prisma, input, { createdById: ctx.sessionClient.user.id });
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
      const u = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
        select: { email: true, birthDate: true },
      });
      if (!u) throw new TRPCError({ code: "NOT_FOUND", message: "Compte introuvable." });
      // Date absente de la saisie : on garde l'enregistrée, qui décide toujours de la majorité.
      const legal =
        input.legal.birthDate === undefined
          ? { ...input.legal, birthDate: u.birthDate ? u.birthDate.toISOString().slice(0, 10) : null }
          : input.legal;
      const data = legalInfoData(legal, u.email, { requireComplete: false });
      if (data.legalAge !== "ADULT") {
        const inAdultGroup = await ctx.prisma.memberGroupMembership.findFirst({
          where: { userId: input.userId, group: ADULT_GROUP_WHERE },
          include: { group: { select: { name: true } } },
        });
        if (inAdultGroup) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Membre du groupe ${inAdultGroup.group.name} : il est majeur d'office.`,
          });
        }
      }
      await ctx.prisma.user.update({
        where: { id: input.userId },
        data,
        select: { id: true },
      });
      return { ok: true };
    }),

  /** Créneaux suivis par un membre comme élève (admins) : leurs identifiants. */
  coursesOf: protectedProcedure
    .use(isAdmin)
    .input(z.object({ userId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.prisma.courseEnrollment.findMany({
        where: { userId: input.userId },
        select: { courseId: true },
      });
      return rows.map((r) => r.courseId);
    }),

  /**
   * Remplace les créneaux suivis par un membre (admins). Les inscriptions gardées conservent leur
   * date ; les autres sont retirées, les nouvelles ajoutées. Un instructeur ne « suit » pas un
   * créneau qu'il donne : ceux-là sont ignorés.
   */
  setCourses: protectedProcedure
    .use(isAdmin)
    .input(z.object({ userId: z.string().min(1), courseIds: z.array(z.number().int().positive()).max(50) }))
    .mutation(async ({ ctx, input }) => {
      const u = await ctx.prisma.user.findUnique({ where: { id: input.userId }, select: { id: true } });
      if (!u) throw new TRPCError({ code: "NOT_FOUND", message: "Compte introuvable." });
      const taught = await ctx.prisma.course.findMany({ where: taughtByWhere(input.userId), select: { id: true } });
      const courseIds = (await existingCourseIds(ctx.prisma, input.courseIds)).filter(
        (id) => !taught.some((t) => t.id === id),
      );
      await ctx.prisma.$transaction([
        ctx.prisma.courseEnrollment.deleteMany({ where: { userId: input.userId, courseId: { notIn: courseIds } } }),
        ctx.prisma.courseEnrollment.createMany({
          data: courseIds.map((courseId) => ({ userId: input.userId, courseId })),
          skipDuplicates: true,
        }),
      ]);
      return { ok: true };
    }),

  /**
   * Les créneaux qu'un instructeur donne (admins) : il devient l'instructeur ATTITRÉ des créneaux
   * cochés (à la place de celui qui l'était) ; décoché, un créneau dont il était l'attitré revient
   * à l'instructeur de sa discipline. Seul un membre du groupe Instructeurs donne des cours. S'il
   * suivait l'un de ces créneaux, il ne le suit plus : il le donne.
   */
  setTaughtCourses: protectedProcedure
    .use(isAdmin)
    .input(z.object({ userId: z.string().min(1), courseIds: z.array(z.number().int().positive()).max(50) }))
    .mutation(async ({ ctx, input }) => {
      const u = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
        select: { memberGroupMemberships: { where: { group: { systemKind: "INSTRUCTORS" } }, select: { groupId: true } } },
      });
      if (!u) throw new TRPCError({ code: "NOT_FOUND", message: "Compte introuvable." });
      if (u.memberGroupMemberships.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Seul un membre du groupe Instructeurs donne des cours." });
      }
      const courseIds = await existingCourseIds(ctx.prisma, input.courseIds);
      await ctx.prisma.$transaction([
        ctx.prisma.course.updateMany({
          where: { instructorId: input.userId, id: { notIn: courseIds } },
          data: { instructorId: null },
        }),
        ctx.prisma.course.updateMany({ where: { id: { in: courseIds } }, data: { instructorId: input.userId } }),
        ctx.prisma.courseEnrollment.deleteMany({ where: { userId: input.userId, courseId: { in: courseIds } } }),
      ]);
      return { ok: true };
    }),

  /**
   * Tri des comptes existants (admins) : passe en MAJEURS les comptes choisis dont la majorité n'est
   * pas renseignée. Les autres (déjà majeurs ou mineurs) ne sont pas touchés, même s'ils figurent
   * dans la liste : un mineur ne redevient jamais majeur par erreur d'une sélection. Un mineur, lui,
   * se renseigne fiche par fiche (parent référent, date de naissance) avec setLegalInfo.
   */
  markAdults: protectedProcedure
    .use(isAdmin)
    .input(z.object({ userIds: z.array(z.string().min(1)).min(1).max(500) }))
    .mutation(async ({ ctx, input }) => {
      const { count } = await ctx.prisma.user.updateMany({
        where: { id: { in: input.userIds }, legalAge: "UNKNOWN" },
        data: { legalAge: "ADULT", guardianName: null, guardianEmail: null, guardianRelation: null, guardianPhone: null },
      });
      return { count };
    }),

  /**
   * « Passer majeur (justificatif vu) » (admins) : le membre a montré, au club ou à la MJC, qu'il a
   * 18 ans. Il passe majeur SANS date de naissance (une date connue est effacée : c'est elle qui le
   * disait mineur) ; son parent n'a plus de rôle (coordonnées effacées, demandes supprimées), il
   * reçoit l'e-mail des majeurs. Un compte déjà majeur ne change pas.
   */
  markAdultWithProof: protectedProcedure
    .use(isAdmin)
    .input(z.object({ userId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const u = await ctx.prisma.user.findUnique({ where: { id: input.userId }, select: { legalAge: true } });
      if (!u) throw new TRPCError({ code: "NOT_FOUND", message: "Compte introuvable." });
      if (u.legalAge === "ADULT") return { changed: false };
      await makeAdult(ctx.prisma, input.userId, { clearBirthDate: true });
      return { changed: true };
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
      // Ses rôles dans le club (instructeur, animateur, organisateur) se réattribuent d'abord ;
      // le reste de sa vie sur le site part avec lui ou reste sans auteur (voir le schéma).
      const blocking = await clubRolesBlockingDeletion(ctx.prisma, input.id);
      if (blocking) throw new TRPCError({ code: "PRECONDITION_FAILED", message: blocking });
      const avatar = (await ctx.prisma.user.findUnique({ where: { id: input.id }, select: { avatar: true } }))?.avatar;
      const deleted = await ctx.prisma.$transaction(async (tx) => {
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
      // Son portrait part avec le compte : un avatar n'est rattaché qu'à lui (aucune ligne
      // MediaAsset ne le retient), il resterait sinon dans le stockage sans que rien ne l'atteigne.
      // Après la transaction : un fichier ne se restaure pas si la base annule.
      if (avatar) await removeAvatarFile(avatar);
      return deleted;
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
   * titulaire est le MEME OR que `getInstructors` et la page publique des instructeurs.
   */
  getMyInstructorState: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.sessionClient.user.id;
    const [user, isInstructor] = await Promise.all([
      ctx.prisma.user.findUnique({
        where: { id: userId },
        select: { instructorBio: true, instructorOrder: true },
      }),
      isInstructorUser(ctx.prisma, userId),
    ]);

    return {
      isInstructor,
      bio: user?.instructorBio ?? null,
      order: user?.instructorOrder ?? null,
      // Où le sélecteur de médias s'ouvre : toute la bibliothèque pour un administrateur, son
      // espace personnel pour un autre membre (le seul dont il puisse poser les fichiers).
      mediaRoot: ctx.sessionClient.user.isAdmin
        ? ctx.appRoot
        : await resolvePersoBaseFolder({ prisma: ctx.prisma, appRoot: ctx.appRoot, userId }),
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
      assertOwnAvatars(ctx.sessionClient.user.id, input.bio);
      await assertPublicContentRights(ctx.prisma, input.bio);
      const userId = ctx.sessionClient.user.id;
      // Seul un titulaire a une présentation publique. Un autre membre pourrait sinon référencer des
      // fichiers, et les rendre servis au public, sans qu'aucune page ne les montre.
      if (!(await isInstructorUser(ctx.prisma, userId))) {
        throw new TRPCError({ code: "FORBIDDEN", message: "La présentation est réservée aux instructeurs." });
      }
      if (!ctx.sessionClient.user.isAdmin) {
        // L'ordre de la page publique est une décision du club : un instructeur ne s'y place pas
        // lui-même en tête.
        if (input.order !== undefined) {
          throw new TRPCError({ code: "FORBIDDEN", message: "L'ordre d'affichage est fixé par un administrateur." });
        }
        if (input.bio !== null) await assertBioMediaAllowed(ctx.prisma, userId, input.bio);
      }
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
   * Vivier d'AFFECTATION du select instructeur (≠ « titulaires » réels) : les membres du groupe
   * système Instructeurs. Un nouvel instructeur se désigne en l'ajoutant à ce groupe.
   * `getInstructors` et la page publique des instructeurs restent la vérité publique.
   */
  getAssignableInstructors: protectedProcedure.use(isAdmin).query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({
      where: {
        OR: [
          // Le groupe Instructeurs est la source de vérité des affectations. Les instructeurs déjà
          // affectés y sont versés au démarrage (ensureSystemGroups) ; on les garde ici aussi pour
          // qu'aucun formulaire n'affiche « — Choisir — » entre la mise à jour et le redémarrage.
          { memberGroupMemberships: { some: { group: { systemKind: "INSTRUCTORS" } } } },
          ...ASSIGNED_INSTRUCTOR_WHERE.OR,
          // Organisateur d'un évènement : sans cette ligne, un organisateur qui n'est ni admin ni
          // instructeur disparaît du sélecteur, et le formulaire d'édition affiche « — Choisir — ».
          { eventsAsOrganizer: { some: {} } },
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
   * Les avatars qu'un bloc media-text ou float-text peut montrer (« utiliser l'avatar de X »).
   *
   * Un membre ne pose que SON avatar, administrateurs compris (`assertOwnAvatars`, vérifié par
   * chaque enregistrement de contenu) : la liste ne contient donc que lui. Elle reste une liste
   * pour que le sélecteur n'ait rien à changer. Inclut un membre SANS avatar (avatar `null`) :
   * l'UI affiche un placeholder. `avatar` est la clé de stockage brute ; l'URL d'affichage est construite côté
   * client comme pour l'avatar du header.
   */
  listAvatarCandidates: protectedProcedure.query(async ({ ctx }) => {
    const self = ctx.sessionClient.user.id;
    return ctx.prisma.user.findMany({
      where: { id: self },
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
