import type { Tour, TourAudience } from "./tour.types";
import { adminPostsCreate } from "./definitions/admin.posts.create";

/**
 * Registre de TOUS les tutos. Ajouter un tuto = créer son fichier dans `definitions/` et
 * l'ajouter à cette liste.
 */
export const TOURS: Tour[] = [adminPostsCreate];

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
