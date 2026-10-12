import { NextRequest } from "next/server";

import { prisma } from "@backend/prisma";
import { isAvatarKey } from "@backend/modules/avatar/avatar.service";
import { resolveDeliveryKey, streamDerived } from "@backend/modules/media/services/mediaDerivatives.service";

/**
 * Proxy PUBLIC d'avatar.
 *
 * Pourquoi une route à part plutôt que `/api/media/r2/` : cette dernière
 * exige une session, sans condition, parce qu'elle sert aussi des documents
 * personnels. Tout avatar référencé dans une page publique y était
 * donc invisible pour un visiteur anonyme — sur ces cartes comme sur la page
 * des instructeurs.
 *
 * Rouvrir le proxy général aurait rendu les documents personnels accessibles
 * pour réparer des avatars. Cette route-ci ne sert QUE des avatars, qui sont
 * publics par nature : ils s'affichent à côté d'un nom sur des pages
 * publiques.
 *
 * Elle prend un `userId` et non un chemin : c'est ce qui garantit qu'elle ne
 * peut rien servir d'autre. Un chemin en paramètre rouvrirait le proxy
 * général sous un autre nom.
 */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;

    // `v` (version, transmise par le store d'avatar) ne sert qu'à changer
    // l'URL après un remplacement, pour contourner le cache : rien à lire ici.
    if (!userId) return new Response("Missing userId", { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    // Pas d'avatar → 404 franc. Servir l'image de secours ferait apparaître
    // une photo de démonstration à la place d'un portrait absent : mieux vaut
    // que le rendu affiche ses initiales.
    if (!user?.avatar) return new Response("Not found", { status: 404 });

    // Valeur héritée inutilisable (ancien identifiant sans fichier) : pas de portrait.
    if (!isAvatarKey(user.avatar)) return new Response("Not found", { status: 404 });

    // Déclinaison 300 px, servie en flux. URL stable par utilisateur : cache
    // court, un changement d'avatar doit se voir sans purge.
    const key = await resolveDeliveryKey(user.avatar, new URLSearchParams({ variant: "small" }));
    if (!key) return new Response("Not found", { status: 404 });
    return await streamDerived(key, "public, max-age=300", req.headers.get("accept"));
  } catch (error) {
    console.error("[media] public avatar error", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
