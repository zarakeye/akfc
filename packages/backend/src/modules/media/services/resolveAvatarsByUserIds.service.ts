import type { PrismaClient } from "@prisma/client";

import { buildMediaProxyUrl } from "@backend/modules/media/helpers/media-url";
import type { ResolvedMedia } from "@contracts/page";

/**
 * Résout les avatars d'une liste d'utilisateurs en `ResolvedMedia`, pour les
 * blocs media-text qui référencent « l'avatar de tel user » (référence
 * LOGIQUE, résolue dynamiquement → la page suit toujours l'avatar courant).
 *
 * `User.avatar` stocke un publicId Cloudinary (délivrance signée via le
 * proxy). On construit l'URL de la même façon que pour un MediaAsset image.
 * Un user sans avatar → absent de la map (le rendu affichera un placeholder).
 */
export async function resolveAvatarsByUserIds(
  prisma: PrismaClient,
  userIds: string[],
): Promise<Record<string, ResolvedMedia | null>> {
  const out: Record<string, ResolvedMedia | null> = {};
  for (const id of userIds) out[id] = null;

  if (userIds.length === 0) return out;

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, avatar: true, firstName: true, lastName: true },
  });

  for (const user of users) {
    if (!user.avatar) continue; // pas d'avatar → reste null (placeholder)
    const url = buildMediaProxyUrl(
      { publicId: user.avatar, fullPath: "" },
      "public",
    );
    out[user.id] = {
      url,
      kind: "image",
      posterUrl: null,
      mimeType: "image/*",
      fileName:
        [user.firstName, user.lastName].filter(Boolean).join(" ") || "avatar",
      width: null,
      height: null,
      duration: null,
    };
  }

  return out;
}
