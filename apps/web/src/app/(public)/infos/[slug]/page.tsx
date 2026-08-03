import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { parsePageContentV1 } from "@contracts/page";

import { PageRenderer } from "@features/page-builder/PageRenderer";

/**
 * Route publique GÉNÉRIQUE des pages de contenu.
 *
 * Sert n'importe quelle `SitePage` par son slug : mentions légales,
 * politique de confidentialité, règlement intérieur… Le socle était déjà
 * générique, il ne lui manquait qu'une porte d'entrée publique.
 *
 * `/about` garde sa route en dur : cette adresse-là fait partie de la
 * vitrine et mérite son URL propre. Une page légale, non — `/infos/…` lui
 * convient très bien.
 *
 * Une page non rédigée s'affiche et le dit, plutôt que de rendre un 404 : le
 * pied de page y renvoie en permanence, et un lien de navigation qui tombe
 * sur une erreur est bien pire qu'une page qui s'annonce vide.
 */
export default async function InfoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<JSX.Element> {
  const { slug } = await params;
  const page = await prisma.sitePage.findUnique({ where: { slug } });
  const content = parsePageContentV1(page?.content);

  return (
    <div className="akfc-page py-12">
      <h1 className="mb-8 text-2xl font-bold">{page?.title ?? "Information"}</h1>

      {content.blocks.length > 0 ? (
        <PageRenderer content={content} />
      ) : (
        <p className="akfc-measure-block text-muted-foreground">
          Cette page n&apos;a pas encore été rédigée.
        </p>
      )}
    </div>
  );
}
