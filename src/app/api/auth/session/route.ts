// middleware.ts ou proxy.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { COOKIE_NAME } from "@lib/constants";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.redirect("/login");

  try {
    jwt.verify(token, process.env.JWT_SECRET ?? "");
    return NextResponse.next();
  } catch {
    return NextResponse.redirect("/login");
  }
}
