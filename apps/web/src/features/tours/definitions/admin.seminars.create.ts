import type { Tour } from "../tour.types";

/**
 * Créer un stage (admin) — le formulaire, sans l'enregistrer.
 * Fiche de doc associée : même identifiant, « admin.seminars.create ».
 * Les dates (séances) s'ajoutent ensuite, depuis l'édition du stage : tuto « admin.seminars.seances ».
 */
export const adminSeminarsCreate: Tour = {
  id: "admin.seminars.create",
  title: "Créer un stage",
  description: "Présenter un stage : qui l'anime, à quoi il se rattache, son programme, sa publication.",
  audience: "admin",
  routes: ["/dashboard/seminars", "/dashboard/seminars/create"],
  startRoute: "/dashboard/seminars",
  doc: "/docs/admin/creer-un-stage",
  steps: [
    {
      target: "seminars.list.create",
      title: "Ouvrez le formulaire",
      body: "Cliquez sur « Créer un stage ».",
      advance: { kind: "click" },
    },
    {
      target: "seminars.form.identity",
      title: "L'identité",
      body: "Le label, l'audience, le slug (l'adresse de sa page) et l'animateur principal sont obligatoires.",
      advance: { kind: "next" },
    },
    {
      target: "seminars.form.attachment",
      title: "Le rattachement",
      body: "Au moins un : une discipline du club, une discipline externe (libellé libre) ou une origine culturelle.",
      advance: { kind: "next" },
    },
    {
      target: "seminars.form.description",
      title: "Description et programme",
      body: "Deux contenus composés avec le constructeur : ce qu'est le stage, puis son déroulé. Plus bas : les co-animateurs, la carte de l'agenda et les prérequis.",
      advance: { kind: "next" },
    },
    {
      target: "seminars.form.publication",
      title: "La publication",
      body: "« Brouillon » le garde invisible du public ; « Planifier la publication » demande une date : passée, il est publié aussitôt, future, sa publication est programmée.",
      advance: { kind: "next" },
    },
    {
      target: "seminars.form.submit",
      title: "Créer",
      body: "Le stage est créé, sans date : ses séances s'ajoutent ensuite en l'éditant (tuto « Ajouter des séances »). Ce tuto ne clique pas.",
      advance: { kind: "next" },
    },
  ],
};
