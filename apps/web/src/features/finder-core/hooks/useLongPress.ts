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
 * @param delay durée requise en millisecondes (défaut : 500ms)
 *
 * ⏱️ Pourquoi 500ms et non 1500 : iOS déclenche l'appui long vers 500ms,
 * Android entre 400 et 500. À 1500ms, l'usager a relâché bien avant et
 * conclut que le geste n'existe pas — le comportement était donc
 * inatteignable en pratique sur écran tactile.
 *
 * Le hook sert aussi à la souris, où l'équivalent est le clic droit :
 * raccourcir ne gêne pas, un maintien d'une demi-seconde restant volontaire.
 */
export function useLongPress(
  onLongPress: () => void,
  delay: number = 500
): {
  onMouseDown: () => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onTouchStart: () => void;
  onTouchEnd: () => void;
  onDragStart: () => void;
  /**
   * Lit ET reset le flag "le longpress vient juste de tirer".
   *
   * 🎯 Pourquoi ce flag
   *
   * Sans lui, la séquence d'un longpress dans la TreeView est :
   *   1. mousedown → timer démarré
   *   2. 500ms écoulés → callback firé → mode multi-select activé + node
   *      ajouté à la sélection
   *   3. mouseup → le DOM émet un `click` sur le div parent
   *   4. Le `onClick` du div fait `toggleSelect(node.id)` (en mode multi) →
   *      le node qu'on vient juste de sélectionner est DÉSÉLECTIONNÉ
   *
   * Résultat : l'utilisateur fait un longpress, voit le mode multi-select
   * s'activer, mais le node ciblé disparaît de la sélection instantanément.
   *
   * Fix : le handler `onClick` du div parent appelle `consumeJustFired()` en
   * début. Si vrai, il return immédiatement — le click "fantôme" qui suit le
   * longpress est avalé. Les clicks SUIVANTS (vrais clicks utilisateur)
   * traversent normalement.
   *
   * Sémantique "consume" : on lit ET on reset à `false`. Comme ça, même
   * si le click suivant n'arrive pas (cas pathologique), un click ultérieur
   * ne sera pas silencieusement avalé.
   */
  consumeJustFired: () => boolean;
} {
  // Référence au timer en cours (null si aucun timer actif).
  const timerRef = useRef<number | null>(null);

  // Référence à la fonction qui détache les listeners window. On garde
  // cette indirection pour pouvoir annuler proprement depuis n'importe
  // quel chemin (cancel direct, déclenchement du callback, etc.).
  const cleanupWindowListenersRef = useRef<(() => void) | null>(null);

  // Flag "le callback a tiré juste à l'instant". Consommé par le handler
  // de click du composant parent pour avaler le click parasite qui suit
  // le mouseup d'un longpress. Cf. doc dans le type de retour.
  const didJustFireRef = useRef(false);

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
    // Reset le flag : un nouveau cycle commence, les anciens "justFired"
    // qui n'auraient pas été consommés sont obsolètes.
    didJustFireRef.current = false;

    timerRef.current = window.setTimeout(() => {
      // Le callback est sur le point d'être déclenché : on nettoie les
      // listeners window avant, pour éviter d'annuler le mode qu'on
      // vient juste d'activer (ex: le mouseup qui suit immédiatement).
      timerRef.current = null;

      if (cleanupWindowListenersRef.current) {
        cleanupWindowListenersRef.current();
        cleanupWindowListenersRef.current = null;
      }

      // Marqueur pour que le click parasite qui suit immédiatement le
      // mouseup soit avalé par le composant parent via consumeJustFired().
      didJustFireRef.current = true;

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
    consumeJustFired: () => {
      const v = didJustFireRef.current;
      didJustFireRef.current = false;
      return v;
    },
  };
}
