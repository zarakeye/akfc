/*
 * Ce qui fait défiler la documentation. D'ordinaire, c'est la colonne centrale
 * (#docs-content-scroll) : le titre, au-dessus, et les liens « Précédent / Suivant », en dessous,
 * restent en place. Sur un écran bas (téléphone en paysage), ils défilent avec le texte pour lui
 * laisser la hauteur : c'est alors la section entière ([data-docs-scroller]) qui défile.
 * La table des matières et les boutons haut / bas passent par ici pour viser le bon élément.
 */

export function getDocsScroller(): HTMLElement | null {
  const column = document.getElementById("docs-content-scroll");
  if (!column) return null;
  // La colonne défile si elle le peut : défilement permis ET contenu plus haut qu'elle.
  const overflow = getComputedStyle(column).overflowY;
  if ((overflow === "auto" || overflow === "scroll") && column.scrollHeight > column.clientHeight + 1) return column;
  return column.closest<HTMLElement>("[data-docs-scroller]") ?? column;
}

/** Position d'un élément dans le défilement d'un conteneur (indépendante des éléments positionnés entre eux). */
export function offsetWithin(element: HTMLElement, container: HTMLElement): number {
  return element.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
}

/** Écoute le défilement de la documentation, quel que soit l'élément qui défile (phase de capture). */
export function onDocsScroll(listener: () => void): () => void {
  document.addEventListener("scroll", listener, { capture: true, passive: true });
  window.addEventListener("resize", listener);
  return () => {
    document.removeEventListener("scroll", listener, { capture: true });
    window.removeEventListener("resize", listener);
  };
}
