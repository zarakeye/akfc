import type { Tour } from "../tour.types";

/**
 * Traiter une demande (responsables des demandes) — la boîte, puis une demande.
 * Fiche de doc associée : même identifiant, « admin.tickets.traiter ».
 * Public « member » : un membre d'un groupe responsable d'une catégorie traite les demandes sans
 * être administrateur. Les étapes sur une demande sont FACULTATIVES (la boîte peut être vide), et
 * rien n'est envoyé.
 */
export const adminTicketsTraiter: Tour = {
  id: "admin.tickets.traiter",
  title: "Traiter une demande",
  description: "Trier les demandes reçues, en prendre une en charge, y répondre.",
  audience: "member",
  routes: ["/dashboard/tickets", /^\/dashboard\/tickets\/[^/]+$/],
  startRoute: "/dashboard/tickets",
  steps: [
    {
      target: "tickets.tabs",
      title: "Les demandes reçues",
      body: "Vous ne voyez que les catégories que vous traitez. « Ouvertes » : toutes celles en cours ; « À moi » : celles dont vous êtes responsable ; « Sans responsable » : celles que personne n'a prises.",
      advance: { kind: "next" },
    },
    {
      target: "tickets.item",
      title: "Ouvrez une demande",
      body: "Chaque ligne donne la référence, le sujet, le demandeur et le délai de réponse. Cliquez sur une demande.",
      advance: { kind: "click" },
      optional: true,
    },
    {
      target: "tickets.actions",
      title: "Qui s'en occupe",
      body: "« Prendre en charge » vous en rend responsable ; « Transférer… » la passe à quelqu'un d'autre, avec une note ; « Clore la demande » la range.",
      advance: { kind: "next" },
      optional: true,
    },
    {
      target: "tickets.reply",
      title: "Répondre",
      body: "« Envoyer la réponse » part par e-mail au demandeur, signée de votre nom. Ce tuto n'envoie rien.",
      advance: { kind: "next" },
      optional: true,
    },
    {
      target: "tickets.history",
      title: "L'historique",
      body: "Qui a pris, transféré, répondu, clos, et quand.",
      advance: { kind: "next" },
      optional: true,
    },
    {
      title: "C'est tout",
      body: "Une demande sans réponse au-delà du délai promis est signalée en rouge, en haut de la liste.",
      advance: { kind: "next" },
    },
  ],
};
