import type { Tour } from "../tour.types";

/**
 * Le constructeur de pages (admin) — sur le formulaire d'un post, sans l'enregistrer.
 * Fiche de doc associée : même identifiant, « admin.constructeur ».
 * Le bloc ajouté ne vit que dans le formulaire : rien n'est créé tant qu'on ne clique pas « Créer ».
 */
export const adminConstructeur: Tour = {
  id: "admin.constructeur",
  title: "Le constructeur de pages",
  description: "Composer un contenu en blocs : ajouter, déplacer, supprimer.",
  audience: "admin",
  routes: ["/dashboard/posts/create"],
  startRoute: "/dashboard/posts/create",
  doc: "/docs/admin/le-constructeur",
  steps: [
    {
      target: "posts.form.content",
      title: "Le constructeur",
      body: "Le même outil compose le contenu des posts, des disciplines, des stages, des évènements et des pages : une suite de blocs, de haut en bas.",
      advance: { kind: "next" },
    },
    {
      target: "builder.add",
      title: "Ajoutez un bloc",
      body: "Cliquez sur « Ajouter un bloc ».",
      advance: { kind: "click" },
    },
    {
      target: "builder.add.text",
      title: "Choisissez « Texte »",
      body: "Chaque type de bloc a son usage : texte, médias et texte, galerie, documents, pistes audio… Survoler un type en montre un aperçu. Cliquez sur « Texte ».",
      advance: { kind: "click" },
    },
    {
      target: "builder.block.header",
      title: "L'en-tête du bloc",
      body: "La poignée, à gauche, déplace le bloc par glisser-déposer. La corbeille, à droite, le supprime.",
      advance: { kind: "next" },
    },
    {
      target: "builder.block",
      title: "Le corps du bloc",
      body: "C'est ici qu'on écrit : la barre d'outils met en forme le texte (titres, gras, listes, liens…).",
      advance: { kind: "next" },
    },
    {
      title: "Rien n'est encore enregistré",
      body: "Les blocs ne sont enregistrés qu'avec le bouton du formulaire (« Créer », « Enregistrer »). Ce tuto ne l'a pas cliqué : quittez la page sans enregistrer, et rien n'aura été créé.",
      advance: { kind: "next" },
    },
  ],
};
