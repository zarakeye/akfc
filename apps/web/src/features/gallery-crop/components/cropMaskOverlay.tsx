'use client';

import type { CropGrid, Shape } from '@/features/gallery-crop/types/cropper.types';

type Props = {
  grid: CropGrid;
  shape?: Shape;
};

export default function CropMaskOverlay({ grid, shape = 'rect' }: Props) {
  return (
    <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
      <defs>
        <mask id="crop-mask">
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          {shape === 'circle' ? (
            <circle
              cx={grid.x + grid.width / 2}
              cy={grid.y + grid.height / 2}
              r={Math.min(grid.width, grid.height) / 2}
              fill="black"
            />
          ) : (
            <rect x={grid.x} y={grid.y} width={grid.width} height={grid.height} fill="black" />
          )}
        </mask>
      </defs>
      <rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#crop-mask)" />
    </svg>
  );
}
