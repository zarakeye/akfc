import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { COOKIE_NAME } from "@lib/constants";

export async function proxy(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  // Don't protect the login page itself
  if (pathname.startsWith("/")) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    const loginUrl = new URL("/", origin);
    return NextResponse.redirect(loginUrl);
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET ?? "");
    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/", origin);
    return NextResponse.redirect(loginUrl);
  }
}