import { JSX } from "react";
import { connection } from "next/server";

import PublicLayout from "#app/(public)/layout.tsx";
import { PageIntrouvable } from "#features/app-shell/PageIntrouvable.tsx";

/**
 * 404 du site : une adresse qu'aucune route ne connaît, ou notFound() appelé dans une page publique.
 *
 * Ce fichier, à la racine de app/, n'est enveloppé QUE par le layout racine : une adresse inconnue
 * n'appartient à aucun groupe, donc ni (public)/layout.tsx ni un autre ne s'appliquent. Pour que le
 * visiteur garde le header, le ruban et le footer du site, la page appelle elle-même le layout public.
 *
 * `await connection()` : sans lui, Next PRÉ-RENDRAIT cette page pendant `next build` (pour /_not-found
 * et /_global-error), donc interrogerait la base pendant la construction de l'image Docker, où elle
 * n'est pas joignable — et le build échouerait. Avec lui, la page est rendue à chaque requête, avec
 * le logo et les flashs info du moment.
 */
export default async function NotFound(): Promise<JSX.Element> {
  await connection();
  return (
    <PublicLayout>
      <PageIntrouvable retour="/" libelleRetour="Retour à l’accueil" />
    </PublicLayout>
  );
}
