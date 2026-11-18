'use server';

import { TRPCError } from "@trpc/server";

import { prisma } from "@akfc/backend/prisma.ts";
import { getSessionFromRequest } from "@akfc/backend/modules/auth/getSessionFromRequest.ts";
import {
  createMemberAccount,
  createMemberAccountInput,
} from "@akfc/backend/modules/users/createMemberAccount.service.ts";
import { toCreationLegalInput, type CreationLegalValue } from "@akfc/contracts/legal/creationLegal.ts";
import { ADMIN_ONLY_MESSAGE } from "#features/admin/common/actions/callerIsAdmin.ts";
import {
  EMAIL_REQUIRED_MESSAGE,
  type CreateUserFormState,
} from "#features/admin/users/forms/create-user/createUserForm.types.ts";

/** Une valeur texte du FormData ; absente, une chaîne vide. */
const text = (formData: FormData, name: string): string => String(formData.get(name) ?? "");

/** Des identifiants de créneaux, un champ caché par créneau coché. */
const ids = (formData: FormData, name: string): number[] => formData.getAll(name).map(Number);

/**
 * Création d'un compte : la server action du formulaire « Créer un utilisateur ».
 *
 * Elle vérifie que l'appelant est administrateur, reconstruit à partir du FormData ce qu'attend
 * le service (la majorité passe par toCreationLegalInput, la même règle que le formulaire), le
 * valide avec le schéma du service, puis appelle le même service que la procédure user.create.
 */
export async function createUserFormAction(
  _prevState: CreateUserFormState,
  formData: FormData,
): Promise<CreateUserFormState> {
  // Point d'accès public : les droits se vérifient ici, avant toute lecture du formulaire. La
  // session sert aussi à nommer, dans l'avis au club, l'administrateur qui a créé le compte.
  const session = await getSessionFromRequest().catch(() => null);
  if (!session?.user?.isAdmin) return { status: "error", error: ADMIN_ONLY_MESSAGE };

  // Les champs de la majorité ne sont envoyés que s'ils sont affichés : absents (statut majeur
  // d'office, ou date donnée sans choix), ils valent une chaîne vide.
  const choice = text(formData, "legalChoice");
  const legal: CreationLegalValue = {
    birthDate: text(formData, "birthDate"),
    choice: choice === "ADULT" || choice === "MINOR" ? choice : null,
    guardianFirstName: text(formData, "guardianFirstName"),
    guardianLastName: text(formData, "guardianLastName"),
    guardianRelation: text(formData, "guardianRelation"),
    guardianEmail: text(formData, "guardianEmail"),
    guardianPhone: text(formData, "guardianPhone"),
  };

  if (!text(formData, "email").trim()) {
    return { status: "error", error: EMAIL_REQUIRED_MESSAGE, fieldErrors: { email: EMAIL_REQUIRED_MESSAGE } };
  }

  const parsed = createMemberAccountInput.safeParse({
    email: text(formData, "email"),
    groupIds: formData.getAll("groupIds").map(String),
    courseIds: ids(formData, "courseIds"),
    taughtCourseIds: ids(formData, "taughtCourseIds"),
    legal: toCreationLegalInput(legal),
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    if (issue?.path[0] === "email") {
      return { status: "error", error: issue.message, fieldErrors: { email: issue.message } };
    }
    if (issue?.path[0] === "legal") {
      return { status: "error", error: issue.message, fieldErrors: { legal: issue.message } };
    }
    return { status: "error", error: "Formulaire incomplet : rechargez la page." };
  }

  try {
    const user = await createMemberAccount(prisma, parsed.data, { createdById: session.user.id });
    return { status: "success", data: { id: user.id } };
  } catch (err) {
    if (err instanceof TRPCError) {
      // Adresse déjà prise : sous le champ de l'adresse.
      if (err.code === "CONFLICT") {
        return { status: "error", error: err.message, fieldErrors: { email: err.message } };
      }
      // Les autres refus du service (majorité, statut, groupe ou créneau inconnu) sont des
      // phrases destinées à l'administrateur : on les affiche telles quelles.
      if (err.code === "BAD_REQUEST") return { status: "error", error: err.message };
    }
    console.error("[utilisateurs] création impossible :", err instanceof Error ? err.message : err);
    return { status: "error", error: "Création impossible. Réessayez dans un instant." };
  }
}
