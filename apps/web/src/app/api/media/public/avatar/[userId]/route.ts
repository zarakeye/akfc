import { NextRequest } from "next/server";

import { prisma } from "@backend/prisma";
import { fetchAuthenticatedAsset } from "@backend/modules/cloudinary/services/cloudinary.service";

/**
 * Proxy PUBLIC d'avatar.
 *
 * Pourquoi une route à part plutôt que `/api/media/by-public-id/` : cette
 * dernière exige une session, sans condition, parce qu'elle sert aussi des
 * documents personnels. Tout avatar référencé dans une page publique y était
 * donc invisible pour un visiteur anonyme — sur ces cartes comme sur la page
 * des instructeurs.
 *
 * Rouvrir le proxy général aurait rendu les documents personnels accessibles
 * pour réparer des avatars. Cette route-ci ne sert QUE des avatars, qui sont
 * publics par nature : ils s'affichent à côté d'un nom sur des pages
 * publiques.
 *
 * Elle prend un `userId` et non un publicId : c'est ce qui garantit qu'elle
 * ne peut rien servir d'autre. Un publicId en paramètre rouvrirait le proxy
 * général sous un autre nom.
 */

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    if (!userId) return new Response("Missing userId", { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    // Pas d'avatar → 404 franc. Servir l'image de secours ferait apparaître
    // une photo de démonstration à la place d'un portrait absent : mieux vaut
    // que le rendu affiche ses initiales.
    if (!user?.avatar) return new Response("Not found", { status: 404 });

    const asset = await fetchAuthenticatedAsset(user.avatar, "large");
    if (!asset || !asset.ok || !asset.body) {
      return new Response("Not found", { status: 404 });
    }

    return new Response(asset.body, {
      status: 200,
      headers: {
        "Content-Type":
          asset.headers.get("content-type") ?? "application/octet-stream",
        // L'URL est stable par utilisateur, donc le cache est court : un
        // changement d'avatar doit se voir sans purge.
        "Cache-Control": "public, max-age=300",
        "X-Asset-Source": "cloudinary",
      },
    });
  } catch (error) {
    console.error("[media] public avatar error", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
