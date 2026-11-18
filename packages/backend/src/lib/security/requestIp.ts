/**
 * Adresse IP du visiteur, lue dans les en-têtes posés par le proxy (Caddy, en production).
 * Partagée par le contexte tRPC et les server actions, qui reçoivent les mêmes en-têtes.
 * Indicative seulement : un client peut écrire ces en-têtes lui-même, rien ne doit en dépendre
 * pour la sécurité (voir la limite d'essais de connexion, indexée sur l'adresse e-mail).
 */
export function getRequestIp(headers: Headers): string | null {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp;

  return null;
}
