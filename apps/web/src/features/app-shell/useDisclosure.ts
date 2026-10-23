"use client";

import { useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent } from "react";

/**
 * Menu déroulant du header, utilisable à la souris ET au clavier (modèle « disclosure navigation »
 * des pratiques WAI-ARIA).
 *
 * - Souris : ouverture au survol, fermeture en sortant, comme avant.
 * - Clavier : le titre est un vrai `<button>` (atteint par Tab), qui ouvre et ferme par Entrée ou
 *   Espace et annonce son état (`aria-expanded`). Échap ferme et rend le curseur au bouton ; quitter
 *   le menu avec Tab le ferme.
 * - Clic ailleurs dans la page : ferme.
 *
 * Un clic de SOURIS sur le titre n'inverse pas l'état : le survol a déjà ouvert le menu, l'inverser
 * le refermerait sous le pointeur. Seul un « clic » produit par le clavier (Entrée, Espace :
 * `detail === 0`) bascule.
 */
export function useDisclosure() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  // Clic ou appui hors du menu : fermeture. Un effet est ici à sa place : il synchronise React
  // avec un système extérieur (les évènements du document), et seulement tant que le menu est ouvert.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent): void => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return {
    open,
    close: (): void => setOpen(false),
    /** À poser sur l'élément qui contient le bouton ET le menu. */
    rootProps: {
      ref: rootRef,
      onMouseEnter: (): void => setOpen(true),
      onMouseLeave: (): void => setOpen(false),
      onKeyDown: (e: KeyboardEvent): void => {
        if (e.key === "Escape" && open) {
          e.stopPropagation();
          setOpen(false);
          buttonRef.current?.focus();
        }
      },
      onBlur: (e: FocusEvent): void => {
        // Le curseur clavier sort du menu (vers un élément extérieur, ou nulle part).
        if (!rootRef.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      },
    },
    /** À poser sur le `<button>` titre du menu. */
    buttonProps: {
      ref: buttonRef,
      type: "button" as const,
      "aria-expanded": open,
      "aria-controls": menuId,
      onClick: (e: MouseEvent): void => {
        if (e.detail === 0) setOpen((o) => !o);
        else setOpen(true);
      },
    },
    /** À poser sur le conteneur des liens du menu. */
    menuProps: { id: menuId },
  };
}
