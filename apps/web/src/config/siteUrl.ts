/**
 * URL absolue du site — source UNIQUE pour les métadonnées SEO (`metadataBase`), le robots.txt
 * et le sitemap.xml.
 *
 * Dans l'ordre :
 * - `SITE_URL`, lue AU LANCEMENT : une même image sert à une autre adresse (une démo, par
 *   exemple). Lue par `runtimeEnv` et non `process.env.…`, que Next ne remplace pas au build ;
 * - `NEXT_PUBLIC_SITE_URL`, FIGÉE AU BUILD (Next la remplace par sa valeur) : le développement
 *   et les tests ;
 * - le domaine de production.
 *
 * Le slash final est retiré pour composer des URLs propres (`${SITE_URL}/gallery`).
 */
const runtimeEnv = process.env;
export const SITE_URL: string = (
  runtimeEnv.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://akfc.fr"
).replace(/\/+$/, "");

/** Une instance de démonstration (`DEMO_MODE=1`, lu au lancement) : jamais indexée. */
export const IS_DEMO: boolean = runtimeEnv.DEMO_MODE === "1";
