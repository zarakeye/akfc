import type { Tour } from "../tour.types";

/**
 * La démo — le droit à l'image d'un mineur : il indique ses souhaits, le lien part à son parent
 * (sans compte, par e-mail : Mailpit dans la démo), le parent décide et valide. Le tuto du parent
 * se lance sur la page du lien, dont l'adresse change à chaque envoi (`here` dans le panneau).
 * Un lien ne sert qu'une fois : pour rejouer, le mineur renvoie ses souhaits.
 */
export const demoMineurSouhaits: Tour = {
  id: "demo.mineur.souhaits",
  title: "Indiquer ses souhaits",
  description: "Le mineur choisit, usage par usage ; le lien part à son parent.",
  audience: "member",
  routes: ["/profil/droit-a-l-image"],
  startRoute: "/profil/droit-a-l-image",
  doc: "/docs/dev/legal/consentement-en-ligne",
  demoOnly: true,
  steps: [
    {
      target: "consent.wishes.open",
      title: "Ses souhaits",
      body: "Mineur, il ne signe pas : il indique ce qu'il souhaite, son parent décide.",
      advance: { kind: "click" },
    },
    {
      target: "consent.choices",
      targetText: "Espace membres",
      targetPick: "input[value='yes']",
      title: "L'espace membres : oui",
      body: "Les photos visibles des seuls membres connectés.",
      advance: { kind: "click" },
    },
    {
      target: "consent.choices",
      targetText: "Site public",
      targetPick: "input[value='yes']",
      title: "Le site public : oui",
      body: "Il le souhaite ; son parent pourra en décider autrement.",
      advance: { kind: "click" },
    },
    {
      target: "consent.wishes.send",
      title: "Envoyez à votre parent",
      body: "Un e-mail part à l'adresse que le club a enregistrée pour lui, avec un lien personnel, valable 7 jours.",
      advance: { kind: "click" },
    },
    {
      target: "consent.pending",
      title: "En attente du parent",
      body: "L'adresse est masquée. Tant qu'il n'a pas validé, les souhaits se modifient et le lien se renvoie. Dans la démo, l'e-mail est dans Mailpit.",
      advance: { kind: "next" },
    },
  ],
};

export const demoMineurParent: Tour = {
  id: "demo.mineur.parent",
  title: "Le parent décide",
  description: "Sur la page de son lien, le parent modifie les souhaits s'il le veut, puis valide.",
  audience: "public",
  routes: [/^\/autorisation-parent\//],
  startRoute: "/",
  doc: "/docs/dev/legal/consentement-en-ligne",
  demoOnly: true,
  steps: [
    {
      target: "guardian.choices",
      title: "Les souhaits de l'enfant",
      body: "Pré-cochés : ce que le mineur a indiqué. C'est le parent qui décide.",
      advance: { kind: "next" },
    },
    {
      target: "guardian.choices",
      targetText: "Site public",
      targetPick: "input[value='no']",
      title: "Le site public : non",
      body: "Le parent revient sur un souhait. Le club et l'enfant verront ce qui a changé.",
      advance: { kind: "click" },
    },
    {
      target: "guardian.birthdate",
      title: "La date de naissance",
      body: "Facultative : avec elle, l'enfant passera majeur de lui-même à ses 18 ans.",
      advance: { kind: "next" },
    },
    {
      target: "guardian.legal",
      title: "Représentant légal",
      body: "Le parent atteste qu'il l'est : cette case vaut signature.",
      advance: { kind: "click" },
    },
    {
      target: "guardian.submit",
      title: "Validez",
      body: "Le document signé est généré ; le lien ne servira plus.",
      advance: { kind: "click" },
    },
    {
      target: "guardian.done",
      title: "Enregistré",
      body: "Ce qui a changé par rapport aux souhaits de l'enfant est rappelé ; le club et l'enfant en sont informés.",
      advance: { kind: "next" },
    },
  ],
};

export const demoMineurResultat: Tour = {
  id: "demo.mineur.resultat",
  title: "L'autorisation du mineur",
  description: "Côté mineur : l'autorisation donnée par son parent.",
  audience: "member",
  routes: ["/profil/droit-a-l-image"],
  startRoute: "/profil/droit-a-l-image",
  doc: "/docs/dev/legal/consentement-en-ligne",
  demoOnly: true,
  steps: [
    {
      target: "consent.summary",
      title: "Enregistrée",
      body: "Usage par usage, ce que son parent a décidé ; le document signé est rangé avec ses formulaires.",
      advance: { kind: "next" },
    },
  ],
};
