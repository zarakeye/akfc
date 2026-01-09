import { cookies } from "next/headers";
import { prisma } from "@server/prisma";
import jwt from "jsonwebtoken";
import { COOKIE_NAME } from "@lib/constants";


export async function getSessionFromRequest() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  let payload: { sessionId: string }; 

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET ?? "") as { sessionId: string };
  } catch {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId },
    include: {
      user: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          }
        }
      }
    },
  });

  if (!session) return null;

  if (session.expiresAt < new Date()) return null;

  return session;
}