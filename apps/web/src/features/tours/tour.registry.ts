import type { Tour, TourAudience } from "./tour.types";
import { adminBibliotheque } from "./definitions/admin.bibliotheque";
import { adminBreakingNewsCreate } from "./definitions/admin.breaking-news.create";
import { adminCategoriesCreate } from "./definitions/admin.categories.create";
import { adminConstructeur } from "./definitions/admin.constructeur";
import { adminCorbeilleRestaurer } from "./definitions/admin.corbeille.restaurer";
import { adminCoursesCreate } from "./definitions/admin.courses.create";
import { adminDroitImagePhotos } from "./definitions/admin.droit-image.photos";
import { adminDisciplinesCreate } from "./definitions/admin.disciplines.create";
import { adminEventsCreate } from "./definitions/admin.events.create";
import { adminFamiliesCreate } from "./definitions/admin.families.create";
import { adminGalleriesCreate } from "./definitions/admin.galleries.create";
import { adminGroupsCreate } from "./definitions/admin.groups.create";
import { adminOriginsCreate } from "./definitions/admin.origins.create";
import { adminPagesPublication } from "./definitions/admin.pages.publication";
import { adminPostsCreate } from "./definitions/admin.posts.create";
import { adminReglages } from "./definitions/admin.reglages";
import { adminSeminarsCreate } from "./definitions/admin.seminars.create";
import { adminSeminarsSeances } from "./definitions/admin.seminars.seances";
import { adminTableauDeBord } from "./definitions/admin.tableau-de-bord";
import { adminTicketsTraiter } from "./definitions/admin.tickets.traiter";
import { adminUsersCreate } from "./definitions/admin.users.create";
import { adminUsersDroitImageMineur } from "./definitions/admin.users.droit-image-mineur";
import { membreContacterLeClub } from "./definitions/membre.contacter-le-club";
import { membreDocuments } from "./definitions/membre.documents";
import { membreVersions } from "./definitions/membre.versions";
import { membreProfil } from "./definitions/membre.profil";
import { publicDecouvrirLeSite } from "./definitions/public.decouvrir-le-site";
import { publicMotDePasseOublie } from "./definitions/public.mot-de-passe-oublie";
import { demoConnexionAdmin, demoConnexionMembre, demoConnexionSupport } from "./definitions/demo.connexion";
import { demoDemandesEcrire, demoDemandesSupport, demoDemandesTraiter } from "./definitions/demo.demandes";
import { demoGroupesCreer, demoGroupesSupprimer } from "./definitions/demo.groupes";
import {
  demoMediathequeCorbeille,
  demoMediathequeParcourir,
  demoMediathequeRanger,
  demoMediathequeVersions,
} from "./definitions/demo.mediatheque";
import { demoPageCompleter } from "./definitions/demo.page";
import {
  demoMembreApparais,
  demoMembreAvatar,
  demoMembreConsentement,
  demoMembreDepot,
  demoMembreProfil,
} from "./definitions/demo.membre";
import { demoDroitsMasques, demoDroitsRefuser, demoDroitsRelancer, demoDroitsTaguer } from "./definitions/demo.droits";

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
  membreVersions,
  adminTableauDeBord,
  adminPostsCreate,
  adminBreakingNewsCreate,
  adminPagesPublication,
  adminUsersCreate,
  adminUsersDroitImageMineur,
  adminTicketsTraiter,
  adminGroupsCreate,
  adminDisciplinesCreate,
  adminCoursesCreate,
  adminSeminarsCreate,
  adminSeminarsSeances,
  adminEventsCreate,
  adminConstructeur,
  adminBibliotheque,
  adminCorbeilleRestaurer,
  adminGalleriesCreate,
  adminDroitImagePhotos,
  adminCategoriesCreate,
  adminFamiliesCreate,
  adminOriginsCreate,
  adminReglages,
  // La démo : lancés par son panneau, en mode guidé ; jamais proposés par le lanceur « ? ».
  demoConnexionAdmin,
  demoConnexionMembre,
  demoConnexionSupport,
  demoDemandesEcrire,
  demoDemandesTraiter,
  demoDemandesSupport,
  demoGroupesCreer,
  demoGroupesSupprimer,
  demoMediathequeParcourir,
  demoMediathequeRanger,
  demoMediathequeVersions,
  demoMediathequeCorbeille,
  demoDroitsTaguer,
  demoDroitsRelancer,
  demoDroitsRefuser,
  demoDroitsMasques,
  demoPageCompleter,
  demoMembreProfil,
  demoMembreConsentement,
  demoMembreApparais,
  demoMembreAvatar,
  demoMembreDepot,
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
  return TOURS.filter((t) => !t.demoOnly && canFollow(t.audience, viewer) && t.routes.some((r) => matches(r, pathname)));
}

export function routeMatches(match: string | RegExp, pathname: string): boolean {
  return matches(match, pathname);
}
