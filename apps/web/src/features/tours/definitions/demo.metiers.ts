import type { Tour, TourStep } from "../tour.types";

/**
 * La démo — des fonctions au code, pour les parcours par métier. Un formulaire qui refuse une
 * valeur, puis se corrige ; le refus que la procédure oppose à Sam ; et, dans la doc, la lecture
 * guidée d'un extrait de code (le composant CodeWalkthrough) : on clique ses étapes, le code
 * suit.
 */

/** Un passage choisi dans la lecture guidée d'un fichier : son titre d'étape, ce qu'on y voit. */
type Passage = { step: string; body: string };

/**
 * Un tuto dans la doc : la lecture guidée d'un extrait, quelques étapes cliquées. Le code visé
 * est celui dont l'en-tête montre l'étape cliquée : une page peut compter plusieurs lectures.
 */
function lectureDuCode(
  id: string,
  title: string,
  route: string,
  intro: string,
  passages: Passage[],
): Tour {
  const steps: TourStep[] = [
    {
      target: "doc.walkthrough.steps",
      targetText: passages[0].step,
      title: "Une lecture guidée",
      body: intro,
      advance: { kind: "next" },
    },
  ];
  for (const p of passages) {
    steps.push(
      {
        target: "doc.walkthrough.steps",
        targetText: p.step,
        title: p.step,
        body: "Cliquez cette étape : le code s'y place.",
        advance: { kind: "click" },
      },
      {
        target: "doc.walkthrough.code",
        targetText: p.step,
        title: p.step,
        body: p.body,
        advance: { kind: "next" },
      },
    );
  }
  return {
    id,
    title,
    description: "Une lecture guidée du code, dans la doc des développeurs.",
    audience: "public",
    routes: [route],
    startRoute: route,
    doc: route,
    demoOnly: true,
    steps,
  };
}

export const demoFrontFormulaire: Tour = {
  id: "demo.front.formulaire",
  title: "Un formulaire qui refuse, puis accepte",
  description: "Une erreur sous le champ, sa correction, l'enregistrement.",
  audience: "member",
  routes: ["/profil/edit"],
  startRoute: "/profil/edit",
  doc: "/docs/dev/formulaires/le-modele-hybride-face-au-reel",
  demoOnly: true,
  steps: [
    {
      target: "profil.form.phone",
      title: "Un numéro faux, exprès",
      body: "Videz le champ s'il est rempli, puis tapez un numéro trop court.",
      advance: { kind: "input" },
      expect: "123",
    },
    {
      target: "profil.form.submit",
      title: "Enregistrez",
      body: "React Hook Form valide d'abord, dans le navigateur, avec le schéma Zod du formulaire.",
      advance: { kind: "click" },
    },
    {
      target: "profil.form.phone",
      title: "L'erreur, sous son champ",
      body: "Rien n'est parti au serveur. Le même schéma (un contrat partagé) le revalide côté serveur : sans JavaScript, la server action renvoie la même erreur, au même endroit.",
      advance: { kind: "next" },
    },
    {
      target: "profil.form.phone",
      title: "Corrigez",
      body: "Un numéro à dix chiffres.",
      advance: { kind: "input" },
      expect: "0612345678",
    },
    {
      target: "profil.form.submit",
      title: "Enregistrez",
      body: "Cette fois, la server action reçoit le formulaire (useActionState), le revalide et enregistre.",
      advance: { kind: "click" },
    },
    {
      target: "profil.form.submit",
      title: "Enregistré",
      body: "Le formulaire se resynchronise sur ce que le serveur a enregistré. La suite : son code, dans la doc.",
      advance: { kind: "next" },
    },
  ],
};

export const demoCodeFormulaire = lectureDuCode(
  "demo.code.formulaire",
  "Le code du formulaire",
  "/docs/dev/formulaires/le-modele-hybride-face-au-reel",
  "Le composant du formulaire « Mon profil », commenté étape par étape : à gauche les étapes, à droite le fichier.",
  [
    {
      step: "Réinjecter les erreurs du serveur",
      body: "Les erreurs que renvoie la server action rejoignent React Hook Form, champ par champ : elles s'affichent comme celles du navigateur.",
    },
    {
      step: "Le form appelle formAction",
      body: "Le formulaire garde son action : avec JavaScript, React Hook Form valide puis la déclenche ; sans, le navigateur l'envoie tel quel.",
    },
  ],
);

export const demoSupportRefus: Tour = {
  id: "demo.support.refus",
  title: "Refusé par la procédure",
  description: "Sam, bénévole non administrateur, ouvre la bibliothèque.",
  audience: "member",
  routes: ["/dashboard/library"],
  startRoute: "/dashboard/library",
  doc: "/docs/dev/api/proteger-une-procedure",
  demoOnly: true,
  steps: [
    {
      target: "dashboard.sidebar",
      title: "Le panneau de Sam",
      body: "Il ne propose que ce que Sam peut faire : les demandes de son groupe.",
      advance: { kind: "next" },
    },
    {
      target: "finder.error",
      title: "Refusé",
      body: "La page s'ouvre : son adresse n'est pas un secret. Mais la procédure qui liste les dossiers vérifie le droit, et répond FORBIDDEN. La sécurité tient au serveur, pas au menu.",
      advance: { kind: "next" },
    },
  ],
};

export const demoCodeGarde = lectureDuCode(
  "demo.code.garde",
  "Le code de la garde",
  "/docs/dev/api/proteger-une-procedure",
  "La garde d'administration, un middleware tRPC, commentée étape par étape.",
  [
    {
      step: "Deux vérifications, deux codes",
      body: "Pas de session : UNAUTHORIZED. Une session sans le droit : FORBIDDEN, la réponse qu'a reçue Sam.",
    },
    {
      step: "next() : la procédure peut s’exécuter",
      body: "Seulement après les deux vérifications : la procédure ne s'écrit jamais sans sa garde.",
    },
  ],
);
