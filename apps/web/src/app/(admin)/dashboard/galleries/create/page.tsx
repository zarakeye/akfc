"use client";

import { JSX } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CreateGalleryForm } from "@features/admin/galleries/forms/CreateGalleryForm";

/**
 * Création d'une galerie — `/(admin)/dashboard/galleries/create`.
 * `CreateGalleryForm` gère métadonnées + items en une étape, et redirige
 * lui-même vers la nouvelle fiche au succès (SuccessRedirect).
 */
export default function CreateGalleryPage(): JSX.Element {
  return (
    <div>
      <Link
        href="/dashboard/galleries"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la liste
      </Link>
      <h2 className="mb-4 text-2xl font-bold">Créer une galerie</h2>
      <CreateGalleryForm />
    </div>
  );
}