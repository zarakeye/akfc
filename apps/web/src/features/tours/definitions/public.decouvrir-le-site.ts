import type { Tour } from "../tour.types";

/**
 * Découvrir le site (public) — le tour d'horizon de la page d'accueil.
 * Fiche de doc associée : même identifiant, « public.decouvrir-le-site ».
 * Rien n'est cliqué ni envoyé : quatre bulles « Suivant ».
 */
export const publicDecouvrirLeSite: Tour = {
  id: "public.decouvrir-le-site",
  title: "Découvrir le site",
  description: "Faire le tour de l'en-tête : les rubriques du site et l'accès à votre compte.",
  audience: "public",
  routes: ["/"],
  startRoute: "/",
  steps: [
    {
      title: "Bienvenue",
      body: "Ce petit tour montre où trouver chaque chose. Il ne clique rien à votre place : passez d'une bulle à l'autre avec « Suivant », ou quittez avec Échap.",
      advance: { kind: "next" },
    },
    {
      target: "header.nav",
      title: "Les rubriques du site",
      body: "Le menu mène aux pages du club : nos disciplines, les galeries, l'agenda, l'association, les contacts et l'aide. Sur un petit écran, il est replié dans ce bouton.",
      advance: { kind: "next" },
    },
    {
      target: "header.account",
      title: "Votre compte",
      body: "Ici, vous vous connectez. Une fois connecté, votre menu (cliquez sur votre prénom) mène à votre profil et à vos documents, et les cloches signalent les nouveautés. Les administrateurs y trouvent aussi le tableau de bord.",
      advance: { kind: "next" },
    },
    {
      title: "Besoin d'aide plus tard ?",
      body: "Le bouton « ? » en bas à gauche de l'écran propose les tutos de la page où vous êtes. Ils changent d'une page à l'autre.",
      advance: { kind: "next" },
    },
  ],
};
