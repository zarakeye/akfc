import type { Tour, TourSkip } from "../tour.types";

/**
 * La démo — le droit à l'image, de bout en bout : l'administrateur tague le membre sur une photo et
 * relance une adhérente qui n'a pas répondu ; le membre refuse la photo ; l'administrateur la
 * retrouve masquée. Les photos sont celles de la galerie « Démo du droit à l'image », aux noms
 * connus d'avance (prisma/seed.sandbox.decor.mjs, seedDroitImageDecor).
 *
 * Un parcours se rejoue : la photo déjà taguée, la relance déjà partie, le refus déjà donné
 * effacent les étapes qui les faisaient (`skipWhen`).
 */
const GALLERY = "Démo du droit à l'image";
const TO_TAG = "droit-image-a-taguer";
const NO_ANSWER = "droit-image-sans-reponse";
const MEMBER = "Membre Démo";

/** La photo a quitté « À taguer » : la liste est chargée (son en-tête, ou « rien ») et elle n'y est plus. */
const tagged: TourSkip[] = [
  { target: "droit-image.list", text: "Fichier", without: TO_TAG },
  { target: "droit-image.list", text: "Rien dans cette liste" },
];

export const demoDroitsTaguer: Tour = {
  id: "demo.droits.taguer",
  title: "Taguer une personne sur une photo",
  description: "Indiquer qui est sur une photo en ligne, et voir le verdict avant d'enregistrer.",
  audience: "admin",
  routes: ["/dashboard/droit-image"],
  startRoute: "/dashboard/droit-image",
  doc: "/docs/dev/legal/tags-de-personnes",
  demoOnly: true,
  steps: [
    {
      target: "droit-image.tabs",
      title: "Trois listes",
      body: "Les photos montrées sur le site public qui demandent une action : masquées (une personne a refusé), en attente (une personne n'a pas répondu), à taguer (personne n'est indiqué). Les photos en règle n'y sont pas.",
      advance: { kind: "next" },
    },
    {
      target: "droit-image.tabs",
      targetText: "À taguer",
      title: "À taguer",
      body: "Tant que personne n'est tagué, le droit à l'image n'agit pas sur la photo.",
      advance: { kind: "click" },
    },
    {
      target: "droit-image.list",
      targetText: TO_TAG,
      targetPick: "button",
      title: "La fenêtre des tags",
      body: "Un clic sur la vignette ouvre la liste des membres, chacun avec l'état de son droit à l'image.",
      advance: { kind: "click" },
      skipWhen: tagged,
    },
    {
      target: "tags.search",
      title: "Cherchez le membre",
      body: "Par son nom ou son adresse.",
      advance: { kind: "input" },
      expect: "Membre",
      skipWhen: tagged,
    },
    {
      target: "tags.members",
      targetText: MEMBER,
      title: "Cochez-le",
      body: "Ses pastilles disent, usage par usage (espace membres, site public, réseaux, imprimés), ce qu'il a autorisé.",
      advance: { kind: "click" },
      skipWhen: tagged,
    },
    {
      target: "tags.verdict",
      title: "Le verdict, avant d'enregistrer",
      body: "Il se recalcule à chaque case cochée : on voit ce que deviendra la photo. Des « ? » : le membre n'a pas encore répondu, la photo reste en ligne en attendant son autorisation. Tout en vert : elle est en règle.",
      advance: { kind: "next" },
      skipWhen: tagged,
    },
    {
      target: "tags.save",
      title: "Enregistrez",
      body: "Le tag est posé. Le membre retrouvera la photo dans « Où j'apparais ».",
      advance: { kind: "click" },
      skipWhen: tagged,
    },
    {
      target: "droit-image.tabs",
      title: "Elle a quitté « À taguer »",
      body: "La liste se relit à la fermeture de la fenêtre : la photo est passée « En attente » tant que le membre n'a pas répondu (ou a disparu des listes s'il a déjà tout autorisé).",
      advance: { kind: "next" },
    },
  ],
};

