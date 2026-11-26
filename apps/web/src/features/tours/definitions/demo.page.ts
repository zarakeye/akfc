import type { Tour, TourSkip } from "../tour.types";

/**
 * La démo — compléter la page « L'association », laissée à moitié construite par la sandbox
 * (prisma/seed.sandbox.decor.mjs), puis la publier. Rejoué, le tuto n'ajoute pas un second bloc :
 * la phrase déjà écrite efface les étapes qui l'écrivaient (`skipWhen`).
 */
const PAGE = "L'association";
const SENTENCE = "Ce paragraphe a été ajouté pendant la démo.";
const written: TourSkip = { target: "builder.blocks", text: SENTENCE };

export const demoPageCompleter: Tour = {
  id: "demo.page.completer",
  title: "Compléter et publier une page",
  description: "Ajouter un bloc de texte à « L'association », puis la publier.",
  audience: "admin",
  routes: ["/dashboard/pages", /^\/dashboard\/site-pages\//],
  startRoute: "/dashboard/pages",
  doc: "/docs/dev/contenu/un-contenu-fait-de-blocs",
  demoOnly: true,
  steps: [
    {
      target: "pages.list",
      targetText: PAGE,
      title: "L'association",
      body: "Son état et ses deux boutons. En brouillon, seuls les administrateurs la voient ; un visiteur lit « page en construction ».",
      advance: { kind: "next" },
    },
    {
      target: "pages.list",
      targetText: PAGE,
      targetPick: "[data-tour='pages.item.edit']",
      title: "Ouvrez son constructeur",
      body: "Cliquez sur « Éditer ».",
      advance: { kind: "click" },
    },
    {
      target: "builder.blocks",
      title: "Une page faite de blocs",
      body: "Un début de texte, une galerie de deux photos : chaque bloc se déplace à sa poignée et se supprime à sa corbeille.",
      advance: { kind: "next" },
    },
    {
      target: "builder.add",
      title: "Ajoutez un bloc",
      body: "En bas de la page.",
      advance: { kind: "click" },
      skipWhen: written,
    },
    {
      target: "builder.add.text",
      title: "Un bloc de texte",
      body: "Chaque type de bloc a son usage : texte, médias et texte, galerie, documents… Survoler un type en montre un aperçu.",
      advance: { kind: "click" },
      skipWhen: written,
    },
    {
      target: "builder.text",
      targetLast: true,
      title: "Écrivez",
      body: "La barre d'outils met en forme : titres, gras, listes, liens, images de la bibliothèque.",
      advance: { kind: "input" },
      expect: SENTENCE,
      skipWhen: written,
    },
    {
      target: "site-page.publish",
      title: "Publiez",
      body: "Le contenu est enregistré, et la page devient visible de tous. « Enregistrer en brouillon » l'aurait gardée cachée.",
      advance: { kind: "click" },
    },
    {
      target: "site-page.status",
      title: "Publiée",
      body: "Dans le menu « Qui sommes-nous ? », la page s'ouvre désormais pour tout le monde.",
      advance: { kind: "next" },
    },
  ],
};
