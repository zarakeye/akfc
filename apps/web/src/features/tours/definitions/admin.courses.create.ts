import type { Tour } from "../tour.types";

/**
 * Créer un cours (admin) — le formulaire, sans l'enregistrer.
 * Fiche de doc associée : même identifiant, « admin.courses.create ».
 * Un cours n'a pas de brouillon : « Créer » le met en ligne si sa discipline est publiée. Le tuto ne clique pas.
 */
export const adminCoursesCreate: Tour = {
  id: "admin.courses.create",
  title: "Créer un cours",
  description: "Ajouter un créneau hebdomadaire à une discipline.",
  audience: "admin",
  routes: ["/dashboard/courses", "/dashboard/courses/create"],
  startRoute: "/dashboard/courses",
  doc: "/docs/admin/creer-un-cours",
  steps: [
    {
      target: "courses.list.create",
      title: "Ouvrez le formulaire",
      body: "Un cours est un créneau qui revient chaque semaine. Cliquez sur « Créer un cours ».",
      advance: { kind: "click" },
    },
    {
      target: "courses.form.slot",
      title: "Le créneau",
      body: "La discipline, le public, le jour, l'heure de début et de fin, l'instructeur, et les prérequis (un par ligne).",
      advance: { kind: "next" },
    },
    {
      target: "courses.form.content",
      title: "La page du cours",
      body: "Son contenu, composé avec le constructeur.",
      advance: { kind: "next" },
    },
    {
      target: "courses.form.submit",
      title: "Créer",
      body: "Un cours n'a pas de brouillon : dès sa création, il est visible sur le site si sa discipline est publiée. Ce tuto ne clique pas.",
      advance: { kind: "next" },
    },
  ],
};
