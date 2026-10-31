import type { Tour, TourAudience } from "./tour.types";
import { adminBreakingNewsCreate } from "./definitions/admin.breaking-news.create";
import { adminPagesPublication } from "./definitions/admin.pages.publication";
import { adminPostsCreate } from "./definitions/admin.posts.create";
import { adminTableauDeBord } from "./definitions/admin.tableau-de-bord";
import { adminTicketsTraiter } from "./definitions/admin.tickets.traiter";
import { adminUsersCreate } from "./definitions/admin.users.create";
import { membreContacterLeClub } from "./definitions/membre.contacter-le-club";
import { membreDocuments } from "./definitions/membre.documents";
import { membreProfil } from "./definitions/membre.profil";
import { publicDecouvrirLeSite } from "./definitions/public.decouvrir-le-site";
import { publicMotDePasseOublie } from "./definitions/public.mot-de-passe-oublie";

/**
 * Registre de TOUS les tutos. Ajouter un tuto = créer son fichier dans `definitions/` et
 * l'ajouter à cette liste.
 */
export const TOURS: Tour[] = [
  publicDecouvrirLeSite,
  publicMotDePasseOublie,
  membreProfil,
  membreDocuments,
  membreContacterLeClub,
  adminTableauDeBord,
  adminPostsCreate,
  adminBreakingNewsCreate,
  adminPagesPublication,
  adminUsersCreate,
  adminTicketsTraiter,
];

export function getTour(id: string): Tour | undefined {
  return TOURS.find((t) => t.id === id);
}

function matches(pattern: string | RegExp, pathname: string): boolean {
  return typeof pattern === "string" ? pattern === pathname : pattern.test(pathname);
}

/** Tutos proposés sur cette page, pour ce visiteur. */
export function toursFor(
  pathname: string,
  viewer: { loggedIn: boolean; isAdmin: boolean },
): Tour[] {
  const allowed = (a: TourAudience) =>
    a === "public" || (a === "member" && viewer.loggedIn) || (a === "admin" && viewer.isAdmin);
  return TOURS.filter((t) => allowed(t.audience) && t.routes.some((r) => matches(r, pathname)));
}

export function routeMatches(match: string | RegExp, pathname: string): boolean {
  return matches(match, pathname);
}
