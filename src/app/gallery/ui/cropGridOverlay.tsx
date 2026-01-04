'use client';

import { useEffect, useRef, useState } from 'react';
import type { CropGrid } from '@/types/cropper';

type Props = {
  grid: CropGrid;
  setGrid: React.Dispatch<React.SetStateAction<CropGrid>>;
  workspaceRef: React.RefObject<HTMLDivElement | null>;
};

export default function CropGridOverlay({
  grid,
  setGrid,
  workspaceRef,
}: Props) {
  // const dragging = useRef<boolean>(false);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const dragStart = useRef<{
    mouseX: number;
    mouseY: number;
    gridX: number;
    gridY: number;
  } | null>(null);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();

    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      gridX: grid.x,
      gridY: grid.y,
    };
  };


  // const [workspaceRect, setWorkspaceRect] = useState<DOMRect | null>(null);

  /* 📐 mesurer le workspace une fois monté */
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragStart.current || !workspaceRef.current) return;
      
      const dx = e.clientX - dragStart.current.mouseX;
      const dy = e.clientY - dragStart.current.mouseY;

      const workspaceRect = workspaceRef.current.getBoundingClientRect();

      setGrid((prev) => ({
        ...prev,
        x: Math.min(
          Math.max(dragStart.current!.gridX + dx, 0),
          workspaceRect.width - prev.width
        ),
        y: Math.min(
          Math.max(dragStart.current!.gridY + dy, 0),
          workspaceRect.height - prev.height
        ),
      }));
    };

    const onMouseUp = () => {
      dragStart.current = null;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [setGrid, workspaceRef]);

  return (
    <div
      ref={gridRef}
      onMouseDown={onMouseDown}
      className="absolute border-2 border-gray-400 pointer-events-auto cursor-move select-none"
      style={{
        left: grid.x,
        top: grid.y,
        width: grid.width,
        height: grid.height,
        background: `rgba(255, 255, 255, 0.5)`,
      }}
    >
      {/* Grid lines 3x3 */}
      <div className="w-full h-full grid grid-cols-3 grid-rows-3 border border-gray-400">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="border border-gray-400/50" />
        ))}
      </div>
    </div>
  );
}