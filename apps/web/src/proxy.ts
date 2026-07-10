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
  matcher: ["/dashboard/:path*", "/profil/:path*"],
};
