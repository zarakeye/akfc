import type { Tour } from "../tour.types";

/**
 * Tuto pilote — créer une actualité (admin).
 * Fiche de doc associée : même identifiant, « admin.posts.create ».
 * L'article est créé en BROUILLON (date de publication vide) : rien n'est publié.
 */
export const adminPostsCreate: Tour = {
  id: "admin.posts.create",
  title: "Créer une actualité",
  description: "Rédiger un article et l'enregistrer en brouillon, sans le publier.",
  audience: "admin",
  routes: ["/dashboard/posts", "/dashboard/posts/create"],
  startRoute: "/dashboard/posts",
  steps: [
    {
      target: "posts.list.create",
      title: "Ouvrez le formulaire",
      body: "Toutes les actualités du site sont listées ici. Cliquez sur « Créer un article » pour en rédiger une nouvelle.",
      advance: { kind: "click" },
    },
    {
      target: "posts.form.title",
      title: "Donnez un titre",
      body: "Le titre est le seul champ obligatoire. Pour cet essai, tapez « Exemple (tuto) » : vous pourrez supprimer l'article ensuite.",
      advance: { kind: "input", validate: (v) => v.trim().length > 0 },
    },
    {
      target: "posts.form.publicationDate",
      title: "Laissez la date vide",
      body: "Sans date, l'article reste un brouillon invisible du public. Une date passée le publie, une date future programme sa publication.",
      advance: { kind: "next" },
    },
    {
      target: "posts.form.content",
      title: "Le contenu de l'article",
      body: "Ce constructeur assemble le corps de l'article : textes, images, documents. Il a son propre tuto ; ici, un article sans contenu suffit.",
      advance: { kind: "next" },
    },
    {
      target: "posts.form.submit",
      title: "Enregistrez",
      body: "Cliquez sur « Créer ». L'article est enregistré en brouillon et sa page de détail s'ouvre.",
      advance: { kind: "route", match: /^\/dashboard\/posts\/\d+$/ },
    },
    {
      title: "C'est fait",
      body: "Votre article existe en brouillon. Pour le publier, modifiez-le et donnez-lui une date de publication. S'il ne servait qu'à l'essai, supprimez-le depuis la liste.",
      advance: { kind: "next" },
    },
  ],
};
