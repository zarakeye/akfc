import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@server/prisma";
import jwt from "jsonwebtoken";
import { COOKIE_NAME } from "./lib/constants";

export async function proxy(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  let payload: { sessionId: string; userId: string } | null = null;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET ?? '') as { sessionId: string; userId: string };
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const session = await prisma.session.findUnique({
    where: { id: payload?.sessionId },
    include: { user: { include: { role: true } } }
  });

  if (!session || session.expiresAt < new Date()) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const user = session.user;

  // RBAC
  const pathname = req.nextUrl.pathname;
  
  const routePermissions = [
    { match: "/admin", required: "manage_users" },
    { match: "/courses/edit", required: "edit_courses" },
    { match: "/stats", required: "view_stats" },
  ];

  for (const rule of routePermissions) {
    if (pathname.startsWith(rule.match)) {
      // if (!user.role?.permissions.includes(rule.required)) {
      //   return new NextResponse("Forbidden", { status: 403 });
      // }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/account/:path*",
  ],
};