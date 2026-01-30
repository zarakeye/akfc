'use client';

import { useState, useCallback } from 'react';

/**
 * A hook that provides an API for drag-and-drop functionality.
 *
 * It provides the following properties:
 * - `draggedItem`: the ID of the item currently being dragged, or `null` if no item is being dragged.
 * - `onDragStart`: a callback that should be called when the user starts dragging an item. It takes the ID of the item being dragged as an argument.
 * - `onDragEnd`: a callback that should be called when the user stops dragging an item.
 * - `onDrop`: a callback that should be called when the user drops an item on a target. It takes the ID of the item being dropped and the ID of the target as arguments.
 *
 * @returns an object with the above mentioned properties.
 */
export function useDragAndDrop() {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const onDragStart = useCallback((id: string) => {
    setDraggedItem(id);
  }, []);

  const onDragEnd = useCallback(() => {
    setDraggedItem(null);
  }, []);

  const onDrop = useCallback((targetId: string, callback: (draggedId: string, targetId: string) => void) => {
    if (draggedItem) {
      callback(draggedItem, targetId);
      setDraggedItem(null);
    }
  }, [draggedItem]);

  return { draggedItem, onDragStart, onDragEnd, onDrop };
}