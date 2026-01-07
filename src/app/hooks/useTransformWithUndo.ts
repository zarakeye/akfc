'use client';

import { useRef, useState } from 'react';

type UseTransformWithUndoOptions = {
  commitDelay?: number; // ms
};

export function useTransformWithUndo<T>(
  initialValue: T,
  options: UseTransformWithUndoOptions = {}
) {
  const { commitDelay = 300 } = options;

  const [value, setValue] = useState<T>(initialValue);
  const [history, setHistory] = useState<T[]>([]);

  const interactionStartRef = useRef<T | null>(null);
  const interactionStartTimeRef = useRef<number | null>(null);

  /** ⚡ Appelé au début d’un geste (mousedown / touchstart / focus) */
  const startInteraction = () => {
    if (interactionStartRef.current === null) {
      interactionStartRef.current = value;
      interactionStartTimeRef.current = Date.now();
    }
  };

  /** ⚡ Appelé à chaque changement */
  const update = (nextValue: T) => {
    setValue(nextValue);
  };

  /** ⚡ Appelé à la fin d’un geste (mouseup / touchend / blur) */
  const endInteraction = () => {
    const startValue = interactionStartRef.current;
    const startTime = interactionStartTimeRef.current;

    if (startValue !== null && startTime !== null) {
      const duration = Date.now() - startTime;

      if (duration >= commitDelay) {
        setHistory((h) => [...h, startValue]);
      }
    }

    interactionStartRef.current = null;
    interactionStartTimeRef.current = null;
  };

  /**
   * Undoes the last transformation.
   * If there is no transformation to undo, it does nothing.
   * @returns {void}
   */
  const undo = () => {
    setHistory((h) => {
      const last = h[h.length - 1];
      if (last !== undefined) {
        setValue(last);
        return h.slice(0, -1);
      }
      return h;
    });
  };

  const reset = () => {
    setValue(initialValue);
    setHistory([]);
    interactionStartRef.current = null;
    interactionStartTimeRef.current = null;
  };

  return {
    value,
    set: update,
    undo,
    reset,
    startInteraction,
    endInteraction,
  };
}
