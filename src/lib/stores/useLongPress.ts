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
  delay: number = 2000
): {
  onMouseDown: () => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
} {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  /**
   * Starts the timer for the long press event. If the user releases the mouse button or moves the mouse out of the element before the delay, the onLongPress function is not called.
   */
  const start = () => {
    timerRef.current = setTimeout(onLongPress, delay);
  };

  /**
   * Cancels the long press event. If the user releases the mouse button or moves the mouse out of the element before the delay, the onLongPress function is not called.
   */
  const cancel = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return {
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel
  };
}