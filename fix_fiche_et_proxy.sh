#!/bin/bash
# Fix double : fiche admin posts (crash PageRenderer async Client Component)
# + matcher du proxy (garde admin inopérante).
# À lancer depuis la RACINE du monorepo : bash fix_fiche_et_proxy.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : à lancer depuis la racine du monorepo." >&2; exit 1; }

echo "→ apps/web/src/app/(admin)/dashboard/posts/[id]/page.tsx"
echo "   fiche posts en Server Component (fix crash PageRenderer)"
cat > 'apps/web/src/app/(admin)/dashboard/posts/[id]/page.tsx' << 'FILE_EOF'
import { notFound } from "next/navigation";
import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { PageRenderer } from "@features/page-builder";
import { parsePageContentV1 } from "@contracts/page";
import { PresentationShell } from "@features/admin/common/components/PresentationShell";

/** null → Brouillon, future → Programmé, passée → Publié. */
function statut(publicationDate: Date | null): string {
  if (!publicationDate) return "Brouillon";
  return publicationDate > new Date()
    ? `Programmé le ${publicationDate.toLocaleDateString("fr-FR")}`
    : `Publié le ${publicationDate.toLocaleDateString("fr-FR")}`;
}

/**
 * Présentation admin d'un article — `/(admin)/dashboard/posts/[id]` (lecture seule).
 *
 * Server Component en Prisma direct (pattern des fiches stages/disciplines/
 * users) : `PageRenderer` est un RSC async, inrendable depuis un Client
 * Component — l'ancienne version client (React Query) crashait pour cette
 * raison. Contrepartie assumée : la fiche est fraîche au chargement de la
 * page, plus par le cache React Query (une navigation retour depuis /edit
 * refetch côté serveur, ce qui revient au même).
 *
 * La garde d'accès est portée par le proxy (matcher /dashboard) — comme
 * pour les autres fiches RSC de l'admin.
 */
export default async function PostPresentationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isFinite(postId) || postId <= 0) notFound();

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) notFound();

  const content = parsePageContentV1(post.content);

  return (
    <PresentationShell
      title={post.title}
      listHref="/dashboard/posts"
      editHref={`/dashboard/posts/${post.id}/edit`}
    >
      <dl className="mb-6 grid grid-cols-1 gap-3 border-b border-border pb-6 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium text-muted-foreground">Statut</dt>
          <dd>{statut(post.publicationDate)}</dd>
        </div>
      </dl>

      <PageRenderer content={content} />
    </PresentationShell>
  );
}
FILE_EOF

echo "→ apps/web/src/proxy.ts"
echo "   matcher corrigé : /dashboard (l ancien ne matchait jamais)"
cat > 'apps/web/src/proxy.ts' << 'FILE_EOF'
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { COOKIE_NAME } from "@contracts/auth/constants";

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Préfiltre d'auth léger.
 *
 * Grâce au `matcher` plus bas, ce proxy ne s'exécute QUE sur l'espace protégé
 * (`/(admin)/**`). Tout le reste — pages publiques (home, disciplines, stages,
 * évènements, galerie, à propos, contacts), assets `/public` (logo, icônes,
 * fonts) et `/api` — ne passe jamais par ici, donc plus aucune redirection
 * parasite sur les fichiers statiques.
 *
 * Il vérifie seulement la présence + validité (signature) du JWT. Il ne
 * vérifie PAS la session en base : la validation canonique reste côté backend
 * via getSessionFromRequest / createTRPCContext / protectedProcedure.
 */
export async function proxy(req: NextRequest) {
  const { origin } = req.nextUrl;

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token || !JWT_SECRET) {
    return NextResponse.redirect(new URL("/", origin));
  }

  try {
    jwt.verify(token, JWT_SECRET);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/", origin));
  }
}

export const config = {
  // Le proxy ne tourne QUE sur l'espace protégé. Tout le reste est public.
  // Ajoute ici d'éventuelles autres zones privées (ex. "/account/:path*").
  // ⚠ "(admin)" est un route group : il n'existe PAS dans les URLs.
  // L'ancien matcher "/(admin)/:path*" ne matchait donc JAMAIS — le
  // proxy ne tournait pas et l'espace admin était sans garde de route.
  matcher: ["/dashboard/:path*"],
};
FILE_EOF

echo
echo "2 fichiers écrits. Validation :"
pnpm --filter web typecheck