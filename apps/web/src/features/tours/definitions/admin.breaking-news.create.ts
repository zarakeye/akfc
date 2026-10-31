import type { Tour } from "../tour.types";

/**
 * Créer une actualité (admin) — un message court du ruban, en BROUILLON.
 * Fiche de doc associée : même identifiant, « admin.breaking-news.create ».
 * La date de publication reste vide : rien n'est publié.
 */
export const adminBreakingNewsCreate: Tour = {
  id: "admin.breaking-news.create",
  title: "Créer une actualité",
  description: "Rédiger un message court pour le ruban du site, et l'enregistrer en brouillon.",
  audience: "admin",
  routes: ["/dashboard/breaking-news", "/dashboard/breaking-news/create"],
  startRoute: "/dashboard/breaking-news",
  steps: [
    {
      target: "breaking-news.list.create",
      title: "Ouvrez le formulaire",
      body: "Les actualités défilent dans le ruban, sous l'en-tête de toutes les pages publiques. Cliquez sur « Créer une actualité ».",
      advance: { kind: "click" },
    },
    {
      target: "breaking-news.form.title",
      title: "Un titre",
      body: "Pour cet essai, tapez « Exemple (tuto) » : vous pourrez supprimer l'actualité ensuite.",
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
      body: "Sans date, l'actualité reste un brouillon invisible du public. Une date passée la publie, une date future programme sa publication.",
      advance: { kind: "next" },
    },
    {
      target: "breaking-news.form.expiresAt",
      title: "Une échéance, si besoin",
      body: "Passée cette date, l'actualité quitte le ruban d'elle-même. Vide : elle reste jusqu'à ce qu'on la retire.",
      advance: { kind: "next" },
    },
    {
      target: "breaking-news.form.submit",
      title: "Enregistrez",
      body: "Cliquez sur « Créer ». L'actualité est enregistrée en brouillon et la liste s'affiche.",
      advance: { kind: "route", match: "/dashboard/breaking-news" },
    },
    {
      title: "C'est fait",
      body: "Votre actualité est dans la liste, au statut « Brouillon ». Pour la publier, cliquez sur sa ligne et donnez-lui une date. S'il ne s'agissait que d'un essai, supprimez-la (colonne de droite).",
      advance: { kind: "next" },
    },
  ],
};
