import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { parsePageContentV1 } from "@contracts/page";

import { PageRenderer } from "@features/page-builder/PageRenderer";

export const dynamic = 'force-dynamic';

/**
 * « L'association » — présentation du club.
 *
 * Route en dur plutôt que `/pages/[slug]` générique : l'adresse fait partie
 * de la vitrine, et `/about` se retient. Le SOCLE est générique (`SitePage`),
 * l'URL ne l'est pas — les deux choix sont indépendants.
 *
 * Quand la page n'a pas encore été rédigée, elle s'affiche et le dit, au lieu
 * de rendre un 404 : le menu y mène dès maintenant, et une entrée de
 * navigation qui tombe sur une erreur est bien pire qu'une page qui s'annonce
 * vide.
 */
export default async function AboutPage(): Promise<JSX.Element> {
  const page = await prisma.sitePage.findUnique({
    where: { slug: "association" },
  });
  const content = parsePageContentV1(page?.content);

  return (
    <div className="akfc-page py-12">
      <h1 className="mb-8 text-2xl font-bold">
        {page?.title ?? "L'association"}
      </h1>

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
