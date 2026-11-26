import type { Tour } from "../tour.types";

/**
 * La démo — la vie d'un membre majeur : son profil, son droit à l'image donné en ligne, les photos
 * où il apparaît. Rejoué, le tuto du droit à l'image refait les mêmes choix (« Modifier mes choix ») :
 * un nouveau document signé remplace le précédent, rien ne se bloque.
 */
const PASSWORD = "sandbox-demo";

export const demoMembreProfil: Tour = {
  id: "demo.membre.profil",
  title: "Son profil",
  description: "Le profil d'un membre : son droit à l'image, ses données, sa photo de profil.",
  audience: "member",
  routes: ["/profil", "/profil/edit"],
  startRoute: "/profil",
  doc: "/docs/dev/membres/profil-et-premiere-connexion",
  demoOnly: true,
  steps: [
    {
      target: "profil.image-consent",
      title: "Son droit à l'image",
      body: "Où il en est, usage par usage, et le lien vers la page où le donner.",
      advance: { kind: "next" },
    },
    {
      target: "profil.export",
      title: "Ses données",
      body: "Tout ce que le site conserve à son sujet se télécharge d'un clic (droit d'accès du RGPD).",
      advance: { kind: "next" },
    },
    {
      target: "profil.edit",
      title: "Modifier le profil",
      body: "Cliquez sur « Modifier ».",
      advance: { kind: "click" },
    },
    {
      target: "profil.form.avatar",
      title: "La photo de profil",
      body: "Un fichier, la caméra, ou une image glissée ici ; puis le recadrage, rond ou carré. Rien n'est envoyé avant la validation (✓) : la photo s'enregistre seule, sans le bouton du formulaire.",
      advance: { kind: "next" },
    },
    {
      target: "profil.form.submit",
      title: "Le reste du profil",
      body: "Les autres champs s'enregistrent ici, une fois modifiés.",
      advance: { kind: "next" },
    },
  ],
};

export const demoMembreConsentement: Tour = {
  id: "demo.membre.consentement",
  title: "Donner son droit à l'image",
  description: "Choisir, usage par usage, puis signer de son mot de passe.",
  audience: "member",
  routes: ["/profil/droit-a-l-image"],
  startRoute: "/profil/droit-a-l-image",
  doc: "/docs/dev/legal/consentement-en-ligne",
  demoOnly: true,
  steps: [
    {
      target: "consent.open",
      title: "Le formulaire en ligne",
      body: "Le même contenu que le formulaire papier du club. Ouvrez-le.",
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
      body: "Les autres usages (réseaux, imprimés, presse) restent à « Non » : l'autorisation se donne usage par usage.",
      advance: { kind: "click" },
    },
    {
      target: "consent.password",
      title: "Signez",
      body: "Le mot de passe du compte vaut signature.",
      advance: { kind: "input" },
      expect: PASSWORD,
    },
    {
      target: "consent.submit",
      title: "Confirmez",
      body: "Le document signé (un PDF) est généré à partir de vos réponses.",
      advance: { kind: "click" },
    },
    {
      target: "consent.saved",
      title: "Enregistré",
      body: "Le document signé est rangé avec vos formulaires, plus bas ; le club en reçoit un avis.",
      advance: { kind: "next" },
    },
  ],
};

export const demoMembreApparais: Tour = {
  id: "demo.membre.apparais",
  title: "Où j'apparais",
  description: "Les photos où le club a identifié le membre, et ce qui en est montré.",
  audience: "member",
  routes: ["/profil/ou-j-apparais"],
  startRoute: "/profil/ou-j-apparais",
  doc: "/docs/dev/legal/tags-de-personnes",
  demoOnly: true,
  steps: [
    {
      target: "appearances.consent",
      title: "Vos choix",
      body: "Ceux que vous venez de donner, usage par usage : ils décident de ce qui est montré.",
      advance: { kind: "next" },
    },
    {
      target: "appearances.list",
      title: "Vos photos",
      body: "Celles où le club vous a identifié, et où elles sont montrées. Une photo ne vous plaît pas : refusez-la, elle ne sera plus diffusée hors du club.",
      advance: { kind: "next" },
      optional: true,
    },
  ],
};
