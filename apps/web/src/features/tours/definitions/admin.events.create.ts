import type { Tour } from "../tour.types";

/**
 * Créer un évènement (admin) — le formulaire, sans l'enregistrer.
 * Fiche de doc associée : même identifiant, « admin.events.create ».
 * Les dates (séances) s'ajoutent ensuite, depuis l'édition de l'évènement.
 */
export const adminEventsCreate: Tour = {
  id: "admin.events.create",
  title: "Créer un évènement",
  description: "Présenter un évènement : son public, son organisateur, son rattachement, sa publication.",
  audience: "admin",
  routes: ["/dashboard/events", "/dashboard/events/create"],
  startRoute: "/dashboard/events",
  doc: "/docs/admin/creer-un-evenement",
  steps: [
    {
      target: "events.list.create",
      title: "Ouvrez le formulaire",
      body: "Cliquez sur « Créer un évènement ».",
      advance: { kind: "click" },
    },
    {
      target: "events.form.identity",
      title: "Identité et publication",
      body: "Le label, le slug, l'audience et l'organisateur sont obligatoires. La date de publication : vide, c'est un brouillon ; future, la publication est programmée.",
      advance: { kind: "next" },
    },
    {
      target: "events.form.attachment",
      title: "Le rattachement",
      body: "Au moins un : des disciplines du club, des libellés externes, ou une origine culturelle.",
      advance: { kind: "next" },
    },
    {
      target: "events.form.content",
      title: "Le contenu",
      body: "La présentation de l'évènement, composée avec le constructeur. Plus bas : sa carte pour la page Agenda.",
      advance: { kind: "next" },
    },
    {
      target: "events.form.submit",
      title: "Créer",
      body: "L'évènement est créé, sans date : ses séances s'ajoutent ensuite en l'éditant. Ce tuto ne clique pas.",
      advance: { kind: "next" },
    },
  ],
};
