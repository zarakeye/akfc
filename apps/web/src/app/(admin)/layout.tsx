import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { prisma } from "@backend/prisma";
import { getSessionFromRequest } from "@backend/modules/auth/getSessionFromRequest";
import { handledCategoryIds } from "@backend/modules/tickets/ticketQueries.service";

/**
 * Garde SERVEUR de tout le tableau de bord (`/dashboard/**`).
 *
 * Le layout du tableau de bord est un composant client : il ne peut pas lire la session en
 * base. Ce layout serveur, placé au-dessus de lui, s'exécute avant tout rendu et ne laisse
 * passer que :
 *   - les administrateurs ;
 *   - les membres qui traitent des demandes (tickets) d'au moins une catégorie.
 * Les autres sont renvoyés à l'accueil, sans voir le squelette du tableau de bord.
 *
 * Ce n'est pas la seule protection : le proxy filtre déjà les visiteurs sans jeton, et chaque
 * procédure tRPC d'administration exige `isAdmin`. Ce layout ajoute la garde de l'INTERFACE.
 */
export default async function AdminZoneLayout({ children }: { children: ReactNode }) {
  const session = await getSessionFromRequest().catch(() => null);
  const user = session?.user;
  if (!user) redirect("/");

  if (!user.isAdmin) {
    const categories = await handledCategoryIds(prisma, user.id).catch(() => []);
    const handlesTickets = categories === null || categories.length > 0;
    if (!handlesTickets) redirect("/");
  }

  return children;
}
