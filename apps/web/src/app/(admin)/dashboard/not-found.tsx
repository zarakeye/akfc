import { JSX } from "react";

import { PageIntrouvable } from "#features/app-shell/PageIntrouvable.tsx";

/**
 * 404 du panneau de contrôle : notFound() appelé dans une page du dashboard (un membre, une
 * discipline, un flash info qui n'existe plus). Rendu DANS le layout du dashboard, header et barre
 * latérale compris, avec un retour au tableau de bord plutôt qu'à l'accueil du site.
 */
export default function DashboardNotFound(): JSX.Element {
  return <PageIntrouvable retour="/dashboard" libelleRetour="Retour au tableau de bord" />;
}
