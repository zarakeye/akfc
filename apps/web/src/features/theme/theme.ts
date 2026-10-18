/**
 * Thème clair / sombre.
 *
 * Le thème est une classe `dark` sur <html> : les variables de couleur de globals.css
 * (`--background`, `--foreground`, `--card`…) ont une valeur claire par défaut et une valeur
 * sombre sous `.dark`. Par défaut, le site reste CLAIR.
 *
 * Le choix du visiteur est gardé dans un COOKIE, et non dans localStorage : le layout racine,
 * rendu sur le serveur, le lit et pose la classe dès le HTML envoyé. La page arrive donc
 * directement dans le bon thème — pas de « flash » clair le temps que React démarre, et aucun
 * script à exécuter avant l'hydratation.
 */
export type Theme = "light" | "dark";

export const THEME_COOKIE = "akfc-theme";

export function readTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
  // Un an ; lisible par le serveur (pas HttpOnly : c'est une préférence d'affichage, pas un secret).
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=31536000; samesite=lax`;
}

/** Abonnement aux changements de la classe de <html> (deux interrupteurs restent d'accord). */
export function subscribeTheme(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
