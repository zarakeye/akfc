import type { Tour } from "../tour.types";

/**
 * La bibliothèque (admin) — l'explorateur des fichiers du site, sans rien modifier.
 * Fiche de doc associée : même identifiant, « admin.bibliotheque ».
 * L'arbre et l'aperçu n'existent que sur un écran large : étapes facultatives.
 */
export const adminBibliotheque: Tour = {
  id: "admin.bibliotheque",
  title: "La bibliothèque",
  description: "Parcourir les fichiers du site, les trier, les ranger, les envoyer à la corbeille.",
  audience: "admin",
  routes: ["/dashboard/library"],
  startRoute: "/dashboard/library",
  doc: "/docs/admin/la-bibliotheque",
  steps: [
    {
      target: "finder.breadcrumb",
      title: "Où vous êtes",
      body: "Le chemin du dossier ouvert. Un clic sur un nom remonte à ce dossier.",
      advance: { kind: "next" },
    },
    {
      target: "finder.tree",
      title: "Les dossiers",
      body: "L'arborescence : un dossier par discipline, stage, évènement, groupe… La corbeille y est aussi (« bin »). Sur un écran étroit, on navigue par le contenu et le chemin.",
      advance: { kind: "next" },
      optional: true,
    },
    {
      target: "finder.content",
      title: "Le contenu",
      body: "Les fichiers et sous-dossiers du dossier ouvert. Un clic droit sur un élément propose : renommer, déplacer, rendre disponible aux membres.",
      advance: { kind: "next" },
    },
    {
      target: "finder.views",
      title: "L'affichage",
      body: "Grille, tableau ou liste compacte : le même contenu, trois présentations.",
      advance: { kind: "next" },
    },
    {
      target: "finder.delete",
      title: "La corbeille",
      body: "Ce bouton envoie la sélection à la corbeille, d'où on peut la restaurer. Dans la corbeille, il supprime définitivement. Les dossiers d'un groupe, d'un espace perso ou des avatars ne se suppriment pas ici.",
      advance: { kind: "next" },
    },
    {
      target: "finder.preview",
      title: "L'aperçu",
      body: "L'élément sélectionné : son aperçu et ses informations (format, dates, qui l'a déposé).",
      advance: { kind: "next" },
      optional: true,
    },
    {
      title: "Ajouter des fichiers",
      body: "Le « + » à côté de « Bibliothèque », dans le panneau de contrôle, ouvre la page d'envoi.",
      advance: { kind: "next" },
    },
  ],
};
