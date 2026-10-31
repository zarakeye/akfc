import type { Tour } from "../tour.types";

/**
 * Mes documents (membre) — la liste, puis la lecture d'un document.
 * Fiche de doc associée : même identifiant, « membre.documents ».
 * Les étapes sur un document sont FACULTATIVES : un membre peut n'en avoir aucun.
 */
export const membreDocuments: Tour = {
  id: "membre.documents",
  title: "Mes documents",
  description: "Trouver les documents du club, de vos groupes et les vôtres, et les lire.",
  audience: "member",
  routes: ["/documents"],
  startRoute: "/documents",
  doc: "/docs/guide/mes-documents",
  steps: [
    {
      target: "documents.list",
      title: "Vos documents",
      body: "Trois familles : ceux du club (pour tous les membres), ceux de vos groupes, et ceux qui ne concernent que vous.",
      advance: { kind: "next" },
    },
    {
      target: "documents.item",
      title: "Ouvrez un document",
      body: "Cliquez sur un document pour le lire.",
      advance: { kind: "click" },
      optional: true,
    },
    {
      target: "documents.reader.read",
      title: "Lu ou non lu",
      body: "Ouvrir un document le marque comme lu : le badge « Nouveau » disparaît de la liste. Ce bouton le remet en non lu, pour y revenir plus tard.",
      advance: { kind: "next" },
      optional: true,
    },
    {
      target: "documents.reader.download",
      title: "Téléchargez-le",
      body: "Pour le garder ou l'imprimer.",
      advance: { kind: "next" },
      optional: true,
    },
    {
      title: "C'est tout",
      body: "Quand le club publie un nouveau document qui vous concerne, il apparaît ici avec le badge « Nouveau ».",
      advance: { kind: "next" },
    },
  ],
};
