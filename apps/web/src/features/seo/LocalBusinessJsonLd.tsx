import type { JSX } from "react";
import { SITE_URL } from "@/config/siteUrl";

/**
 * Données structurées (schema.org) de l'AKFC — type SportsActivityLocation
 * (sous-type de LocalBusiness). Donne à Google, de façon machine-lisible :
 * l'entité (nom + sigle développé), l'adresse (MJC de Chambéry), la géoloc,
 * les disciplines et la zone desservie (Chambéry + agglo, Savoie, Isère).
 * À monter sur l'accueil. `sameAs`/`telephone` ajoutables plus tard.
 */
export function LocalBusinessJsonLd(): JSX.Element {
  const data = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: "AKFC",
    alternateName: "Association Kung-Fu Chambéry",
    description:
      "Association de kung-fu à Chambéry : cours de kung-fu (tchoy-lee-fut), taï-chi-chuan, kali et arts martiaux chinois, pour tous publics, à la MJC de Chambéry.",
    url: SITE_URL,
    image: `${SITE_URL}/og-default.png`,
    sport: ["Kung-fu", "Taï-chi-chuan", "Kali", "Arts martiaux chinois"],
    address: {
      "@type": "PostalAddress",
      name: "MJC de Chambéry",
      streetAddress: "311 Faubourg Montmélian",
      postalCode: "73000",
      addressLocality: "Chambéry",
      addressRegion: "Savoie",
      addressCountry: "FR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 45.5664,
      longitude: 5.93008,
    },
    areaServed: [
      { "@type": "City", name: "Chambéry" },
      { "@type": "City", name: "La Motte-Servolex" },
      { "@type": "City", name: "Cognin" },
      { "@type": "City", name: "Jacob-Bellecombet" },
      { "@type": "City", name: "Barberaz" },
      { "@type": "City", name: "La Ravoire" },
      { "@type": "City", name: "Challes-les-Eaux" },
      { "@type": "City", name: "Bassens" },
      { "@type": "City", name: "Saint-Alban-Leysse" },
      { "@type": "AdministrativeArea", name: "Savoie" },
      { "@type": "AdministrativeArea", name: "Isère" },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
