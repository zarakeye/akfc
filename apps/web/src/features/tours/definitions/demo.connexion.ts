import type { Tour } from "../tour.types";

/**
 * La démo — changer de compte comme un vrai visiteur : se déconnecter (si l'on est connecté),
 * puis se connecter par le formulaire de l'en-tête. Tuto guidé, lancé par le panneau de la démo.
 */
function connexion(id: string, title: string, email: string, who: string): Tour {
  return {
    id,
    title,
    description: `Se déconnecter, puis se connecter avec le compte ${who} de la démo.`,
    audience: "public",
    routes: ["/"],
    startRoute: "/",
    doc: "/docs/dev/auth/se-connecter",
    demoOnly: true,
    steps: [
      {
        target: "header.user-menu",
        title: "Le menu du compte",
        body: "Vous êtes connecté sous un autre compte. Ouvrez son menu, en haut à droite.",
        advance: { kind: "click" },
        optional: true,
      },
      {
        target: "header.logout",
        title: "Se déconnecter",
        body: "Tout en bas du menu.",
        advance: { kind: "click" },
        optional: true,
      },
      {
        target: "auth.login.email",
        title: "L'adresse",
        body: `Le compte ${who} de la démo.`,
        advance: { kind: "input" },
        expect: email,
      },
      {
        target: "auth.login.password",
        title: "Le mot de passe",
        body: "Le même pour tous les comptes de la démo.",
        advance: { kind: "input" },
        expect: "sandbox-demo",
      },
      {
        target: "auth.login.submit",
        title: "Se connecter",
        body: "Le site vérifie le mot de passe, puis pose le cookie de session.",
        advance: { kind: "click" },
      },
      {
        target: "header.user-menu",
        title: "Connecté",
        body: `Vous voilà ${who}. Le menu du compte a remplacé le formulaire.`,
        advance: { kind: "next" },
      },
    ],
  };
}

export const demoConnexionAdmin = connexion("demo.connexion.admin", "Se connecter en administrateur", "admin@sandbox.local", "administrateur");
export const demoConnexionMembre = connexion("demo.connexion.membre", "Se connecter en membre", "membre@sandbox.local", "membre majeur");
