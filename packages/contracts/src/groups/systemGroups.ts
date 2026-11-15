/**
 * Groupes système : Administrateurs (isAdminGroup), Instructeurs et Bureau (systemKind).
 *
 * Leurs membres sont MAJEURS d'office : un mineur ne peut pas y entrer, et y entrer fixe la
 * majorité. Ils ne se suppriment pas. Comme tous les groupes, ils descendent d'Administrateurs.
 */
export const SYSTEM_GROUP_KINDS = ["INSTRUCTORS", "BUREAU"] as const;
export type SystemGroupKindValue = (typeof SYSTEM_GROUP_KINDS)[number];

export const SYSTEM_GROUP_NAME: Record<SystemGroupKindValue, string> = {
  INSTRUCTORS: "Instructeurs",
  BUREAU: "Bureau",
};

/** Le groupe impose-t-il la majorité à ses membres ? */
export function isAdultGroup(g: { isAdminGroup: boolean; systemKind: string | null }): boolean {
  return g.isAdminGroup || g.systemKind !== null;
}
