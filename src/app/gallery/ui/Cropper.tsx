'use client';

import { useEffect, useRef, useState } from 'react';
import type { CropperProps, CropGrid } from '@/types/cropper';
import CropGridOverlay from './cropGridOverlay';
import CropMaskOverlay from './cropMaskOverlay';
import untranformImageRect from './untranformImageRect';
import { useTransformWithUndo } from '@/app/hooks/useTransformWithUndo';

export default function Cropper({ picture, onCrop, onCancel }: CropperProps) {
  const exportCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const workspaceRef = useRef<HTMLDivElement | null>(null);

  const zoom = useTransformWithUndo(1, { commitDelay: 250 });
  const rotation = useTransformWithUndo(0, { commitDelay: 250 });

  const [grid, setGrid] = useState<CropGrid>({
    x: 150,
    y: 150,
    width: 200,
    height: 200,
  });

  /** ⚡ Preview live */
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    const workspace = workspaceRef.current;
    if (!canvas || !workspace) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = picture.previewUrl;

    const workspaceRect = workspace.getBoundingClientRect();

    img.onload = () => {
      const domToImageScaleX = img.width / workspaceRect.width;
      const domToImageScaleY = img.height / workspaceRect.height;

      const gridInImagePixels: CropGrid = {
        x: grid.x * domToImageScaleX,
        y: grid.y * domToImageScaleY,
        width: grid.width * domToImageScaleX,
        height: grid.height * domToImageScaleY,
      };

      const imageRect = untranformImageRect(
        gridInImagePixels,
        { width: img.width, height: img.height },
        { scale: zoom.value, rotation: rotation.value }
      );

      const size = 120;
      canvas.width = size;
      canvas.height = size;

      ctx.clearRect(0, 0, size, size);
      ctx.save();
      ctx.translate(size / 2, size / 2);
      ctx.rotate((rotation.value * Math.PI) / 180);

      const scale = size / Math.max(imageRect.width, imageRect.height);

      ctx.drawImage(
        img,
        imageRect.x,
        imageRect.y,
        imageRect.width,
        imageRect.height,
        -imageRect.width / 2 * scale,
        -imageRect.height / 2 * scale,
        imageRect.width * scale,
        imageRect.height * scale
      );

      ctx.restore();
    };
  }, [zoom.value, rotation.value, grid, picture.previewUrl]);

  /** ⚡ Crop final */
  const handleCrop = () => {
    const canvas = exportCanvasRef.current;
    const workspace = workspaceRef.current;
    if (!canvas || !workspace) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = picture.previewUrl;

    const workspaceRect = workspace.getBoundingClientRect();

    img.onload = () => {
      const domToImageScaleX = img.width / workspaceRect.width;
      const domToImageScaleY = img.height / workspaceRect.height;

      const gridInImagePixels: CropGrid = {
        x: grid.x * domToImageScaleX,
        y: grid.y * domToImageScaleY,
        width: grid.width * domToImageScaleX,
        height: grid.height * domToImageScaleY,
      };

      const imageRect = untranformImageRect(
        gridInImagePixels,
        { width: img.width, height: img.height },
        { scale: zoom.value, rotation: rotation.value }
      );

      canvas.width = imageRect.width;
      canvas.height = imageRect.height;

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation.value * Math.PI) / 180);

      ctx.drawImage(
        img,
        imageRect.x,
        imageRect.y,
        imageRect.width,
        imageRect.height,
        -canvas.width / 2,
        -canvas.height / 2,
        canvas.width,
        canvas.height
      );

      ctx.restore();

      canvas.toBlob((blob) => {
        if (!blob) return;
        onCrop({
          pictureId: picture.id,
          croppedFile: new File([blob], picture.file.name, {
            type: 'image/png',
            lastModified: Date.now(),
          }),
        });
      }, 'image/png');
    };
  };

  const resetAll = () => {
    zoom.reset();
    rotation.reset();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-start justify-center z-50 p-4">
      <div className="bg-white p-4 rounded shadow gap-4">
        <div className="flex gap-4">
          <div
            ref={workspaceRef}
            className="relative w-[500px] h-[500px] overflow-hidden bg-checkerboard"
          >
            <img
              src={picture.previewUrl}
              className="absolute w-full h-full object-contain pointer-events-none"
              style={{
                transform: `scale(${zoom.value}) rotate(${rotation.value}deg)`,
              }}
            />
            <CropMaskOverlay grid={grid} />
            <CropGridOverlay grid={grid} setGrid={setGrid} workspaceRef={workspaceRef} />
          </div>

          <canvas ref={previewCanvasRef} className="border w-32 h-32" />
        </div>

        <div className="flex gap-6 mt-4">
          {/* Zoom */}
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0.1}
              max={3}
              step={0.01}
              value={zoom.value}
              onMouseDown={zoom.startInteraction}
              onMouseUp={zoom.endInteraction}
              onChange={(e) => zoom.set(Number(e.target.value))}
            />
            <button onClick={zoom.undo}>undo</button>
            <button onClick={zoom.reset}>reset</button>
          </div>

          {/* Rotation */}
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              value={rotation.value}
              onMouseDown={rotation.startInteraction}
              onMouseUp={rotation.endInteraction}
              onChange={(e) => rotation.set(Number(e.target.value))}
            />
            <button onClick={rotation.undo}>undo</button>
            <button onClick={rotation.reset}>reset</button>
          </div>

          <button onClick={resetAll} className="px-3 py-1 bg-red-500 text-white rounded">
            Reset all
          </button>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onCancel}>Annuler</button>
          <button onClick={handleCrop} className="bg-blue-600 text-white px-3 py-1 rounded">
            Cropper
          </button>
        </div>
      </div>

      <canvas ref={exportCanvasRef} className="hidden" />
    </div>
  );
}
