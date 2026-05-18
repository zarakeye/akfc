import { useRef } from 'react';

/**
 * 🖱️ Hook longPress : déclenche `onLongPress` quand l'utilisateur appuie
 * (souris ou tactile) et maintient sans relâcher pendant `delay` ms.
 *
 * 🔁 Pourquoi ce hook plutôt qu'un simple `setTimeout` dans le composant ?
 *
 * 1. **Annulation robuste**. Si l'utilisateur déclenche un drag, perd le focus,
 *    ou relâche en dehors de l'élément, on doit absolument annuler le timer.
 *    On enregistre des listeners *globaux* sur `window` pour `mouseup`, `blur`,
 *    `dragstart` et `touchend` : peu importe où l'évènement de fin a lieu,
 *    on capture l'annulation.
 *
 * 2. **Cleanup déterministe**. On garde une ref vers une fonction de cleanup
 *    qui détache tous les listeners ; elle est appelée systématiquement au
 *    démarrage d'un nouveau timer, à l'annulation, et au déclenchement du
 *    callback. Pas de fuite, pas de listener orphelin.
 *
 * 3. **Pas de re-render**. On utilise des `useRef` (pas de `useState`) pour
 *    le timer et le cleanup : changer ces valeurs ne provoque aucun re-render
 *    du composant qui appelle ce hook.
 *
 * 🎯 Utilisation :
 * ```tsx
 * const handlers = useLongPress(() => enterMultiSelect(item.id));
 * return <li {...handlers}>{item.name}</li>;
 * ```
 *
 * @param onLongPress fonction à appeler si l'appui dure assez longtemps
 * @param delay durée requise en millisecondes (défaut : 1500ms)
 */
export function useLongPress(
  onLongPress: () => void,
  delay: number = 1500
): {
  onMouseDown: () => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onTouchStart: () => void;
  onTouchEnd: () => void;
  onDragStart: () => void;
} {
  // Référence au timer en cours (null si aucun timer actif).
  const timerRef = useRef<number | null>(null);

  // Référence à la fonction qui détache les listeners window. On garde
  // cette indirection pour pouvoir annuler proprement depuis n'importe
  // quel chemin (cancel direct, déclenchement du callback, etc.).
  const cleanupWindowListenersRef = useRef<(() => void) | null>(null);

  /**
   * Annule le timer en cours et détache les listeners window.
   * Idempotent : on peut l'appeler plusieurs fois sans danger.
   */
  const cancel = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (cleanupWindowListenersRef.current) {
      cleanupWindowListenersRef.current();
      cleanupWindowListenersRef.current = null;
    }
  };

  /**
   * Démarre le timer du long press.
   *
   * On commence par appeler `cancel()` pour invalider un éventuel timer
   * précédent (cas où l'utilisateur clique très vite plusieurs fois).
   *
   * Ensuite on installe des listeners globaux qui annuleront le timer
   * dès qu'un évènement de fin se produit, où qu'il soit dans la page.
   */
  const start = () => {
    cancel();

    timerRef.current = window.setTimeout(() => {
      // Le callback est sur le point d'être déclenché : on nettoie les
      // listeners window avant, pour éviter d'annuler le mode qu'on
      // vient juste d'activer (ex: le mouseup qui suit immédiatement).
      timerRef.current = null;

      if (cleanupWindowListenersRef.current) {
        cleanupWindowListenersRef.current();
        cleanupWindowListenersRef.current = null;
      }

      onLongPress();
    }, delay);

    // ✅ Annulation robuste : tout évènement de fin globale annule le timer.
    const onAnyEnd = () => cancel();

    window.addEventListener('mouseup', onAnyEnd, true);
    window.addEventListener('blur', onAnyEnd, true);
    window.addEventListener('dragstart', onAnyEnd, true);
    window.addEventListener('touchend', onAnyEnd, true);

    cleanupWindowListenersRef.current = () => {
      window.removeEventListener('mouseup', onAnyEnd, true);
      window.removeEventListener('blur', onAnyEnd, true);
      window.removeEventListener('dragstart', onAnyEnd, true);
      window.removeEventListener('touchend', onAnyEnd, true);
    };
  };

  return {
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: cancel,
    onDragStart: cancel,
  };
}