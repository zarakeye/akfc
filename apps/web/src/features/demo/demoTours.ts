import type { DemoAccountKey } from "#features/demo/demoAccounts.ts";

/**
 * Les parcours de la démo : quelques gestes à faire dans le site, et les chapitres de la doc qui
 * les expliquent. Le panneau de la démo les propose en cases à cocher : on prend tout, ou
 * seulement ce qui intéresse.
 *
 * Une étape peut proposer un compte (« en Membre majeur ») : le panneau offre de s'y connecter.
 * Les liens de la doc ouvrent un nouvel onglet, pour ne pas perdre sa place dans le site.
 */
/** `tour` : un tuto du site (features/tours), lancé en mode guidé (le curseur montre le chemin). */
export type DemoStep = { text: string; href?: string; as?: DemoAccountKey; tour?: string };
/** Le rôle dans lequel se fait une étape : un compte de la démo, ou un visiteur sans compte. */
export type DemoRole = DemoAccountKey | "visiteur";
export type DemoTour = {
  key: string;
  /** Le rôle de la première étape ; une étape avec `as` change de rôle pour les suivantes. */
  start: DemoRole;
  family: "fonction" | "metier";
  title: string;
  pitch: string;
  steps: DemoStep[];
  docs: { label: string; href: string }[];
};

const dev = (path: string): string => `/docs/dev/${path}`;

