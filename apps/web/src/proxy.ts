import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { COOKIE_NAME } from "@akfc/contracts/auth/constants"

const PUBLIC_PATHS = [
  "/",
  "/docs",
  "/auth",
  "/api",
  "/_next",
  "/favicon.ico",
]

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

export async function proxy(req: NextRequest) {
  const { pathname, origin } = req.nextUrl

  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) {
    return NextResponse.redirect(new URL("/", origin))
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET ?? "")
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL("/", origin))
  }
}