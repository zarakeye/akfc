import type { MetadataRoute } from "next";

import { IS_DEMO, SITE_URL } from "#config/siteUrl.ts";

// Calculé à chaque requête : une démo se reconnaît au lancement (DEMO_MODE), pas au build.
export const dynamic = "force-dynamic";

/**
 * robots.txt généré par Next.
 *
 * Autorise l'indexation du site vitrine, exclut les espaces PRIVÉS ou
 * fonctionnels (tableau de bord, profil, documents membres, espaces
 * collaboratifs, dépôt, API), et déclare le sitemap. Les fichiers PUBLICS des pages (images, logo,
 * avatars) restent permis : un moteur qui affiche une page a besoin de ses images, et un fichier
 * public n'a rien à cacher. Une page éditoriale non publiée
 * (placeholder « en construction », servi à la même adresse) n'est pas exclue
 * ici : elle porte elle-même un `noindex` (editorialRobots).
 */
export default function robots(): MetadataRoute.Robots {
  // Une démo n'a rien à faire dans un moteur de recherche : tout est interdit, sans sitemap.
  if (IS_DEMO) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: {
      userAgent: "*",
      // La règle la plus précise l'emporte : `/api/media/public/` passe malgré `/api/`.
      allow: ["/", "/api/media/public/", "/api/media/site-logo"],
      disallow: [
        "/dashboard",
        "/profil",
        "/documents",
        "/mes-espaces",
        "/deposer",
        "/autorisation-parent",
        "/date-de-naissance-parent",
        "/api/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
