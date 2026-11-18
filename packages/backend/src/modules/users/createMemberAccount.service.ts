import { Prisma, type PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import generateStrongPassword from "#lib/security/generatePassword.ts";
import { hashPassword } from "#lib/auth/password.ts";
import { sendWelcomeEmail, sendWelcomeNotice } from "#email/templates/welcomeEmailWithPassword.ts";
import { isDemoEmail } from "#lib/demoAccounts.ts";
import { legalInfoInput, legalInfoData } from "#modules/users/legalInfo.ts";
import { existingCourseIds } from "#modules/users/existingCourseIds.ts";
import { emailSchema } from "@akfc/contracts/auth/auth.schema.ts";
import { isAdultGroup } from "@akfc/contracts/groups/systemGroups.ts";

/**
 * Ce qu'il faut pour ouvrir un compte. Deux entrées l'appliquent : la procédure user.create et la
 * server action du formulaire du panneau de contrôle, qui la reconstruit à partir du FormData.
 */
export const createMemberAccountInput = z.object({
  // Même règle que la connexion : nettoyée, en minuscules (sinon le membre ne retrouverait
  // pas son compte en tapant son adresse autrement).
  email: emailSchema,
  /** Groupes du membre ; aucun pour un simple membre. */
  groupIds: z.array(z.string().min(1)),
  /** Majorité et, pour un mineur, son parent référent (nom et adresse obligatoires ; date facultative). */
  legal: legalInfoInput,
  /** Créneaux suivis (facultatif) ; pour un instructeur, sans être élève. */
  courseIds: z.array(z.number().int().positive()).max(50).default([]),
  /** Instructeur : les créneaux qu'il donne (il en devient l'instructeur attitré). */
  taughtCourseIds: z.array(z.number().int().positive()).max(50).default([]),
});
export type CreateMemberAccountInput = z.infer<typeof createMemberAccountInput>;

/**
 * Ouvre un compte (administrateurs). Deux entrées l'appellent : la procédure tRPC user.create
 * (tests, future application mobile) et la server action du formulaire « Créer un utilisateur ».
 * Toutes deux ont vérifié, avant, que l'appelant est administrateur ; `createdById` est son
 * identifiant, lu dans sa session, pour l'avis envoyé au club.
 */
export async function createMemberAccount(
  db: PrismaClient,
  input: CreateMemberAccountInput,
  { createdById }: { createdById: string },
) {
  const groupIds = [...new Set(input.groupIds)];
  const taughtCourseIds = await existingCourseIds(db, input.taughtCourseIds);
  // Un créneau qu'il donne, il ne le « suit » pas.
  const courseIds = (await existingCourseIds(db, input.courseIds)).filter((id) => !taughtCourseIds.includes(id));
  const chosenGroups = await db.memberGroup.findMany({
    where: { id: { in: groupIds } },
    select: { name: true, isAdminGroup: true, systemKind: true },
  });
  if (chosenGroups.length !== groupIds.length) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Groupe inconnu : rechargez la page." });
  }
  // Administrateurs, Instructeurs, Bureau : leurs membres sont majeurs d'office.
  const adultGroup = chosenGroups.find(isAdultGroup);
  if (taughtCourseIds.length > 0 && !chosenGroups.some((g) => g.systemKind === "INSTRUCTORS")) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Seul un instructeur donne des cours : cochez le statut Instructeur." });
  }
  // Mot de passe généré côté serveur (jamais saisi par l'admin), robuste par
  // construction, puis envoyé au SEUL membre (voir welcomeEmailWithPassword.ts).
  // isFirstLogin=true (défaut Prisma) : le site lui propose de compléter son profil.
  const password = generateStrongPassword();
  const hash = await hashPassword(password);

  if (input.legal.legalAge === "UNKNOWN" && !adultGroup) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Indiquez si le membre est majeur ou mineur." });
  }
  const legal = legalInfoData(
    adultGroup && !input.legal.birthDate ? { ...input.legal, legalAge: "ADULT" } : input.legal,
    input.email,
    { requireComplete: !adultGroup },
  );
  // La date de naissance a le dernier mot : un mineur n'entre pas dans un groupe de majeurs.
  if (adultGroup && legal.legalAge === "MINOR") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Un mineur ne peut pas faire partie du groupe ${adultGroup.name}.`,
    });
  }

  // L'adresse est unique en base (@unique). Plutôt que de vérifier avant d'écrire (deux
  // créations simultanées passeraient toutes les deux la vérification), on écrit, et on
  // traduit le refus de la base.
  let user;
  try {
    user = await db.user.create({
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
        courseEnrollments: { create: courseIds.map((id) => ({ course: { connect: { id } } })) },
      },
      omit: { password: true },
    });
    if (taughtCourseIds.length > 0) {
      await db.course.updateMany({ where: { id: { in: taughtCourseIds } }, data: { instructorId: user.id } });
    }
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
      db.memberGroup.findMany({ where: { id: { in: groupIds } }, select: { name: true } }),
      db.user.findUnique({
        where: { id: createdById },
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

  return user;
}
