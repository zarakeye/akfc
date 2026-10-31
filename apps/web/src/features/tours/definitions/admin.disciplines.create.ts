import type { Tour } from "../tour.types";

/**
 * Créer une discipline (admin) — le formulaire, sans l'enregistrer.
 * Fiche de doc associée : même identifiant, « admin.disciplines.create ».
 * Les deux boutons sont montrés, aucun n'est cliqué : rien n'est créé.
 */
export const adminDisciplinesCreate: Tour = {
  id: "admin.disciplines.create",
  title: "Créer une discipline",
  description: "Présenter un art enseigné par le club, puis l'enregistrer en brouillon ou le publier.",
  audience: "admin",
  routes: ["/dashboard/disciplines", "/dashboard/disciplines/create"],
  startRoute: "/dashboard/disciplines",
  doc: "/docs/admin/creer-une-discipline",
  steps: [
    {
      target: "disciplines.list.create",
      title: "Ouvrez le formulaire",
      body: "Cliquez sur « Créer une discipline ».",
      advance: { kind: "click" },
    },
    {
      target: "disciplines.form.identity",
      title: "L'identité",
      body: "Le nom, le slug (l'adresse de sa page, rempli d'après le nom), le type, la catégorie et l'instructeur principal sont obligatoires. La catégorie ne se change plus ensuite.",
      advance: { kind: "next" },
    },
    {
      target: "disciplines.form.origin",
      title: "Origine et classification",
      body: "Facultatifs : l'origine culturelle, la famille (qui la range dans le menu « Nos disciplines »), l'école, la classification.",
      advance: { kind: "next" },
    },
    {
      target: "disciplines.form.description",
      title: "La page de la discipline",
      body: "Le contenu de sa page publique, composé avec le constructeur : textes, images, documents.",
      advance: { kind: "next" },
    },
    {
      target: "disciplines.form.summary",
      title: "La carte de l'accueil",
      body: "Une image et quelques lignes, en carte sur la page d'accueil avec un lien vers la page complète. Vide : la discipline ne figure pas sur l'accueil.",
      advance: { kind: "next" },
    },
    {
      target: "disciplines.form.submit",
      title: "Brouillon ou publication",
      body: "« Enregistrer en brouillon » la garde invisible du public ; « Publier » la met en ligne aussitôt, avec ses cours. Ce tuto ne clique ni l'un ni l'autre.",
      advance: { kind: "next" },
    },
  ],
};
