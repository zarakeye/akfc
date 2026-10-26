/**
 * Identifiant de l'emplacement des boutons flottants de la documentation (voir docsActions.tsx).
 * Dans un module ordinaire, pas dans le module client : un composant serveur (DocsLayout) qui
 * importe une constante d'un fichier « use client » reçoit une référence client, pas la chaîne.
 */
export const DOCS_ACTIONS_ID = "docs-floating-actions";
