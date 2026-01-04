'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import * as Slider from '@radix-ui/react-slider';
import { Check, X } from 'lucide-react';
import { PictureItem } from '@/types/picture';
import type { CropperProps, CropGrid } from '@/types/cropper';
import CropGridOverlay from './cropGridOverlay';
import CropMaskOverlay from './cropMaskOverlay';

type CropGridOverlayProps = {
  grid: CropGrid;
  setGrid: (grid: CropGrid) => void;
  workspaceRef: React.RefObject<HTMLDivElement>;
};

export default function Cropper({
  picture,
  onCrop,
  onCancel,
}: CropperProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Transformations
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  
  // Crop grid
  const [grid, setgrid] = useState<CropGrid>({
    x: 50,
    y: 50,
    width: 200,
    height: 200,
  });
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = picture.previewUrl;
    img.onload = () => {
      // Dimensions fixes pour le MVP
      const cropSize = 300;

      canvas.height = cropSize;
      canvas.width = cropSize;

      // centrer l'image
      const sx = Math.max(0, (img.width - cropSize) / 2);
      const sy = Math.max(0, (img.height - cropSize) / 2);

      ctx.clearRect(0, 0, cropSize, cropSize);
      ctx.drawImage(
        img,
        sx,
        sy,
        cropSize,
        cropSize,
        0,
        0,
        cropSize,
        cropSize
      );
    };
  }, [picture]);

  const handleCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const croppedFile = new File([blob], picture.file.name, {
        type: 'image/png',
        lastModified: Date.now(),
      });
      onCrop({
        pictureId: picture.id,
        croppedFile
      });
    }, 'image/png');
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded shadow w-[550px]">
        <div
          ref={workspaceRef}
          className="relative w-[500px] h-[500px] overflow-hidden bg-[#f5F5F5] bg-checkerboard"
        >
          {/* IMAGE */}
          <img
            src={picture.previewUrl}
            className='absolute w-full h-full object-contain'
            style={{
              transform: `
                scale(${zoom})
                rotate(${rotation}deg)
              `,
              transformOrigin: 'center',
              pointerEvents: 'none',
            }}
          />

          {/* OVERLAY OMBRE */}
          <CropMaskOverlay grid={grid} />

          {/* CROP GRID */}
          <CropGridOverlay
            grid={grid}
            setGrid={setgrid}
            workspaceRef={workspaceRef}
          />
        </div>
        {/* <canvas
          ref={canvasRef}
          className="border mb-4 block mx-auto"
        /> */}
        
        <div className='flex justify-between'>
          <button
            type="button"
            className="px-3 py-1 border rounded"
            onClick={onCancel}
          >
            Annuler
          </button>
          <button
            type="button"
            className="px-3 py-1 bg-blue-600 text-white rounded"
            onClick={handleCrop}
          >
            Cropper
          </button>
        </div>
        {/* <Rnd
          size={{ width: cropBox.width, height: cropBox.height }}
          position={{ x: cropBox.x, y: cropBox.y }}
          onDragStop={(_, d) => setCropBox((b) => ({ ...b, x: d.x, y: d.y }))}
          onResizeStop={(_, __, ref, ___, position) =>
            setCropBox({
              x: position.x,
              y: position.y,
              width: ref.offsetWidth,
              height: ref.offsetHeight,
            })
          }
          bounds="parent"
          className="border-2 border-yellow-500"
        /> */}

      {/* <div className="absolute bottom-2 left-2 flex gap-4 items-center">
        <div className="flex items-center gap-2">
          Zoom
          <Slider.Root
            className="w-32 h-4"
            value={[zoom * 100]}
            min={50}
            max={200}
            onValueChange={([v]) => setZoom(v / 100)}
          >
            <Slider.Track className="relative bg-gray-300 h-2 rounded-full">
              <Slider.Range className="absolute bg-blue-500 h-2 rounded-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-4 h-4 bg-white border border-gray-400 rounded-full" />
          </Slider.Root>
        </div>

        <div className="flex items-center gap-2">
          Rotation
          <Slider.Root
            className="w-32 h-4"
            value={[rotation]}
            min={0}
            max={360}
            onValueChange={([v]) => setRotation(v)}
          >
            <Slider.Track className="relative bg-gray-300 h-2 rounded-full">
              <Slider.Range className="absolute bg-blue-500 h-2 rounded-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-4 h-4 bg-white border border-gray-400 rounded-full" />
          </Slider.Root>
        </div>

        <button
          type="button"
          className="px-2 py-1 bg-green-500 text-white rounded flex items-center gap-1"
          onClick={handleCropClick}
        >
          <Check size={16} />
          Crop
        </button>

        <button
          type="button"
          className="px-2 py-1 bg-red-500 text-white rounded flex items-center gap-1"
          onClick={onClose}
        >
          <X size={16} />
          Fermer
        </button>
      </div> */}
      </div>
    </div>
  );
}
