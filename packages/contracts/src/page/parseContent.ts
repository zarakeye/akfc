import {
  emptyPageContentV1,
  pageContentSchemaV1,
  type PageContentV1,
} from '@contracts/page/blocks.v1';

/* ─────────────────────────────────────────────────────────────────────── */
/*  parsePageContentV1                                                     */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Lit un `content` brut de la base (typiquement le `Course.content` JSON,
 * ou `Stage.description` / `Stage.program` / `Post.content`) et rend un
 * `PageContentV1` toujours valide.
 *
 * ─── Pourquoi un helper plutôt qu'un appel direct au schema ? ──────────
 *
 * Sur le papier, on pourrait écrire à chaque site d'appel :
 *
 *     const parsed = pageContentSchemaV1.safeParse(raw);
 *     const content = parsed.success ? parsed.data : emptyPageContentV1();
 *
 * Mais ce pattern revient en plusieurs endroits (chaque page publique
 * qui rend du contenu : `/cours/[id]`, `/stages/[id]`, `/actualites/[id]`,
 * etc.) et il y a une vraie tentation de l'oublier — ou pire, de jeter
 * une exception sur les contenus invalides au lieu de dégrader
 * proprement.
 *
 * Le helper porte la **politique de robustesse à la lecture** : un
 * contenu invalide ou inexistant rend une page vide (avec un éventuel
 * placeholder côté UI), pas une 500. Cohérent avec le filtrage
 * silencieux des assets manquants côté Views.
 *
 * ─── Quand ça déclenche le fallback ────────────────────────────────────
 *
 *   - `raw` est `null` ou `undefined` (champ jamais peuplé)
 *   - `raw` est d'une version antérieure incompatible (avant le
 *     sous-chantier 5, format différent)
 *   - le `version` est diffèrent de `1`
 *   - une migration de bloc a partiellement échoué
 *
 * Dans tous ces cas, `emptyPageContentV1()` rend `{ version: 1, blocks: [] }`,
 * qui est sain et rendu en « page vide » par le `PageRenderer`.
 *
 * Pas de log par défaut — si tu veux tracer les fallbacks (utile pour
 * détecter des contenus pré-v1 qui n'ont pas été migrés), pose un
 * monitoring autour des appels (sentry breadcrumb par exemple) ; on
 * évite d'imposer ici un sink de logging au contrat.
 */
export function parsePageContentV1(raw: unknown): PageContentV1 {
  const result = pageContentSchemaV1.safeParse(raw);
  return result.success ? result.data : emptyPageContentV1();
}
