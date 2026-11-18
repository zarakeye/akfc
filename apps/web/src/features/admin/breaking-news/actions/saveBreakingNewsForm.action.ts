'use server';

import { TRPCError } from "@trpc/server";

import { prisma } from "@akfc/backend/prisma.ts";
import { saveBreakingNews } from "@akfc/backend/modules/breakingNews/saveBreakingNews.service.ts";
import { saveBreakingNewsSchema } from "@akfc/contracts/breakingNews/breakingNews.schema.ts";
import { ADMIN_ONLY_MESSAGE, callerIsAdmin } from "#features/admin/common/actions/callerIsAdmin.ts";
import type {
  SaveBreakingNewsField,
  SaveBreakingNewsFormState,
} from "#features/admin/breaking-news/actions/saveBreakingNewsForm.types.ts";

const FIELDS: readonly SaveBreakingNewsField[] = ["title", "body", "href", "publicationDate", "expiresAt"];

/**
 * Flash info, création et édition : la server action du formulaire. `id` absent → création,
 * présent → mise à jour. Elle vérifie l'administrateur, valide avec le schéma partagé, puis
 * appelle le même service que les procédures breakingNews.create et update.
 *
 * Les dates arrivent en ISO : le formulaire les convertit dans le navigateur, à l'heure de
 * l'administrateur. Lue ici, une valeur `datetime-local` le serait à l'heure du serveur.
 */
export async function saveBreakingNewsFormAction(
  _prevState: SaveBreakingNewsFormState,
  formData: FormData,
): Promise<SaveBreakingNewsFormState> {
  // Point d'accès public : les droits se vérifient ici, avant toute lecture du formulaire.
  if (!(await callerIsAdmin())) return { status: "error", error: ADMIN_ONLY_MESSAGE };

  const parsed = saveBreakingNewsSchema.safeParse({
    id: formData.get("id") ?? undefined,
    title: String(formData.get("title") ?? ""),
    body: String(formData.get("body") ?? ""),
    href: String(formData.get("href") ?? ""),
    publicationDate: String(formData.get("publicationDate") ?? ""),
    expiresAt: String(formData.get("expiresAt") ?? ""),
  });

  if (!parsed.success) {
    const fieldErrors: Partial<Record<SaveBreakingNewsField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = FIELDS.find((f) => f === issue.path[0]);
      if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { status: "error", error: "Vérifiez les champs signalés.", fieldErrors };
  }

  try {
    const news = await saveBreakingNews(prisma, parsed.data);
    return { status: "success", data: { id: news.id } };
  } catch (err) {
    if (err instanceof TRPCError && err.code === "NOT_FOUND") return { status: "error", error: err.message };
    console.error("[flash info] enregistrement impossible :", err instanceof Error ? err.message : err);
    return { status: "error", error: "Enregistrement impossible. Réessayez dans un instant." };
  }
}
