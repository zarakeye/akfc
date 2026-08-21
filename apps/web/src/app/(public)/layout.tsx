import { JSX } from "react";

import Header from "@features/app-shell/Header";
import Footer from "@features/app-shell/Footer";
import { prisma } from "@backend/prisma";
import { BreakingNewsShell } from "@features/breaking-news/BreakingNewsShell";
import { FirstLoginRedirect } from "@features/auth/FirstLoginRedirect";
import { DraftPageBadge } from "@features/app-shell/DraftPageBadge";

/**
 * Layout du SITE PUBLIC.
 *
 * Contrairement au shell admin, le public est constitué de pages longues
 * (home avec carousel + sections, disciplines, stages…). On laisse donc le
 * DOCUMENT scroller naturellement : aucune hauteur fixe, aucun
 * `overflow-hidden`. Header sticky en haut, contenu qui s'étend en dessous.
 *
 * Le layout fetch les BreakingNews ACTIVES (publiées, non expirées) en
 * Prisma direct — même logique que `breakingNews.getActive` côté tRPC —
 * et les sert au ruban et à la sidebar (via BreakingNewsShell) sur TOUTES les pages
 * publiques, sans une seule requête client. Le ruban vit sous le header,
 * hors du bloc sticky : il défile avec la page au lieu de consommer de
 * la hauteur en permanence.
 */
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<JSX.Element> {
  const now = new Date();
  const activeNews = await prisma.breakingNews.findMany({
    where: {
      publicationDate: { not: null, lte: now },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: { publicationDate: "desc" },
    take: 20,
  });

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="sticky top-0 z-50 bg-background">
        <Header />
        <FirstLoginRedirect />
      </div>
      <BreakingNewsShell news={activeNews} />
      <main className="flex-1">{children}</main>
      <Footer />
      <DraftPageBadge />
    </div>
  );
}
