import type { Session } from "@prisma/client";

export type SessionJwtPayload = {
  sessionId: Session["id"];
};