export const DEMO_TOURS: DemoTour[] = [
  {
    key: "site-public",
    start: "visiteur",
    family: "fonction",
    title: "Le site public",
    pitch: "Ce que voit un visiteur, sans compte.",
    steps: [
      { text: "L'accueil et son carousel", href: "/" },
      { text: "Une discipline, par le menu « Nos disciplines » : sa description, ses photos" },
      { text: "Les instructeurs et leurs bios", href: "/about/instructeurs" },
      { text: "Les galeries", href: "/gallery" },
      { text: "La page « L'association » : en construction pour le public", href: "/about" },
    ],
    docs: [
      { label: "Ce que voit le visiteur", href: dev("domaine/ce-que-voit-le-visiteur") },
      { label: "Le référencement", href: dev("interface/referencement") },
    ],
  },
  {
    key: "vie-membre",
    start: "membre",
    family: "fonction",
    title: "La vie d'un membre",
    pitch: "Un membre majeur : son profil, son espace, son droit à l'image.",
    steps: [
      { text: "Se connecter en membre majeur", as: "membre" },
      { text: "Son profil, puis changer son avatar (recadrage carré)", href: "/profil/edit" },
      { text: "Déposer une photo dans son espace", href: "/mes-espaces" },
      { text: "Donner son droit à l'image en ligne : un PDF signé arrive dans Mailpit", href: "/profil/droit-a-l-image" },
      { text: "Voir où l'on apparaît sur le site", href: "/profil/ou-j-apparais" },
    ],
    docs: [
      { label: "Profil et première connexion", href: dev("membres/profil-et-premiere-connexion") },
      { label: "L'avatar", href: dev("membres/l-avatar") },
      { label: "Le consentement en ligne", href: dev("legal/consentement-en-ligne") },
    ],
  },
  {
    key: "mineur-parent",
    start: "mineur",
    family: "fonction",
    title: "Un mineur et son parent",
    pitch: "Le droit à l'image d'un mineur passe par son parent, par e-mail.",
    steps: [
      { text: "Se connecter en membre mineur", as: "mineur" },
      { text: "Demander l'autorisation de droit à l'image", href: "/profil/droit-a-l-image" },
      { text: "Ouvrir Mailpit (lien plus bas) : le parent a reçu un e-mail ; cliquer son lien et valider" },
      { text: "Revenir au profil du mineur : l'autorisation est enregistrée", href: "/profil/droit-a-l-image" },
    ],
    docs: [
      { label: "Le droit à l'image", href: dev("legal/droit-a-l-image") },
      { label: "Majorité, statut et cours", href: dev("membres/majorite-statut-et-cours") },
    ],
  },
  {
    key: "mediatheque",
    start: "admin",
    family: "fonction",
    title: "La médiathèque",
    pitch: "Un explorateur de fichiers dans le navigateur, avec corbeille et versions.",
    steps: [
      { text: "Se connecter en administrateur, par le formulaire", as: "admin", tour: "demo.connexion.admin" },
      {
        text: "Parcourir la bibliothèque : ouvrir un dossier, changer d'affichage, chercher",
        href: "/dashboard/library",
        tour: "demo.mediatheque.parcourir",
      },
      { text: "Ranger une photo dans un autre dossier", href: "/dashboard/library", tour: "demo.mediatheque.ranger" },
      { text: "Ouvrir l'historique des versions d'une photo", href: "/dashboard/library", tour: "demo.mediatheque.versions" },
      {
        text: "Jeter une photo, la retrouver dans la corbeille, la restaurer",
        href: "/dashboard/library",
        tour: "demo.mediatheque.corbeille",
      },
      { text: "Ajouter des photos (une photo d'iPhone en HEIC passe aussi)", href: "/dashboard/library/add" },
    ],
    docs: [
      { label: "Trois finders en un", href: dev("finder/trois-finders-en-un") },
      { label: "Jeter, retrouver, effacer", href: dev("corbeille/jeter-retrouver-effacer") },
      { label: "Les versions d'un fichier", href: dev("corbeille/les-versions-d-un-fichier") },
      { label: "Les photos d'iPhone", href: dev("envois/les-photos-d-iphone") },
    ],
  },
  {
    key: "droits-image",
    start: "admin",
    family: "fonction",
    title: "Droits à l'image et tags",
    pitch: "Chaque personne taguée sur une photo est comparée à son autorisation.",
    steps: [
      { text: "Se connecter en administrateur, par le formulaire", as: "admin", tour: "demo.connexion.admin" },
      {
        text: "Taguer le membre sur une photo en ligne, et voir le verdict avant d'enregistrer",
        href: "/dashboard/droit-image",
        tour: "demo.droits.taguer",
      },
      { text: "Relancer une adhérente qui n'a pas répondu", href: "/dashboard/droit-image", tour: "demo.droits.relancer" },
      { text: "La relance est dans Mailpit" },
      { text: "Se connecter en membre majeur", as: "membre", tour: "demo.connexion.membre" },
      { text: "« Où j'apparais » : refuser la photo", href: "/profil/ou-j-apparais", tour: "demo.droits.refuser" },
      { text: "Revenir en administrateur", as: "admin", tour: "demo.connexion.admin" },
      { text: "La photo refusée est masquée en ligne", href: "/dashboard/droit-image", tour: "demo.droits.masques" },
    ],
    docs: [
      { label: "Les tags de personnes", href: dev("legal/tags-de-personnes") },
      { label: "Le droit à l'image", href: dev("legal/droit-a-l-image") },
    ],
  },
  {
    key: "construire-page",
    start: "admin",
    family: "fonction",
    title: "Construire une page",
    pitch: "Une page faite de blocs, publiée quand elle est prête.",
    steps: [
      { text: "Se connecter en administrateur", as: "admin" },
      { text: "Les pages du site : « L'association » est en construction", href: "/dashboard/pages" },
      { text: "La compléter : un texte, une galerie, une image de la bibliothèque", href: "/dashboard/site-pages/association" },
      { text: "La publier, puis la voir en visiteur", href: "/about" },
    ],
    docs: [
      { label: "Un contenu fait de blocs", href: dev("contenu/un-contenu-fait-de-blocs") },
      { label: "Le registre et l'éditeur", href: dev("contenu/le-registre-et-l-editeur") },
    ],
  },
  {
    key: "groupes",
    start: "admin",
    family: "fonction",
    title: "Les groupes",
    pitch: "Les droits passent par les groupes ; un groupe peut avoir son espace partagé.",
    steps: [
      { text: "Se connecter en administrateur, par le formulaire", as: "admin", tour: "demo.connexion.admin" },
      {
        text: "Créer un groupe collaboratif, le retrouver dans la liste, y ajouter le membre majeur",
        href: "/dashboard/groups",
        tour: "demo.groupes.creer",
      },
      { text: "Se connecter en membre majeur", as: "membre", tour: "demo.connexion.membre" },
      { text: "L'espace du groupe apparaît dans « Mes espaces »", href: "/mes-espaces" },
      { text: "Revenir en administrateur", as: "admin", tour: "demo.connexion.admin" },
      { text: "Supprimer le groupe, et constater qu'il a quitté la liste", href: "/dashboard/groups", tour: "demo.groupes.supprimer" },
    ],
    docs: [
      { label: "Les groupes", href: dev("membres/les-groupes") },
      { label: "Les espaces collaboratifs", href: dev("membres/espaces-collaboratifs") },
      { label: "Les droits par les groupes", href: dev("auth/les-droits-par-les-groupes") },
    ],
  },
  {
    key: "demandes",
    start: "membre",
    family: "fonction",
    title: "Une demande au club",
    pitch: "Un formulaire de contact devient une demande suivie, et la réponse part par e-mail.",
    steps: [
      { text: "Se connecter en membre majeur, par le formulaire", as: "membre", tour: "demo.connexion.membre" },
      { text: "Écrire au club : la catégorie, l'objet, le message", href: "/contacts", tour: "demo.demandes.ecrire" },
      { text: "L'accusé de réception est dans Mailpit" },
      { text: "Se connecter en administrateur", as: "admin", tour: "demo.connexion.admin" },
      {
        text: "Une demande en retard ; retrouver la vôtre, la prendre en charge, y répondre",
        href: "/dashboard/tickets",
        tour: "demo.demandes.traiter",
      },
      { text: "La réponse est dans Mailpit, comme l'a reçue le membre" },
      { text: "Se connecter en Sam, du support", as: "support", tour: "demo.connexion.support" },
      { text: "Ce que voit un bénévole qui n'est pas administrateur", href: "/dashboard/tickets", tour: "demo.demandes.support" },
    ],
    docs: [{ label: "Les demandes", href: dev("membres/demandes") }],
  },
  {
    key: "sous-le-capot",
    start: "visiteur",
    family: "fonction",
    title: "Sous le capot",
    pitch: "Comment cette démo existe : une image, un paquet de données, une machine jetable.",
    steps: [
      { text: "La documentation des développeurs, intégrée au site", href: "/docs/dev" },
      { text: "Dans le terminal Killercoda : docker ps, puis docker compose logs seeder" },
    ],
    docs: [
      { label: "La sandbox", href: dev("infrastructure/la-sandbox") },
      { label: "L'image Docker", href: dev("docker/l-image-docker") },
      { label: "L'intégration continue", href: dev("qualite/l-integration-continue") },
    ],
  },
  {
    key: "lead-front",
    start: "admin",
    family: "metier",
    title: "Lead Front",
    pitch: "Le Finder, les formulaires, React Hook Form et useActionState.",
    steps: [
      { text: "Se connecter en administrateur", as: "admin" },
      { text: "Le Finder : arbre chargé par paliers, grille, glisser-déposer", href: "/dashboard/library" },
      { text: "Un formulaire : modifier son profil (erreurs champ par champ, envoi sans JavaScript)", href: "/profil/edit" },
      { text: "Le recadrage de l'avatar, au doigt comme à la souris", href: "/profil/edit" },
    ],
    docs: [
      { label: "Le store du Finder", href: dev("finder/le-store-du-finder") },
      { label: "Le glisser-déposer", href: dev("finder/le-glisser-deposer") },
      { label: "React Hook Form", href: dev("formulaires/react-hook-form") },
      { label: "useActionState", href: dev("formulaires/use-action-state") },
      { label: "Le modèle hybride face au réel", href: dev("formulaires/le-modele-hybride-face-au-reel") },
      { label: "La frontière serveur-client", href: dev("front/frontiere-serveur-client") },
    ],
  },
  {
    key: "backend",
    start: "membre",
    family: "metier",
    title: "Backend",
    pitch: "Prisma, le modèle de données, tRPC et les contrats partagés.",
    steps: [
      { text: "Écrire au club, puis suivre la demande côté administration : un circuit complet", href: "/contacts", tour: "demo.demandes.ecrire" },
      { text: "Se connecter en Sam, puis ouvrir la bibliothèque : refusé, par la procédure elle-même", as: "support" },
    ],
    docs: [
      { label: "Lire le schéma", href: dev("donnees/lire-le-schema") },
      { label: "Les relations", href: dev("donnees/les-relations") },
      { label: "Pourquoi tRPC", href: dev("api/pourquoi-trpc") },
      { label: "Le circuit complet", href: dev("api/le-circuit-complet") },
      { label: "Valider l'entrée (contrats partagés)", href: dev("api/valider-l-entree") },
      { label: "Protéger une procédure", href: dev("api/proteger-une-procedure") },
    ],
  },
  {
    key: "cto",
    start: "visiteur",
    family: "metier",
    title: "CTO",
    pitch: "L'architecture d'ensemble, les choix techniques, ce qui permet de grandir.",
    steps: [
      { text: "La carte du système, puis le domaine du club", href: dev("api/la-carte-du-systeme") },
      { text: "Cette démo elle-même : la même image que la production, des données fictives" },
    ],
    docs: [
      { label: "Comprendre le domaine", href: dev("domaine/comprendre-le-domaine") },
      { label: "Un modèle qui s'ouvre", href: dev("domaine/un-modele-qui-s-ouvre") },
      { label: "Pourquoi Docker", href: dev("docker/pourquoi-docker") },
      { label: "Un stockage objet", href: dev("stockage/un-stockage-objet") },
      { label: "Mettre en production", href: dev("infrastructure/mettre-en-production") },
      { label: "L'intégration continue", href: dev("qualite/l-integration-continue") },
    ],
  },
  {
    key: "rssi",
    start: "support",
    family: "metier",
    title: "RSSI",
    pitch: "Le stockage, les permissions, le RGPD et les mineurs.",
    steps: [
      { text: "Se connecter en Sam : ce qu'un bénévole non administrateur voit, et ne voit pas", as: "support" },
      { text: "Se connecter en membre mineur et suivre la validation par le parent", as: "mineur" },
      { text: "Se connecter en administrateur : la page RGPD", as: "admin", href: "/dashboard/rgpd" },
    ],
    docs: [
      { label: "Signer un envoi", href: dev("stockage/signer-un-envoi") },
      { label: "Servir un fichier", href: dev("stockage/servir-un-fichier") },
      { label: "Les droits par les groupes", href: dev("auth/les-droits-par-les-groupes") },
      { label: "Les données personnelles", href: dev("legal/donnees-personnelles") },
      { label: "Le droit à l'image", href: dev("legal/droit-a-l-image") },
    ],
  },
];

/** Le rôle de chaque étape : celui de départ, puis celui de la dernière étape qui a changé de compte. */
export function stepRoles(tour: DemoTour): DemoRole[] {
  let role: DemoRole = tour.start;
  return tour.steps.map((step) => {
    if (step.as) role = step.as;
    return role;
  });
}

/** Les rôles d'un parcours, dans l'ordre où on les endosse, sans doublon. */
export function tourRoles(tour: DemoTour): DemoRole[] {
  return [...new Set(stepRoles(tour))];
}
