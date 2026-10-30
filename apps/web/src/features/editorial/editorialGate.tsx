import type { JSX } from "react";
import type { Metadata } from "next";

import { prisma } from "@backend/prisma";
import { getSessionFromRequest } from "@backend/modules/auth/getSessionFromRequest";

/**
 * Gating d'une page éditoriale (home / association / contacts).
 *
 * Renvoie `true` si la page doit être MASQUÉE au visiteur courant : non publiée
 * (PageVisibility.published != true) ET visiteur non-admin. Un ADMIN voit
 * toujours la vraie page (prévisualisation). Lu côté serveur (cookies), donc
 * la page devient dynamique — ce qui est voulu pour un rendu par visiteur.
 */
export async function isEditorialPageGated(key: string): Promise<boolean> {
  const vis = await prisma.pageVisibility.findUnique({ where: { key } });
  if (vis?.published === true) return false;

  const session = await getSessionFromRequest();
  const isAdmin = (session?.user?.isAdmin ?? false);
  return !isAdmin;
}

/**
 * Métadonnées d'une page éditoriale NON publiée : jamais indexée. Le placeholder « en construction »
 * est servi à la même adresse que la vraie page ; sans cette consigne, un moteur qui suit un lien du
 * menu l'indexerait (« Page en construction » dans les résultats). La règle vaut pour tous, admins
 * compris : un robot n'est jamais connecté.
 * @returns `{ robots: noindex }` à fusionner dans les métadonnées de la page, ou `{}` si publiée
 */
export async function editorialRobots(key: string): Promise<Pick<Metadata, "robots">> {
  const vis = await prisma.pageVisibility.findUnique({ where: { key }, select: { published: true } });
  return vis?.published === true ? {} : { robots: { index: false, follow: false } };
}

/**
 * Placeholder « page en construction » — rendu à la place du contenu réel
 * quand la page est gatée. S'affiche dans le layout public (header + footer).
 */
export function UnderConstruction(): JSX.Element {
  return (
    <div className="akfc-page py-16 text-center">
      <h1 className="mb-4 text-2xl font-bold">Page en construction</h1>
      <p className="akfc-measure-block mx-auto text-muted-foreground">
        Cette page n&apos;est pas encore disponible. Revenez bientôt !
      </p>
    </div>
  );
}

/* ─── Brouillons : visibles des seuls administrateurs ────────────────────────────────────────── */

/** Un contenu daté est publié quand sa date de publication existe et n'est pas dans le futur. */
export function isLive(publicationDate: Date | null | undefined, now: Date = new Date()): boolean {
  return publicationDate != null && publicationDate <= now;
}

/** Le visiteur courant est-il administrateur ? (lecture serveur de la session) */
export async function viewerIsAdmin(): Promise<boolean> {
  const session = await getSessionFromRequest().catch(() => null);
  return session?.user?.isAdmin ?? false;
}

/**
 * Comment montrer un contenu au visiteur courant :
 *   - `"public"` : publié, rendu pour tous (fichiers par la route publique) ;
 *   - `"preview"` : brouillon vu par un administrateur (bandeau, fichiers par la route privée,
 *     puisque la route publique ne sert pas les fichiers d'un brouillon) ;
 *   - `null` : brouillon vu par quelqu'un d'autre → 404.
 */
export async function draftAccess(live: boolean): Promise<"public" | "preview" | null> {
  if (live) return "public";
  return (await viewerIsAdmin()) ? "preview" : null;
}

/** L'audience des fichiers d'un rendu, selon `draftAccess`. */
export function audienceFor(access: "public" | "preview"): "public" | "admin" {
  return access === "public" ? "public" : "admin";
}

/**
 * Rappel d'un brouillon vu par un administrateur — le même badge flottant que celui des pages
 * éditoriales (DraftPageBadge, qui les reconnaît par leur clé) : une discipline, un stage, un
 * événement ou un cours non publié n'a pas de clé, sa page le pose elle-même.
 */
export function DraftBanner(): JSX.Element {
  return (
    <div
      role="status"
      className="fixed bottom-4 right-4 z-50 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg"
    >
      Page non publiée
    </div>
  );
}

/**
 * `draftAccess` d'une page éditoriale (association, contacts, inscription) : publiée si son
 * interrupteur (PageVisibility) l'est. Même règle que `isEditorialPageGated`, qui reste la garde
 * de la page ; celle-ci dit en plus avec quelle audience rendre ses fichiers.
 */
export async function editorialAccess(key: string): Promise<"public" | "preview" | null> {
  const vis = await prisma.pageVisibility.findUnique({ where: { key }, select: { published: true } });
  return draftAccess(vis?.published === true);
}
