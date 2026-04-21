import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { COOKIE_NAME } from "@workspace/contracts/src/auth/constants";

const JWT_SECRET = process.env.JWT_SECRET;

const PUBLIC_PATHS = [
  "/",
  "/docs",
  "/auth",
  "/api",
  "/_next",
  "/favicon.ico",
];

/**
 * Ce proxy agit comme un préfiltre léger :
 * - il vérifie la présence du cookie d'auth
 * - il vérifie que le JWT est encore valide
 *
 * Il ne vérifie PAS la session en base de données.
 * La validation canonique de l'authentification reste faite côté backend via :
 * - getSessionFromRequest
 * - createTRPCContext
 * - protectedProcedure
 */
function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export async function proxy(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/", origin));
  }

  if (!JWT_SECRET) {
    return NextResponse.redirect(new URL("/", origin));
  }

  try {
    jwt.verify(token, JWT_SECRET);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/", origin));
  }
}