export const demoDroitsRelancer: Tour = {
  id: "demo.droits.relancer",
  title: "Relancer une personne sans réponse",
  description: "Envoyer une relance de droit à l'image à une personne taguée qui n'a pas répondu.",
  audience: "admin",
  routes: ["/dashboard/droit-image"],
  startRoute: "/dashboard/droit-image",
  doc: "/docs/dev/legal/tags-de-personnes",
  demoOnly: true,
  steps: [
    {
      target: "droit-image.tabs",
      targetText: "En attente",
      title: "En attente",
      body: "Une personne taguée n'a pas répondu : la photo reste en ligne, mais il faut lui demander.",
      advance: { kind: "click" },
    },
    {
      target: "droit-image.list",
      targetText: NO_ANSWER,
      targetPick: "button",
      title: "Ouvrez la photo",
      body: "Camille y est taguée ; elle n'a jamais rempli son autorisation.",
      advance: { kind: "click" },
    },
    {
      target: "tags.tagged",
      targetText: "Camille",
      targetPick: "button",
      title: "Relancez-la",
      body: "Un e-mail lui demande de donner son autorisation. Une relance au plus tous les sept jours.",
      advance: { kind: "click" },
      skipWhen: { target: "tags.tagged", text: "Relancé le" },
    },
    {
      target: "tags.notice",
      title: "Envoyée",
      body: "L'adresse est masquée à l'écran. Dans la sandbox, l'e-mail arrive dans Mailpit.",
      advance: { kind: "next" },
      optional: true,
    },
    {
      target: "tags.close",
      title: "Fermez",
      body: "La date de la relance reste affichée en face de son nom.",
      advance: { kind: "click" },
    },
  ],
};

export const demoDroitsRefuser: Tour = {
  id: "demo.droits.refuser",
  title: "Refuser une photo",
  description: "Le membre retrouve les photos où il est tagué, et en refuse une.",
  audience: "member",
  routes: ["/profil/ou-j-apparais"],
  startRoute: "/profil/ou-j-apparais",
  doc: "/docs/dev/legal/tags-de-personnes",
  demoOnly: true,
  steps: [
    {
      target: "appearances.list",
      targetText: GALLERY,
      title: "Où j'apparais",
      body: "Les photos où le membre a été tagué, et où elles sont montrées : la voici, dans la galerie publique.",
      advance: { kind: "next" },
    },
    {
      target: "appearances.list",
      targetText: GALLERY,
      targetPick: "button",
      title: "Refusez-la",
      body: "Elle ne sera plus diffusée hors du club, quelle que soit son autorisation pour les autres photos.",
      advance: { kind: "click" },
      skipWhen: { target: "appearances.list", text: "Vous avez refusé cette photo" },
    },
    {
      target: "appearances.list",
      targetText: GALLERY,
      title: "Refusée",
      body: "Elle est masquée sur le site public. Le refus s'annule du même bouton.",
      advance: { kind: "next" },
    },
  ],
};

export const demoDroitsMasques: Tour = {
  id: "demo.droits.masques",
  title: "La photo refusée, côté club",
  description: "Retrouver la photo refusée parmi les médias masqués.",
  audience: "admin",
  routes: ["/dashboard/droit-image"],
  startRoute: "/dashboard/droit-image",
  doc: "/docs/dev/legal/tags-de-personnes",
  demoOnly: true,
  steps: [
    {
      target: "droit-image.tabs",
      targetText: "Masqués",
      title: "Masqués",
      body: "Une personne taguée a refusé : le média est déjà caché en ligne.",
      advance: { kind: "click" },
    },
    {
      target: "droit-image.list",
      targetText: TO_TAG,
      title: "La voilà",
      body: "« Montré sur » mène à la galerie : on y retire la photo, ou le tag si la personne n'y est pas.",
      advance: { kind: "next" },
    },
  ],
};
