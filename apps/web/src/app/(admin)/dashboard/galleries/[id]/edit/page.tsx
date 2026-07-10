"use client";

import { JSX, use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import { UpdateGalleryForm } from "@features/admin/galleries/forms/UpdateGalleryForm";
import { GalleryItemsManager } from "@features/admin/galleries/components/GalleryItemsManager";

/**
 * Édition d'une galerie — `/(admin)/dashboard/galleries/[id]/edit`.
 *
 * Particularité : la galerie a DEUX zones d'édition indépendantes —
 *   1. les **métadonnées** (`UpdateGalleryForm`, server action qui invalide
 *      déjà `getById`/`getAll` au succès) ;
 *   2. les **items** (`GalleryItemsManager`, mutation `setItems` + invalidation).
 *
 * Comme chacune a son propre bouton d'enregistrement, on ne force pas de
 * redirection unique : un lien « Retour à la fiche » suffit. (Les autres
 * entités, à formulaire unique, utilisent `SuccessRedirect`.)
 */
export default function EditGalleryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): JSX.Element {
  const { id } = use(params);
  const galleryId = Number(id);

  const {
    data: gallery,
    isLoading,
    isError,
  } = trpc.gallery.getById.useQuery(
    { id: galleryId },
    { enabled: Number.isFinite(galleryId) && galleryId > 0 },
  );

  if (isLoading) return <div>Chargement de la galerie…</div>;
  if (isError || !gallery) {
    return <div className="text-red-600">Galerie introuvable.</div>;
  }

  return (
    <div>
      <Link
        href={`/dashboard/galleries/${galleryId}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la fiche
      </Link>
      <h2 className="mb-4 text-2xl font-bold">Éditer la galerie</h2>

      <div className="mb-8">
        <UpdateGalleryForm gallery={gallery} />
      </div>

      <GalleryItemsManager
        galleryId={galleryId}
        initialMediaIds={gallery.items.map((it) => it.mediaAssetId)}
      />
    </div>
  );
}