'use client';

import type { CropGrid } from '@/types/cropper';

type Props = {
  grid: CropGrid;
};

export default function CropMaskOverlay({ grid }: Props) {
  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width="100%"
      height="100%"
    >
      <defs>
        <mask id="crop-mask">
          {/* zone visible */}
          <rect x="0" y="0" width="100%" height="100%" fill="white" />

          {/* trou (invisible) */}
          <rect
            x={grid.x}
            y={grid.y}
            width={grid.width}
            height={grid.height}
            fill="black"
          />
        </mask>
      </defs>

      {/* overlay sombre */}
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="rgba(0,0,0,0.6)"
        mask="url(#crop-mask)"
      />
    </svg>
  );
}
