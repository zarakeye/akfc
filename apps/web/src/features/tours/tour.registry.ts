import type { Tour, TourAudience } from "./tour.types";
import { adminBreakingNewsCreate } from "./definitions/admin.breaking-news.create";
import { adminCoursesCreate } from "./definitions/admin.courses.create";
import { adminDisciplinesCreate } from "./definitions/admin.disciplines.create";
import { adminEventsCreate } from "./definitions/admin.events.create";
import { adminGroupsCreate } from "./definitions/admin.groups.create";
import { adminPagesPublication } from "./definitions/admin.pages.publication";
import { adminPostsCreate } from "./definitions/admin.posts.create";
import { adminSeminarsCreate } from "./definitions/admin.seminars.create";
import { adminSeminarsSeances } from "./definitions/admin.seminars.seances";
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
  adminGroupsCreate,
  adminDisciplinesCreate,
  adminCoursesCreate,
  adminSeminarsCreate,
  adminSeminarsSeances,
  adminEventsCreate,
];

export function getTour(id: string): Tour | undefined {
  return TOURS.find((t) => t.id === id);
}

function matches(pattern: string | RegExp, pathname: string): boolean {
  return typeof pattern === "string" ? pattern === pathname : pattern.test(pathname);
}

export type TourViewer = { loggedIn: boolean; isAdmin: boolean };

/** Ce visiteur peut-il suivre un tuto de ce public ? (Proposer, pas autoriser : les pages gardent leurs droits.) */
export function canFollow(audience: TourAudience, viewer: TourViewer): boolean {
  return audience === "public" || (audience === "member" && viewer.loggedIn) || (audience === "admin" && viewer.isAdmin);
}

/** Pourquoi un visiteur ne peut pas suivre un tuto (bouton grisé d'une fiche ou d'un parcours). */
export function unavailableReason(audience: TourAudience): string {
  return audience === "admin" ? "Réservé aux administrateurs connectés." : "Connectez-vous pour suivre ce tuto.";
}

/** Tutos proposés sur cette page, pour ce visiteur. */
export function toursFor(pathname: string, viewer: TourViewer): Tour[] {
  return TOURS.filter((t) => canFollow(t.audience, viewer) && t.routes.some((r) => matches(r, pathname)));
}

export function routeMatches(match: string | RegExp, pathname: string): boolean {
  return matches(match, pathname);
}
