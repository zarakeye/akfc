import type { Tour, TourSkip, TourStep } from "../tour.types";

/**
 * La démo — la médiathèque, en quatre tutos guidés : parcourir, ranger une photo, ouvrir ses
 * versions, la jeter puis la restaurer. Ils travaillent dans « Démo de la médiathèque », un
 * dossier aux noms connus d'avance (prisma/seed.sandbox.decor.mjs, seedMediathequeDecor).
 *
 * Chaque tuto repart de la racine de la bibliothèque, où qu'on l'ait laissée. Un parcours se
 * rejoue : la photo déjà rangée ou déjà jetée efface les étapes qui la déplaçaient (`skipWhen`).
 */
const ROOT = "AKFC";
const DEMO = "Démo de la médiathèque";
const ALBUM = "Album";

/** La racine : le fil d'Ariane y remonte ; déjà là (la corbeille est dans la liste), l'étape s'efface. */
const racine: TourStep = {
  target: "finder.breadcrumb",
  targetText: ROOT,
  title: "Revenez à la racine",
  body: "Le fil d'Ariane, en haut : un clic sur un nom remonte à ce dossier.",
  advance: { kind: "click" },
  optional: true,
  skipWhen: { target: "finder.content", text: "Corbeille" },
};

const ouvrirDemo: TourStep = {
  target: "finder.content",
  targetText: DEMO,
  title: "Ouvrez le dossier d'exercice",
  body: "Un clic sur un dossier l'ouvre. Celui-ci a été préparé pour la démo.",
  advance: { kind: "click" },
};

/** La photo a quitté le dossier d'exercice (dont la liste est chargée : l'album y est). */
const parti = (file: string): TourSkip => ({ target: "finder.content", text: ALBUM, without: file });

export const demoMediathequeParcourir: Tour = {
  id: "demo.mediatheque.parcourir",
  title: "Parcourir la bibliothèque",
  description: "Ouvrir un dossier, changer d'affichage, chercher un fichier.",
  audience: "admin",
  routes: ["/dashboard/library"],
  startRoute: "/dashboard/library",
  doc: "/docs/dev/finder/trois-finders-en-un",
  demoOnly: true,
  steps: [
    racine,
    {
      target: "finder.tree",
      title: "Les dossiers",
      body: "L'arborescence : un dossier par discipline, stage, groupe… La corbeille y est aussi. Sur un écran étroit, on navigue par le contenu et le fil d'Ariane.",
      advance: { kind: "next" },
      optional: true,
    },
    ouvrirDemo,
    {
      target: "finder.views",
      targetText: "Tableau",
      title: "Un autre affichage",
      body: "Grille, tableau ou liste compacte : le même contenu, trois présentations. Passez en tableau.",
      advance: { kind: "click" },
    },
    {
      target: "finder.content",
      title: "Le tableau",
      body: "Le nom, le type, le statut (publié, en attente) et la taille de chaque élément.",
      advance: { kind: "next" },
    },
    {
      target: "finder.search",
      title: "Cherchez",
      body: "La recherche porte sur ce dossier et ses sous-dossiers : les noms, les descriptions, qui a déposé.",
      advance: { kind: "input" },
      expect: "jeter",
    },
    {
      target: "finder.content",
      targetText: "photo-a-jeter",
      title: "Trouvée",
      body: "Le passage qui correspond est surligné. Un clic sur un résultat ouvre son dossier.",
      advance: { kind: "next" },
    },
    {
      target: "finder.search.clear",
      title: "Effacez la recherche",
      body: "La croix vide le champ et ramène au contenu du dossier.",
      advance: { kind: "click" },
    },
    {
      target: "finder.views",
      targetText: "Grille",
      title: "Revenez à la grille",
      body: "L'affichage choisi est gardé d'une visite à l'autre.",
      advance: { kind: "click" },
    },
    {
      title: "Et le tri",
      body: "Un clic droit dans le vide d'un dossier propose le tri : par nom, type, taille, date ou expéditeur, avec un second critère.",
      advance: { kind: "next" },
    },
  ],
};

const moved = parti("photo-a-ranger");

export const demoMediathequeRanger: Tour = {
  id: "demo.mediatheque.ranger",
  title: "Ranger une photo",
  description: "Déplacer une photo dans un autre dossier, par le menu du clic droit.",
  audience: "admin",
  routes: ["/dashboard/library"],
  startRoute: "/dashboard/library",
  doc: "/docs/dev/finder/trois-finders-en-un",
  demoOnly: true,
  steps: [
    racine,
    ouvrirDemo,
    {
      target: "finder.content",
      targetText: "photo-a-ranger",
      title: "Le menu d'une photo",
      body: "Un clic droit sur un élément ouvre son menu : renommer, déplacer, jeter…",
      advance: { kind: "click", button: "right" },
      skipWhen: moved,
    },
    {
      target: "finder.menu",
      targetText: "Déplacer",
      title: "Déplacer",
      body: "Choisissez « Déplacer… ».",
      advance: { kind: "click" },
      skipWhen: moved,
    },
    {
      target: "finder.move",
      targetText: DEMO,
      title: "La destination",
      body: "On choisit le dossier d'arrivée en descendant depuis la racine.",
      advance: { kind: "click" },
      skipWhen: moved,
    },
    {
      target: "finder.move",
      targetText: ALBUM,
      title: "L'album",
      body: "Encore un niveau : l'album.",
      advance: { kind: "click" },
      skipWhen: moved,
    },
    {
      target: "finder.move.confirm",
      title: "Déplacez",
      body: "Le dossier ouvert dans la fenêtre est la destination.",
      advance: { kind: "click" },
      skipWhen: moved,
    },
    {
      target: "finder.content",
      targetText: ALBUM,
      title: "Ouvrez l'album",
      body: "La photo a quitté le dossier. Allons la voir.",
      advance: { kind: "click" },
    },
    {
      target: "finder.content",
      targetText: "photo-a-ranger",
      title: "Rangée",
      body: "La voilà. Glisser une photo sur un dossier (ou sur un nom du fil d'Ariane) fait la même chose, à la souris.",
      advance: { kind: "next" },
    },
  ],
};

