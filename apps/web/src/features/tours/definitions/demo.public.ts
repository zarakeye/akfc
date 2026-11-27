import type { Tour, TourStep } from "../tour.types";

/**
 * La démo — le site public, en visiteur : l'accueil et une discipline, les galeries, les
 * instructeurs et l'association. Rien n'y est modifié : les tutos se rejouent tels quels.
 *
 * Les rubriques du menu se rejoignent par l'en-tête : la barre sur grand écran, le panneau du
 * menu sur petit écran. Chaque étape vise l'un ou l'autre ; celle qui ne s'affiche pas à cette
 * largeur s'efface (`optional`).
 */
function parLeMenu(label: string, item: string | undefined, title: string, body: string): TourStep[] {
  return [
    {
      // Petit écran : les rubriques sont dans le menu. Sur grand écran, la barre les montre.
      target: "header.nav",
      title: "Ouvrez le menu",
      body: "Sur cet écran, les rubriques sont dans le menu.",
      advance: { kind: "click" },
      skipWhen: { target: "header.nav", text: label },
    },
    {
      target: "header.nav",
      targetText: label,
      title: label,
      body: "Un clic l'ouvre ; il reste ouvert jusqu'au prochain clic ailleurs.",
      advance: { kind: "click" },
      optional: true,
    },
    {
      target: "header.panel",
      targetText: label,
      title: label,
      body: "Un appui déroule la rubrique.",
      advance: { kind: "click" },
      optional: true,
    },
    {
      target: "header.submenu",
      targetText: item,
      title,
      body,
      advance: { kind: "click" },
    },
  ];
}

export const demoPublicAccueil: Tour = {
  id: "demo.public.accueil",
  title: "L'accueil et une discipline",
  description: "La page d'accueil, puis une discipline par le menu.",
  audience: "public",
  routes: ["/", /^\/disciplines\//],
  startRoute: "/",
  doc: "/docs/dev/domaine/ce-que-voit-le-visiteur",
  demoOnly: true,
  steps: [
    {
      target: "home.carousel",
      title: "Le carrousel",
      body: "Les photos d'une galerie choisie par le club ; il défile seul, se fait glisser, et s'arrête pour qui préfère moins d'animations.",
      advance: { kind: "next" },
      optional: true,
    },
    {
      target: "home.intro",
      title: "L'accueil",
      body: "Une page éditoriale : le club la compose et la publie lui-même, comme « L'association ».",
      advance: { kind: "next" },
    },
    {
      target: "home.disciplines",
      title: "Les disciplines",
      body: "Le résumé de chacune ; la carte se déplie.",
      advance: { kind: "next" },
      optional: true,
    },
    {
      target: "home.news",
      title: "Les actualités",
      body: "Les annonces publiques du club. Les membres connectés en voient davantage.",
      advance: { kind: "next" },
      optional: true,
    },
    {
      target: "home.join",
      title: "Nous rejoindre",
      body: "Les inscriptions se font à la MJC : la page « S'inscrire » explique comment.",
      advance: { kind: "next" },
    },
    ...parLeMenu("Nos disciplines", undefined, "Une discipline", "Choisissez-en une : sa page la présente."),
    {
      target: "discipline.content",
      title: "Sa page",
      body: "Faite de blocs, comme les pages éditoriales : texte, photos, galerie, vidéos. Une photo refusée par une personne taguée n'y apparaît pas.",
      advance: { kind: "next" },
    },
  ],
};

export const demoPublicGaleries: Tour = {
  id: "demo.public.galeries",
  title: "Les galeries",
  description: "Les galeries publiques, et leur visionneuse.",
  audience: "public",
  routes: ["/gallery"],
  startRoute: "/gallery",
  doc: "/docs/dev/domaine/ce-que-voit-le-visiteur",
  demoOnly: true,
  steps: [
    {
      target: "gallery.view",
      title: "Les galeries",
      body: "Rangées par discipline, puis par type (cours, stages…) ; chaque niveau se replie.",
      advance: { kind: "next" },
    },
    {
      target: "gallery.grid",
      title: "Une photo",
      body: "Un clic l'ouvre dans la visionneuse.",
      advance: { kind: "click" },
    },
    {
      target: "gallery.lightbox",
      title: "La visionneuse",
      body: "Les flèches (et celles du clavier) passent d'un média à l'autre ; le diaporama défile seul.",
      advance: { kind: "next" },
    },
    {
      target: "gallery.close",
      title: "Fermez",
      body: "Ou Échap.",
      advance: { kind: "click" },
    },
  ],
};

export const demoPublicClub: Tour = {
  id: "demo.public.club",
  title: "Les instructeurs et l'association",
  description: "Les instructeurs, puis la page « L'association » par le menu.",
  audience: "public",
  routes: ["/about/instructeurs", "/about"],
  startRoute: "/about/instructeurs",
  doc: "/docs/dev/domaine/ce-que-voit-le-visiteur",
  demoOnly: true,
  steps: [
    {
      target: "instructors.page",
      title: "Les instructeurs",
      body: "Chacun avec sa présentation, écrite dans son profil et validée par le club.",
      advance: { kind: "next" },
    },
    ...parLeMenu("Qui sommes-nous", "L'association", "L'association", "La page que le parcours « Construire une page » complète et publie."),
    {
      target: "about.content",
      title: "Publiée",
      body: "Tout le monde la lit.",
      advance: { kind: "next" },
      optional: true,
    },
    {
      target: "page.under-construction",
      title: "En construction",
      body: "Tant qu'elle n'est pas publiée, le visiteur lit ceci ; les administrateurs, eux, voient le brouillon.",
      advance: { kind: "next" },
      optional: true,
    },
  ],
};
