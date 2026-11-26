import type { Tour } from "../tour.types";

/**
 * La démo — une demande au club de bout en bout : un membre l'écrit, un administrateur la prend
 * en charge et y répond (la réponse part par e-mail, dans Mailpit), puis Sam, du support, voit
 * ce que voit un bénévole qui n'est pas administrateur.
 */
const SUBJECT = "Un cours d'essai pour un ami";

export const demoDemandesEcrire: Tour = {
  id: "demo.demandes.ecrire",
  title: "Écrire au club",
  description: "Un membre écrit au club par le formulaire de contact, et reçoit la référence de sa demande.",
  audience: "member",
  routes: ["/contacts"],
  startRoute: "/contacts",
  doc: "/docs/dev/membres/demandes",
  demoOnly: true,
  steps: [
    {
      target: "contact.form.category",
      targetText: "Gestion du club",
      title: "À qui écrivez-vous ?",
      body: "Chaque catégorie arrive à un groupe différent : la gestion du club aux administrateurs, le support du site à ses bénévoles. Choisissez « Gestion du club ».",
      advance: { kind: "click" },
    },
    {
      target: "contact.form.subject",
      title: "L'objet",
      body: "Une ligne, reprise dans la liste des demandes et dans les e-mails.",
      advance: { kind: "input" },
      expect: SUBJECT,
    },
    {
      target: "contact.form.body",
      title: "Le message",
      body: "Ce que vous demandez au club.",
      advance: { kind: "input" },
      expect: "Bonjour, un ami voudrait essayer le cours du jeudi soir. Est-ce possible ?",
    },
    {
      target: "contact.form.submit",
      title: "Envoyer",
      body: "La demande est enregistrée, et un accusé de réception part par e-mail.",
      advance: { kind: "click" },
    },
    {
      target: "contact.sent",
      title: "Envoyée",
      body: "Sa référence, et la date à laquelle le club s'engage à répondre. L'accusé de réception est dans Mailpit.",
      advance: { kind: "next" },
    },
  ],
};

export const demoDemandesTraiter: Tour = {
  id: "demo.demandes.traiter",
  title: "Traiter une demande",
  description: "Retrouver la demande dans la liste, la prendre en charge, y répondre, constater qu'elle est répondue.",
  audience: "admin",
  routes: [/^\/dashboard\/tickets/],
  startRoute: "/dashboard/tickets",
  doc: "/docs/dev/membres/demandes",
  demoOnly: true,
  steps: [
    {
      target: "tickets.list",
      targetText: "Changer de créneau le jeudi",
      title: "Une demande en retard",
      body: "Son échéance est passée sans réponse : elle s'affiche en rouge, et le compteur en haut de la page le signale.",
      advance: { kind: "next" },
    },
    {
      target: "tickets.list",
      targetText: SUBJECT,
      targetPick: "a",
      title: "La vôtre",
      body: "La demande que le membre vient d'écrire. Ouvrez-la.",
      advance: { kind: "click" },
    },
    {
      target: "tickets.take",
      title: "Prendre en charge",
      body: "Elle est à vous : les autres administrateurs voient qui s'en occupe.",
      advance: { kind: "click" },
    },
    {
      target: "tickets.reply.body",
      title: "La réponse",
      body: "La formule d'appel est déjà là. Écrivez la suite : elle partira par e-mail depuis l'adresse du site, signée de votre nom.",
      advance: { kind: "input", validate: (v) => v.includes("samedi") },
      expect: "Avec plaisir : qu'il vienne samedi matin, le premier cours est offert.",
    },
    {
      target: "tickets.reply.send",
      title: "Envoyer la réponse",
      body: "La réponse part, et la demande passe « répondue ».",
      advance: { kind: "click" },
    },
    {
      target: "tickets.status",
      title: "Répondue",
      body: "Le statut a changé. L'e-mail reçu par le membre est dans Mailpit (lien dans le panneau de la démo).",
      advance: { kind: "next" },
    },
    {
      target: "tickets.back",
      title: "Retour aux demandes",
      body: "Vérifions dans la liste.",
      advance: { kind: "click" },
    },
    {
      target: "tickets.list",
      targetText: SUBJECT,
      title: "Dans la liste",
      body: "La demande y est « répondue », à votre nom.",
      advance: { kind: "next" },
    },
  ],
};

export const demoDemandesSupport: Tour = {
  id: "demo.demandes.support",
  title: "Les demandes vues par le support",
  description: "Ce que voit un bénévole du support, qui n'est pas administrateur.",
  audience: "member",
  routes: [/^\/dashboard\/tickets/],
  startRoute: "/dashboard/tickets",
  doc: "/docs/dev/membres/demandes",
  demoOnly: true,
  steps: [
    {
      target: "tickets.list",
      title: "Seulement le support",
      body: "Sam n'est pas administrateur : il ne voit que les demandes de la catégorie « Support du site », celles de son groupe. La demande sur le cours d'essai n'y est pas.",
      advance: { kind: "next" },
    },
    {
      target: "tickets.list",
      targetText: "Impossible d'ajouter une photo",
      title: "Celle qu'il a prise en charge",
      body: "Elle est à son nom, en cours.",
      advance: { kind: "next" },
    },
  ],
};
