import slugify from "slugify";

const SLUG_OPTIONS = { lower: true, strict: true } as const;

/**
 * Segment de STOCKAGE physique d'une catégorie.
 *
 * Le physique doit être stable et anglais ; `Category.type` reste l'AFFICHAGE
 * (résolu en FolderLabel). Quand le `type` n'est pas déjà l'anglais voulu, on
 * mappe explicitement — ex. « Cours » → dossier `courses`. Sinon, slug du type.
 *
 * Source unique partagée par le résolveur d'upload, le semis de FolderLabel et
 * l'injection des racines visibles. À terme (si les catégories se multiplient),
 * remplacer par une colonne `Category.slug` — même patron que Stage.slug.
 */
const CATEGORY_PHYSICAL_SLUG: Record<string, string> = {
  Cours: "courses",
};

export function categoryStorageSegment(type: string): string {
  return CATEGORY_PHYSICAL_SLUG[type] ?? slugify(type, SLUG_OPTIONS);
}
