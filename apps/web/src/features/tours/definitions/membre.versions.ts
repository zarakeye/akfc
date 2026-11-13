import type { Tour } from "../tour.types";

/**
 * Retrouver une version précédente (membre) — dans « Mes espaces », ouvrir un fichier et son
 * panneau « Versions ». Fiche de doc associée : « /docs/guide/mes-espaces ».
 * L'aperçu n'existe que sur un écran large, et le panneau qu'avec un fichier sélectionné :
 * étapes facultatives. Rien n'est restauré pendant le tuto.
 */
export const membreVersions: Tour = {
  id: "membre.versions",
  title: "Retrouver une version précédente",
  description: "Ouvrir les versions d'un fichier de vos espaces, en télécharger une, la remettre en place.",
  audience: "member",
  routes: ["/mes-espaces"],
  startRoute: "/mes-espaces",
  doc: "/docs/guide/mes-espaces",
  steps: [
    {
      target: "finder.content",
      title: "Ouvrez un espace",
      body: "Cliquez sur l'un de vos espaces pour l'ouvrir.",
      advance: { kind: "click" },
    },
    {
      target: "finder.content",
      title: "Choisissez un fichier",
      body: "Cliquez sur un fichier pour le sélectionner.",
      advance: { kind: "click" },
    },
    {
      target: "finder.preview",
      title: "L'aperçu",
      body: "Le fichier sélectionné s'affiche ici, avec ses informations.",
      advance: { kind: "next" },
      optional: true,
    },
    {
      target: "finder.versions",
      title: "Ouvrez « Versions »",
      body: "Cliquez pour voir la version actuelle et les anciennes.",
      advance: { kind: "click" },
      optional: true,
    },
    {
      target: "finder.versions",
      title: "Les anciennes versions",
      body: "Chaque fois que le fichier a été remplacé, l'ancien a été gardé : sa date, qui l'avait déposé. « Télécharger » l'enregistre sur votre appareil ; si vous êtes éditeur, « Restaurer… » le remet en place, et l'actuel devient à son tour une version.",
      advance: { kind: "next" },
      optional: true,
    },
    {
      title: "Dix versions, un an",
      body: "Le site garde les dix dernières versions de chaque fichier, pendant un an au plus. Pour en créer une, déposez un fichier du même nom et choisissez « Remplacer ».",
      advance: { kind: "next" },
    },
  ],
};
