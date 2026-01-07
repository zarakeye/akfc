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
      const start = dragStart.current;
      const workspace = workspaceRef.current;

      if (!start || !workspace) return;

      const dx = e.clientX - start.mouseX;
      const dy = e.clientY - start.mouseY;

      const workspaceRect = workspace.getBoundingClientRect();

      setGrid((prev) => ({
        ...prev,
        x: Math.min(
          Math.max(start.gridX + dx, 0),
          workspaceRect.width - prev.width
        ),
        y: Math.min(
          Math.max(start.gridY + dy, 0),
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
      className="absolute border  pointer-events-auto cursor-move select-none"
      style={{
        left: grid.x,
        top: grid.y,
        width: grid.width,
        height: grid.height,
      }}
    >
      {/* Grid lines 3x3 */}
      <div className="w-full h-full grid grid-cols-3 grid-rows-3 ">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="border border-gray-300" />
        ))}
      </div>
    </div>
  );
}