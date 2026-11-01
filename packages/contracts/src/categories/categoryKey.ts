/**
 * Les catégories d'activités du club : une liste fixe.
 *
 * Le code reconnaît une catégorie à sa clé (`Category.key`, enum Prisma `CategoryKey`), jamais à
 * son libellé : renommer « Stage » en « Stages » ne doit rien casser. Le libellé ci-dessous est
 * celui proposé à la création ; l'administrateur peut ensuite le changer.
 */
export const CATEGORY_KEYS = ["course", "seminar", "event"] as const;

export type CategoryKey = (typeof CATEGORY_KEYS)[number];

/** Libellé proposé par défaut, et nom de la clé dans l'interface. */
export const CATEGORY_KEY_LABELS: Record<CategoryKey, string> = {
  course: "Cours",
  seminar: "Stage",
  event: "Évènement",
};
