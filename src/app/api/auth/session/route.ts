// middleware.ts ou proxy.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { COOKIE_NAME } from "@lib/constants";

/**
 * Middleware qui vérifie si le cookie de session est présent et valide.
 * Si le cookie est absent ou invalide, redirige vers la page de login.
 * Sinon, passe la requête au prochain.
 */
export async function middleware(req: NextRequest): Promise<NextResponse> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.redirect("/login");

  try {
    jwt.verify(token, process.env.JWT_SECRET ?? "");
    return NextResponse.next();
  } catch {
    return NextResponse.redirect("/login");
  }
}
