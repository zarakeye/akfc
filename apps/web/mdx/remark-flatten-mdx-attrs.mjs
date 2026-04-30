/**
 * remark-flatten-mdx-attrs
 *
 * Plugin remark qui aplatit les attributs string multi-lignes des composants MDX
 * en single-line AVANT que @next/mdx ne les traite.
 *
 * Pourquoi :
 *   @next/mdx (au moins en v16.1.6) DROPPE silencieusement :
 *     1. Les expressions JSX {...} dans les attributs de composants
 *     2. Les strings d'attributs multi-lignes ('...\n...\n...')
 *
 *   Résultat : le composant reçoit `undefined` pour la prop concernée.
 *
 *   Ce plugin parcourt l'AST MDX, détecte les attributs string multi-lignes
 *   sur les composants JSX, et les réécrit en single-line. Le MDX source reste
 *   lisible (tu peux écrire ton JSON sur plusieurs lignes), et le pipeline
 *   reçoit une version aplatie qu'il accepte.
 *
 * Installation dans next.config.ts :
 *   import remarkFlattenMdxAttrs from "./src/mdx/remark-flatten-mdx-attrs.mjs"
 *
 *   const withMDX = createMDX({
 *     extension: /\.mdx?$/,
 *     options: {
 *       remarkPlugins: [remarkFlattenMdxAttrs],
 *     },
 *   })
 *
 * Portée :
 *   - S'applique à TOUS les composants MDX (pas seulement DocsTable).
 *   - Ne touche qu'aux attributs string. Les attributs numériques, booléens
 *     ou expressions JSX ne sont pas modifiés (rien à faire, ils sont déjà
 *     droppés par le pipeline de toute façon).
 *   - Préserve le contenu exact des strings : seuls les retours à la ligne
 *     et les espaces de début/fin de ligne sont collapsés.
 */

import { visit } from "unist-util-visit"

/**
 * Aplatit une string multi-ligne en single-line, de manière sûre pour du JSON.
 *
 * Exemple :
 *   '[\n  ["a","b"],\n  ["c","d"]\n]'
 *   devient
 *   '[["a","b"],["c","d"]]'
 *
 * La stratégie :
 *   1. Supprimer les retours à la ligne (\n, \r\n, \r)
 *   2. Collapser les espaces multiples en un seul espace
 *   3. Supprimer les espaces autour des séparateurs JSON (`,` `[` `]` `{` `}` `:`)
 *
 * Les espaces DANS les valeurs string JSON sont préservés car ils sont
 * encadrés par des guillemets, que nous ne touchons jamais.
 */
function flattenJsonLikeString(value) {
  if (typeof value !== "string") return value
  if (!value.includes("\n") && !value.includes("\r")) return value

  // Découpe par les guillemets doubles pour isoler les segments "dans un string JSON"
  // des segments "structure JSON". Les indices pairs = structure, impairs = contenu string.
  const parts = value.split('"')

  for (let i = 0; i < parts.length; i += 2) {
    // Segment de structure : on peut collapser librement
    parts[i] = parts[i]
      .replace(/[\r\n]+/g, " ") // retours à la ligne → espace
      .replace(/\s+/g, " ")     // espaces multiples → un seul
      .replace(/\s*([,\[\]{}:])\s*/g, "$1") // espaces autour des séparateurs JSON
  }

  return parts.join('"')
}

/**
 * Plugin remark.
 *
 * Parcourt l'AST à la recherche des nœuds `mdxJsxFlowElement` et
 * `mdxJsxTextElement` (les composants JSX dans MDX), et aplatit
 * chaque attribut string multi-ligne.
 */
export default function remarkFlattenMdxAttrs() {
  return (tree) => {
    visit(
      tree,
      ["mdxJsxFlowElement", "mdxJsxTextElement"],
      (node) => {
        if (!Array.isArray(node.attributes)) return

        for (const attr of node.attributes) {
          // Seuls les attributs nommés avec une valeur string nous intéressent.
          // Les mdxJsxExpressionAttribute ({...spread}) et les attributs à valeur
          // expression ({expr}) sont ignorés : ils sont déjà droppés par le pipeline.
          if (attr.type !== "mdxJsxAttribute") continue
          if (typeof attr.value !== "string") continue

          attr.value = flattenJsonLikeString(attr.value)
        }
      }
    )
  }
}