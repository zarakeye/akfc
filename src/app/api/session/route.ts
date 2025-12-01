// api/session/route.ts
import { prisma } from "@/server/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { COOKIE_NAME } from "@/lib/constants";

export async function GET(req: NextRequest) {
  // Récupère le cookie
  const cookieHeader = req.headers.get("cookie") ?? "";
  const cookies = Object.fromEntries(cookieHeader.split("; ").map(c => {
    const [key, ...v] = c.split("=");
    return [key, decodeURIComponent(v.join("="))];
  }));
  const token = cookies[COOKIE_NAME];

  if (!token) return NextResponse.redirect("/login");

  let payload: { sessionId: string; userId: string };

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET ?? "") as { sessionId: string; userId: string };
  } catch {
    return NextResponse.redirect("/login");
  }

  // Récupère la session
  // const payload = jwt.verify(token, process.env.JWT_SECRET ?? "");
  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId },
    include: { user: { include: { role: true } } },
  });

  if (!session || session.expiresAt < new Date()) {
    return NextResponse.redirect("/login");
  }
  
  return NextResponse.json(session);
}
