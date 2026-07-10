/**
 * @workspace/finder-core
 *
 * Logique du Finder partagée entre les plateformes (web Next.js et mobile
 * Expo/React Native). Ce package ne contient AUCUN code de rendu (pas de DOM,
 * pas de composant React de présentation) — uniquement de l'état et de la
 * logique portable, consommables par n'importe quelle couche de vue.
 *
 * Premier membre : le store du panier de sélection média (`usePickerCartStore`),
 * source de vérité unique du panier, partagée par la GridView et la TreeView
 * (web), et plus tard par les vues mobiles.
 */

export * from "./cart/usePickerCartStore";