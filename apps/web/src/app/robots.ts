import type { MetadataRoute } from "next";

import { SITE_URL } from "@/config/siteUrl";

/**
 * robots.txt généré par Next.
 *
 * Autorise l'indexation du site vitrine, exclut les espaces PRIVÉS ou
 * fonctionnels (tableau de bord, profil, documents membres, espaces
 * collaboratifs, API), et déclare le sitemap. Une page éditoriale non publiée
 * (placeholder « en construction », servi à la même adresse) n'est pas exclue
 * ici : elle porte elle-même un `noindex` (editorialRobots).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/profil",
        "/documents",
        "/mes-espaces",
        "/api/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
