/**
 * Structure de la navigation publique.
 *
 * Consommée par les DEUX rendus du Header : la barre horizontale (à partir
 * de `lg`) et le panneau du menu burger (en dessous). Écrire la liste des
 * liens deux fois garantirait qu'on en ajoute un d'un seul côté.
 *
 * `activities` est une entrée à part parce que « Nos activités » n'est pas
 * une liste figée : il se construit sur les familles et disciplines chargées
 * depuis la base. C'est un composant, pas des données.
 */
export type NavEntry =
  | {
      kind: "link";
      href: string;
      label: string;
      /** Réservé aux personnes connectées. */
      requiresUser?: boolean;
    }
  | {
      kind: "menu";
      label: string;
      /**
       * Préfixe d'URL marquant le menu comme actif (`/about` rend actif
       * `/about/instructeurs`).
       */
      activePrefix: string;
      children: { href: string; label: string }[];
    }
  | { kind: "activities" };

export const NAV_ENTRIES: NavEntry[] = [
  { kind: "link", href: "/", label: "Accueil" },
  { kind: "link", href: "/dashboard", label: "Dashboard", requiresUser: true },
  { kind: "link", href: "/documents", label: "Mes documents", requiresUser: true },
  { kind: "activities" },
  { kind: "link", href: "/gallery", label: "Galeries" },
  { kind: "link", href: "/agenda", label: "Agenda" },
  {
    kind: "menu",
    label: "Qui sommes-nous ?",
    activePrefix: "/about",
    children: [
      { href: "/about", label: "L'association" },
      { href: "/about/instructeurs", label: "Nos instructeurs" },
    ],
  },
  { kind: "link", href: "/contacts", label: "Contacts" },
  {
    kind: "menu",
    label: "Documentation",
    activePrefix: "/docs",
    children: [
      { href: "/docs", label: "Doc utilisateur" },
      { href: "/docs/admin", label: "Doc admin" },
      { href: "/docs/dev", label: "Dev doc" },
    ],
  },
];

/**
 * Halo emerald au survol, commun à tous les items de la barre.
 */
export const NAV_GLOW =
  "text-white transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]";

/**
 * État actif d'un item.
 *
 * Gras + souligné, à TAILLE CONSTANTE. L'ancien `text-[40px]` sur « Accueil »
 * poussait ses voisins et cassait une barre déjà serrée ; en panneau mobile,
 * il devenait ingérable.
 */
export const NAV_ACTIVE = "font-bold underline underline-offset-4";
