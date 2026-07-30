import type { PrismaClient } from "@prisma/client";

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
    // Route publique dédiée, et non le proxy général : celui-ci exige une
    // session sans condition (il sert aussi des documents personnels), donc
    // il rendait tout avatar invisible aux visiteurs anonymes — ici comme sur
    // la page des instructeurs.
    const url = `/api/media/public/avatar/${encodeURIComponent(user.id)}`;
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
