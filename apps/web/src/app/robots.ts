import type { MetadataRoute } from "next";

import { SITE_URL } from "@/config/siteUrl";

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
        "/api/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
