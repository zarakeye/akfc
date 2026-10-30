import {
  emptyPageContentV1,
  pageBlockSchemaV1,
  pageContentSchemaV1,
  type PageBlockV1,
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
 * ─── Un bloc fautif ne vide pas la page ───────────────────────────────
 *
 * Une enveloppe v1 dont UN bloc est invalide garde ses autres blocs : seul le
 * fautif est écarté. Rendre la page entière vide aurait un effet pire qu'à
 * l'affichage — l'éditeur s'ouvrirait sur une page vide, et l'enregistrer
 * effacerait tout le reste.
 *
 * Chaque écart est signalé par `console.warn` (serveur ou navigateur) : un
 * contenu qui disparaît sans trace ne se diagnostique pas.
 */
export function parsePageContentV1(raw: unknown): PageContentV1 {
  const result = pageContentSchemaV1.safeParse(raw);
  if (result.success) return result.data;
  if (raw === null || raw === undefined) return emptyPageContentV1();

  const envelope = raw as { version?: unknown; blocks?: unknown };
  if (envelope.version !== 1 || !Array.isArray(envelope.blocks)) {
    console.warn('[parsePageContentV1] contenu illisible, page vide rendue', result.error.issues.slice(0, 3));
    return emptyPageContentV1();
  }

  const blocks: PageBlockV1[] = [];
  envelope.blocks.forEach((rawBlock, index) => {
    const block = pageBlockSchemaV1.safeParse(rawBlock);
    if (block.success) blocks.push(block.data);
    else console.warn(`[parsePageContentV1] bloc #${index} écarté`, block.error.issues.slice(0, 3));
  });
  return { version: 1, blocks };
}
