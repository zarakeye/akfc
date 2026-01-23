'use client';

import { useState, useCallback } from 'react';

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