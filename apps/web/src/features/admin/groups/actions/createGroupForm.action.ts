'use server';

import { prisma } from "@akfc/backend/prisma.ts";
import { APP_ROOT } from "@akfc/config/app.ts";
import { createMemberGroup } from "@akfc/backend/modules/memberGroups/createMemberGroup.service.ts";
import { createGroupSchema } from "@akfc/contracts/groups/createGroup.schema.ts";
import { ADMIN_ONLY_MESSAGE, callerIsAdmin } from "#features/admin/common/actions/callerIsAdmin.ts";
import type {
  CreateGroupField,
  CreateGroupFormState,
} from "#features/admin/groups/actions/createGroupForm.types.ts";

/**
 * Création d'un groupe : la server action du formulaire du panneau de contrôle.
 *
 * Elle vérifie que l'appelant est administrateur, valide le formulaire avec le schéma partagé,
 * puis appelle le même service que la procédure tRPC memberGroup.create.
 */
export async function createGroupFormAction(
  _prevState: CreateGroupFormState,
  formData: FormData,
): Promise<CreateGroupFormState> {
  // Point d'accès public : les droits se vérifient ici, avant toute lecture du formulaire.
  if (!(await callerIsAdmin())) return { status: "error", error: ADMIN_ONLY_MESSAGE };

  // FormData est une matière première : une case cochée vaut "on", une case décochée est absente ;
  // le choix « Administrateurs (par défaut) » est une chaîne vide, c'est-à-dire « pas de parent ».
  const parsed = createGroupSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    isCollaborative: formData.get("isCollaborative") === "on",
    parentGroupId: String(formData.get("parentGroupId") ?? "") || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: Partial<Record<CreateGroupField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if ((field === "name" || field === "parentGroupId") && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return { status: "error", error: "Vérifiez les champs signalés.", fieldErrors };
  }

  try {
    const group = await createMemberGroup(prisma, { ...parsed.data, appRoot: APP_ROOT });
    return { status: "success", data: group };
  } catch (err) {
    console.error("[groupes] création impossible :", err instanceof Error ? err.message : err);
    return { status: "error", error: "Création impossible. Réessayez dans un instant." };
  }
}
