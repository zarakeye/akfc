import type { Tour } from "../tour.types";

/**
 * Restaurer un élément de la corbeille (admin) — trouver la corbeille, lire ses colonnes, montrer
 * « Restaurer » sans rien restaurer. Fiche de doc associée : « /docs/admin/la-corbeille ».
 * L'arbre n'existe que sur un écran large, et la barre de sélection qu'après une sélection :
 * étapes facultatives.
 */
export const adminCorbeilleRestaurer: Tour = {
  id: "admin.corbeille.restaurer",
  title: "Restaurer un élément de la corbeille",
  description: "Retrouver un élément jeté, voir quand il sera effacé, et le remettre à sa place.",
  audience: "admin",
  routes: ["/dashboard/library"],
  startRoute: "/dashboard/library",
  doc: "/docs/admin/la-corbeille",
  steps: [
    {
      target: "finder.bin",
      title: "Ouvrez la corbeille",
      body: "Elle est dans l'arborescence, sous le nom « bin ». Cliquez dessus.",
      advance: { kind: "click" },
      optional: true,
    },
    {
      target: "bin.view",
      title: "Ce qui a été jeté",
      body: "Chaque élément garde son nom et son chemin d'origine. En affichage Tableau, les colonnes disent qui l'a jeté, quand, et quand il sera effacé pour de bon (« Effacé le », en rouge à moins de sept jours) ; en grille, c'est au survol.",
      advance: { kind: "next" },
      optional: true,
    },
    {
      target: "bin.view",
      title: "Sélectionnez un élément",
      body: "Cliquez sur un élément de la liste pour le sélectionner.",
      advance: { kind: "click" },
      optional: true,
    },
    {
      target: "bin.restore",
      title: "Restaurer",
      body: "Ce bouton remet la sélection à son chemin d'origine. Si un autre fichier a pris sa place, rien n'est écrasé : l'élément restauré reçoit un nom suffixé. Pendant le tuto, rien n'est restauré.",
      advance: { kind: "next" },
      optional: true,
    },
    {
      title: "90 jours, puis effacé",
      body: "Un élément jeté est effacé définitivement au bout de 90 jours, la nuit ; la cloche prévient sept jours avant. La durée se règle dans les Réglages, partie Informations légales. Les éditeurs d'un groupe restaurent aussi ce qui a été jeté dans leur espace, depuis « Mes espaces ».",
      advance: { kind: "next" },
    },
  ],
};
