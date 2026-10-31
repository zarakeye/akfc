/**
 * Racine du stockage, lue par le navigateur (explorateur) ET par le backend (contexte tRPC) :
 * `NEXT_PUBLIC_`, donc figée au build. Même valeur, même repli que `APP_SHORT_NAME`, lue au
 * démarrage par instrumentation.ts : si l'argument de build manque, les deux tombent d'accord.
 */
export const APP_ROOT = process.env.NEXT_PUBLIC_APP_SHORT_NAME || "AKFC";