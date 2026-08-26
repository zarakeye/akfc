/**
 * URL absolue du site en production — source UNIQUE pour les métadonnées SEO
 * (`metadataBase`), le robots.txt et le sitemap.xml.
 *
 * Surchargeable par `NEXT_PUBLIC_SITE_URL` (préprod, domaine alternatif) ;
 * défaut = domaine de prod. Le slash final est retiré pour composer des URLs
 * propres (`${SITE_URL}/gallery`).
 */
export const SITE_URL: string = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://akfc.fr"
).replace(/\/+$/, "");
