import type { MetadataRoute } from "next";

import { SITE_URL } from "@/config/siteUrl";

/**
 * robots.txt généré par Next.
 *
 * Autorise l'indexation du site vitrine, exclut les espaces PRIVÉS ou
 * fonctionnels (tableau de bord, profil, documents membres, espaces
 * collaboratifs, placeholder « en construction », API), et déclare le sitemap.
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
        "/en-construction",
        "/api/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
