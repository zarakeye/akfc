import type { BreakingNews, PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import type { SaveBreakingNewsInput } from "@akfc/contracts/breakingNews/breakingNews.schema.ts";

/**
 * Crée un flash info (`id` absent) ou le met à jour (`id` présent). Trois entrées l'appellent :
 * les procédures tRPC breakingNews.create et breakingNews.update, et la server action du
 * formulaire du panneau de contrôle. Toutes ont vérifié, avant, que l'appelant est administrateur.
 */
export async function saveBreakingNews(db: PrismaClient, input: SaveBreakingNewsInput): Promise<BreakingNews> {
  const data = {
    title: input.title,
    body: input.body,
    href: input.href ?? null,
    publicationDate: input.publicationDate ?? null,
    expiresAt: input.expiresAt ?? null,
  };
  if (input.id === undefined) return db.breakingNews.create({ data });
  try {
    return await db.breakingNews.update({ where: { id: input.id }, data });
  } catch {
    throw new TRPCError({ code: "NOT_FOUND", message: "Brève introuvable." });
  }
}
