import type { Tour } from "../tour.types";

/**
 * Créer un flash info (admin) — un message court du ruban, en BROUILLON.
 * Fiche de doc associée : même identifiant, « admin.breaking-news.create ».
 * La date de publication reste vide : rien n'est publié.
 */
export const adminBreakingNewsCreate: Tour = {
  id: "admin.breaking-news.create",
  title: "Créer un flash info",
  description: "Rédiger un message court pour le ruban du site, et l'enregistrer en brouillon.",
  audience: "admin",
  routes: ["/dashboard/breaking-news", "/dashboard/breaking-news/create"],
  startRoute: "/dashboard/breaking-news",
  steps: [
    {
      target: "breaking-news.list.create",
      title: "Ouvrez le formulaire",
      body: "Les flashs info défilent dans le ruban, sous l'en-tête de toutes les pages publiques. Cliquez sur « Créer un flash info ».",
      advance: { kind: "click" },
    },
    {
      target: "breaking-news.form.title",
      title: "Un titre",
      body: "Pour cet essai, tapez « Exemple (tuto) » : vous pourrez supprimer le flash info ensuite.",
      advance: { kind: "input", validate: (v) => v.trim().length > 0 },
    },
    {
      target: "breaking-news.form.body",
      title: "Un texte court",
      body: "600 caractères au plus. Le titre et le texte sont obligatoires.",
      advance: { kind: "input", validate: (v) => v.trim().length > 0 },
    },
    {
      target: "breaking-news.form.publicationDate",
      title: "Laissez la date vide",
      body: "Sans date, le flash info reste un brouillon invisible du public. Une date passée le publie, une date future programme sa publication.",
      advance: { kind: "next" },
    },
    {
      target: "breaking-news.form.expiresAt",
      title: "Une échéance, si besoin",
      body: "Passée cette date, le flash info quitte le ruban de lui-même. Vide : il reste jusqu'à ce qu'on le retire.",
      advance: { kind: "next" },
    },
    {
      target: "breaking-news.form.submit",
      title: "Enregistrez",
      body: "Cliquez sur « Créer ». Le flash info est enregistré en brouillon et la liste s'affiche.",
      advance: { kind: "route", match: "/dashboard/breaking-news" },
    },
    {
      title: "C'est fait",
      body: "Votre flash info est dans la liste, au statut « Brouillon ». Pour le publier, cliquez sur sa ligne et donnez-lui une date. S'il ne s'agissait que d'un essai, supprimez-le (colonne de droite).",
      advance: { kind: "next" },
    },
  ],
};