export const demoMediathequeVersions: Tour = {
  id: "demo.mediatheque.versions",
  title: "Les versions d'une photo",
  description: "Ouvrir l'historique d'une photo remplacée.",
  audience: "admin",
  routes: ["/dashboard/library"],
  startRoute: "/dashboard/library",
  doc: "/docs/dev/corbeille/les-versions-d-un-fichier",
  demoOnly: true,
  steps: [
    racine,
    ouvrirDemo,
    {
      target: "finder.content",
      targetText: ALBUM,
      title: "Ouvrez l'album",
      body: "Une de ses photos a été remplacée il y a un mois.",
      advance: { kind: "click" },
    },
    {
      target: "finder.content",
      targetText: "photo-avec-versions",
      title: "Sélectionnez-la",
      body: "Un clic sélectionne un fichier ; l'aperçu montre ses informations.",
      advance: { kind: "click" },
    },
    {
      target: "finder.preview.open",
      title: "L'aperçu",
      body: "Ouvrez le panneau d'aperçu.",
      advance: { kind: "click" },
      optional: true,
    },
    {
      target: "finder.versions",
      title: "Les versions",
      body: "Ouvrez l'historique de la photo.",
      advance: { kind: "click" },
      skipWhen: { target: "finder.versions.list" },
    },
    {
      target: "finder.versions.list",
      title: "L'historique",
      body: "La version actuelle, puis les précédentes, avec leur date et leur auteur. Chacune se télécharge ou se remet en place.",
      advance: { kind: "next" },
    },
    {
      title: "Rien ne se perd",
      body: "Remettre en place une ancienne version ne l'écrase pas : la version actuelle devient à son tour une version.",
      advance: { kind: "next" },
    },
    {
      target: "finder.preview.close",
      title: "Fermez l'aperçu",
      body: "Sur un écran étroit, l'aperçu est une feuille posée sur la page.",
      advance: { kind: "click" },
      optional: true,
    },
  ],
};

const thrown = parti("photo-a-jeter");

export const demoMediathequeCorbeille: Tour = {
  id: "demo.mediatheque.corbeille",
  title: "Jeter et restaurer une photo",
  description: "Envoyer une photo à la corbeille, l'y retrouver, la remettre à sa place.",
  audience: "admin",
  routes: ["/dashboard/library"],
  startRoute: "/dashboard/library",
  doc: "/docs/dev/corbeille/jeter-retrouver-effacer",
  demoOnly: true,
  steps: [
    racine,
    ouvrirDemo,
    {
      target: "finder.content",
      targetText: "photo-a-jeter",
      title: "Sélectionnez la photo",
      body: "Un clic la sélectionne.",
      advance: { kind: "click" },
      skipWhen: thrown,
    },
    {
      target: "finder.delete",
      title: "La corbeille",
      body: "Ce bouton envoie la sélection à la corbeille.",
      advance: { kind: "click" },
      skipWhen: thrown,
    },
    {
      target: "finder.confirm-delete",
      targetText: "Envoyer à la corbeille",
      title: "Confirmez",
      body: "Rien n'est effacé : la corbeille garde tout 90 jours.",
      advance: { kind: "click" },
      skipWhen: thrown,
    },
    {
      target: "finder.breadcrumb",
      targetText: ROOT,
      title: "Revenez à la racine",
      body: "La corbeille est à la racine de la bibliothèque.",
      advance: { kind: "click" },
    },
    {
      target: "finder.content",
      targetText: "Corbeille",
      title: "Ouvrez la corbeille",
      body: "Elle est là, avec les dossiers.",
      advance: { kind: "click" },
    },
    {
      target: "bin.view",
      targetText: "photo-a-jeter",
      title: "La photo jetée",
      body: "Sélectionnez-la. Chaque élément garde son chemin d'origine ; en tableau, on voit qui l'a jeté, quand, et quand il sera effacé.",
      advance: { kind: "click" },
    },
    {
      target: "bin.restore",
      title: "Restaurez",
      body: "Elle retourne à son chemin d'origine. Si un autre fichier y a pris sa place, rien n'est écrasé : elle reçoit un nom suffixé.",
      advance: { kind: "click" },
    },
    {
      target: "finder.breadcrumb",
      targetText: ROOT,
      title: "Revenez à la racine",
      body: "Allons vérifier.",
      advance: { kind: "click" },
    },
    ouvrirDemo,
    {
      target: "finder.content",
      targetText: "photo-a-jeter",
      title: "De retour",
      body: "À sa place. Au bout de 90 jours, un élément jeté est effacé pour de bon, la nuit ; la cloche prévient une semaine avant.",
      advance: { kind: "next" },
    },
  ],
};
