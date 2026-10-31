/**
 * Moteur de tutoriels interactifs — types.
 *
 * Un tuto est une suite d'ÉTAPES déclarées en données (un fichier par tuto, dans
 * `definitions/`). Chaque étape vise un élément de l'interface par son attribut
 * `data-tour="…"` (le CONTRAT entre un composant et les tutos : un nom stable, vérifié
 * par `scripts/check-tour-targets.mjs` dans `pnpm check`) et dit ce qui la fait passer.
 */

/** Qui voit un tuto dans le lanceur « ? ». */
export type TourAudience = "public" | "member" | "admin";

/** Ce qui fait passer une étape à la suivante. */
export type TourAdvance =
  /** Un clic sur la cible (bouton, lien…). */
  | { kind: "click" }
  /** Une saisie dans la cible (input, textarea) ; « Suivant » s'active quand `validate` l'accepte. */
  | { kind: "input"; validate?: (value: string) => boolean }
  /** L'arrivée sur une page : chaîne = chemin exact, RegExp = motif (`/^\/dashboard\/posts\/\d+$/`). */
  | { kind: "route"; match: string | RegExp }
  /** Un simple « Suivant » : l'étape explique, sans action attendue. */
  | { kind: "next" };

export interface TourStep {
  /** Valeur de `data-tour` de l'élément à mettre en lumière. Absent = bulle centrée, sans cible. */
  target?: string;
  /** Titre court de l'étape (impératif : « Saisissez le titre »). */
  title: string;
  /** Explication (une à trois phrases). */
  body: string;
  advance: TourAdvance;
  /**
   * Étape facultative : si sa cible n'apparaît pas (une liste vide, un choix qui n'existe que s'il
   * y a plusieurs options), elle est passée au bout d'un court délai au lieu de bloquer le tuto.
   */
  optional?: boolean;
}

export interface Tour {
  /** Identifiant stable, partagé avec la fiche de documentation (ex. « admin.posts.create »). */
  id: string;
  /** Titre affiché dans le lanceur. */
  title: string;
  /** Une phrase : ce que le tuto fait faire. */
  description: string;
  audience: TourAudience;
  /** Pages où le tuto est proposé (chemin exact ou motif). */
  routes: (string | RegExp)[];
  /** Page de départ : le lanceur y conduit avant la première étape. */
  startRoute: string;
  /** Fiche de documentation du tuto (« /docs/guide/mon-profil ») ; vérifiée par la garde. */
  doc: string;
  steps: TourStep[];
}
