import { useRef } from "react";

/**
 * Returns an object with three functions: onMouseDown, onMouseUp and onMouseLeave.
 * When the user presses the mouse button and holds it for the given delay,
 * the onLongPress function is called. If the user releases the mouse button
 * or moves the mouse out of the element before the delay, the onLongPress
 * function is not called.
 * @param {() => void} onLongPress The function to call when the user has pressed the mouse button for the given delay.
 * @param {number} delay The delay in milliseconds before calling onLongPress. Defaults to 2000.
 * @returns {{ onMouseDown: () => void, onMouseUp: () => void, onMouseLeave: () => void }}
 */
export function useLongPress(
  onLongPress: () => void,
  delay: number = 1500
): {
  onMouseDown: () => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onDragStart: () => void 
} {
  const timerRef = useRef<number | null>(null);

  const cleanupWindowListenersRef = useRef<(() => void) | null>(null);

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
   * Starts the timer for the long press event. If the user releases the mouse button or moves the mouse out of the element before the delay, the onLongPress function is not called.
   */
  const start = () => {
    cancel();

    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;

      if (cleanupWindowListenersRef.current) {
        cleanupWindowListenersRef.current();
        cleanupWindowListenersRef.current = null;
      }

      onLongPress();
    }, delay);

    // ✅ Annulation robuste (mouseup/blur/dragstart)
    const onAnyEnd = () => cancel();

    window.addEventListener("mouseup", onAnyEnd, true);
    window.addEventListener("blur", onAnyEnd, true);
    window.addEventListener("dragstart", onAnyEnd, true);
    window.addEventListener("touchend", onAnyEnd, true);
    
    cleanupWindowListenersRef.current = () => {
      window.removeEventListener("mouseup", onAnyEnd, true);
      window.removeEventListener("blur", onAnyEnd, true);
      window.removeEventListener("dragstart", onAnyEnd, true);
      window.removeEventListener("touchend", onAnyEnd, true);
    };
  };

  return {
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
    onDragStart: cancel
  };
}