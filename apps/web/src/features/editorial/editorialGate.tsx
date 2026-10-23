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
