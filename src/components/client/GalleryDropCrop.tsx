'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Check, X } from 'lucide-react';
import { Rnd } from 'react-rnd';
import * as Slider from '@radix-ui/react-slider';

export interface CroppedImage {
  name: string;
  base64: string;
}

interface DroppedFile {
  id: string;
  file: File;
  preview: string;
  naturalWidth?: number;
  naturalHeight?: number;
  croppedBase64?: string;
  isProcessing?: boolean;
}

interface GalleryDropCropProps {
  onCrop: (indexOrId: number | string, cropped: { name: string; base64: string }) => void;
  onChangeAll?: (images: { name: string; preview: string }[]) => void;
  onClear?: () => void;
}

export default function GalleryDropCrop({ onCrop, onChangeAll, onClear }: GalleryDropCropProps) {
  const [images, setImages] = useState<DroppedFile[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  const [zoom, setZoom] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [cropBox, setCropBox] = useState({ x: 100, y: 100, width: 300, height: 200 });

  const container = { width: 600, height: 450 };
  const idCounter = useRef(0);

  useEffect(() => {
    if (onChangeAll) onChangeAll(images.map((it) => ({ name: it.file.name, preview: it.preview })));
  }, [images, onChangeAll]);

  useEffect(() => {
    if (currentIndex !== null) {
      const url = images[currentIndex].preview;
      const img = new window.Image();
      img.onload = () => {
        setImages((prev) => {
          const next = [...prev];
          next[currentIndex!] = {
            ...next[currentIndex!],
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
          };
          return next;
        });
      };
      img.src = url;
    }
  }, [currentIndex, images]);

  useEffect(() => {
    return () => {
      images.forEach((it) => {
        if (it.preview.startsWith('blob:')) {
          try { URL.revokeObjectURL(it.preview); } catch {}
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDrop = (acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map((file) => {
      idCounter.current += 1;
      return {
        id: `img-${Date.now()}-${idCounter.current}`,
        file,
        preview: URL.createObjectURL(file),
      } as DroppedFile;
    });
    setImages((prev) => [...prev, ...newImages]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
  });

  function computeDisplayedImage(naturalW: number, naturalH: number, containerW: number, containerH: number, zoomVal: number) {
    const fitScale = Math.min(containerW / naturalW, containerH / naturalH);
    const baseW = naturalW * fitScale;
    const baseH = naturalH * fitScale;
    const displayedW = baseW * zoomVal;
    const displayedH = baseH * zoomVal;
    const offsetX = (containerW - displayedW) / 2;
    const offsetY = (containerH - displayedH) / 2;
    return { displayedW, displayedH, offsetX, offsetY, baseW, baseH, fitScale };
  }

  function mapCropBoxToSourceRect(img: DroppedFile, crop: { x: number; y: number; width: number; height: number }) {
    if (!img.naturalWidth || !img.naturalHeight) throw new Error('Image natural size missing');

    const { displayedW, displayedH, offsetX, offsetY } = computeDisplayedImage(
      img.naturalWidth,
      img.naturalHeight,
      container.width,
      container.height,
      zoom
    );

    const relX = (crop.x - offsetX) / displayedW;
    const relY = (crop.y - offsetY) / displayedH;
    const relW = crop.width / displayedW;
    const relH = crop.height / displayedH;

    const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

    const sx = clamp01(relX) * img.naturalWidth;
    const sy = clamp01(relY) * img.naturalHeight;
    const sw = Math.max(1, clamp01(relW) * img.naturalWidth);
    const sh = Math.max(1, clamp01(relH) * img.naturalHeight);

    return { left: Math.round(sx), top: Math.round(sy), width: Math.round(sw), height: Math.round(sh) };
  }

  async function cropOnServer(index: number, file: File, rect: { left: number; top: number; width: number; height: number }, rotateDeg: number) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('left', String(rect.left));
    fd.append('top', String(rect.top));
    fd.append('width', String(rect.width));
    fd.append('height', String(rect.height));
    fd.append('rotate', String(rotateDeg));
    fd.append('index', String(index));

    const resp = await fetch('/api/crop', { method: 'POST', body: fd });
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`Crop failed: ${txt}`);
    }
    const json = await resp.json();
    return json.base64 as string;
  }

  const finishCrop = async () => {
    if (currentIndex === null) return;
    const img = images[currentIndex];
    if (!img.naturalWidth || !img.naturalHeight) return;

    const sourceRect = mapCropBoxToSourceRect(img, cropBox);

    setImages((prev) => {
      const next = [...prev];
      next[currentIndex!] = { ...next[currentIndex!], isProcessing: true };
      return next;
    });

    try {
      const base64 = await cropOnServer(currentIndex, img.file, sourceRect, rotate);

      setImages((prev) => {
        const next = [...prev];
        const prevPreview = next[currentIndex!].preview;
        if (prevPreview.startsWith('blob:')) {
          try { URL.revokeObjectURL(prevPreview); } catch {}
        }
        next[currentIndex!] = {
          ...next[currentIndex!],
          preview: base64,
          croppedBase64: base64,
          isProcessing: false,
        };
        return next;
      });

      // **Important** : onCrop remplace la miniature dans le parent, mais NE soumet PAS le formulaire
      onCrop(currentIndex, { name: img.file.name, base64 });

      setCurrentIndex(null);
    } catch (e) {
      console.error(e);
      setImages((prev) => {
        const next = [...prev];
        next[currentIndex!] = { ...next[currentIndex!], isProcessing: false };
        return next;
      });
    }
  };

  const clearAll = () => {
    images.forEach((it) => {
      if (it.preview.startsWith('blob:')) {
        try { URL.revokeObjectURL(it.preview); } catch {}
      }
    });
    setImages([]);
    setCurrentIndex(null);
    if (onClear) onClear();
  };

  return (
    <div className="w-full">
      <div {...getRootProps()} className="border-2 border-dashed border-gray-400 p-8 mb-6 text-center cursor-pointer rounded-lg hover:bg-gray-50">
        <input {...getInputProps()} />
        <p className="text-gray-600">Glissez vos images ici ou cliquez pour en sélectionner</p>
      </div>

      <div className="flex flex-wrap gap-4 mt-4">
        {images.map((img, i) =>
          currentIndex === i ? null : (
            <button
              key={img.id}
              type="button"
              className="relative w-32 h-32 rounded-md overflow-hidden border border-gray-300"
              onClick={() => {
                setCurrentIndex(i);
                setZoom(1);
                setRotate(0);
                setCropBox({ x: 100, y: 100, width: 300, height: 200 });
              }}
            >
              <img src={img.preview} alt={img.file?.name ?? `image-${i}`} className="w-full h-full object-contain bg-gray-100" />
              {img.isProcessing && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                  <span>Processing...</span>
                </div>
              )}
            </button>
          )
        )}
      </div>

      {currentIndex !== null && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white w-[700px]">
            <div
              onWheel={(e) => {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.1 : 0.1;
                setZoom((z) => Math.min(10, Math.max(0.2, z + delta)));
              }}
              className="relative mx-auto rounded-md overflow-hidden"
              style={{
                width: `${container.width}px`,
                height: `${container.height}px`,
                backgroundImage:
                  'linear-gradient(45deg, #f3f4f6 25%, transparent 25%), linear-gradient(-45deg, #f3f4f6 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f3f4f6 75%), linear-gradient(-45deg, transparent 75%, #f3f4f6 75%)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="origin-center" style={{ transform: `scale(${zoom}) rotate(${rotate}deg)` }}>
                  <img src={images[currentIndex].preview} alt="to crop" className="max-w-[600px] max-h-[450px] pointer-events-none" draggable={false} />
                </div>
              </div>

              <Rnd
                size={{ width: cropBox.width, height: cropBox.height }}
                position={{ x: cropBox.x, y: cropBox.y }}
                onDragStop={(e, d) => setCropBox({ ...cropBox, x: d.x, y: d.y })}
                onResizeStop={(e, dir, ref, delta, pos) =>
                  setCropBox({
                    width: ref.offsetWidth,
                    height: ref.offsetHeight,
                    x: pos.x,
                    y: pos.y,
                  })
                }
                bounds="parent"
                className="border-2 border-gray-300 bg-transparent"
              >
                <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="border border-gray-400/80"></div>
                  ))}
                </div>
              </Rnd>
            </div>

            <div className="flex justify-between my-5 gap-8">
              <div className="flex flex-col items-center w-1/2">
                <label className="text-sm mb-2">Zoom</label>
                <Slider.Root className="relative flex items-center w-full h-5" value={[zoom]} min={0.2} max={10} step={0.001} onValueChange={(val) => setZoom(val[0])}>
                  <Slider.Track className="bg-gray-700 relative grow rounded-full h-1">
                    <Slider.Range className="absolute bg-green-500 rounded-full h-full" />
                  </Slider.Track>
                  <Slider.Thumb className="block w-4 h-4 bg-green-500 rounded-full shadow-md cursor-pointer" />
                </Slider.Root>
                <p className="mt-2 text-sm text-gray-300">{zoom.toFixed(1)}x</p>
              </div>

              <div className="flex flex-col items-center w-1/2">
                <label className="text-sm mb-2">Rotation</label>
                <Slider.Root className="relative flex items-center w-full h-5" value={[rotate]} min={-180} max={180} step={1} onValueChange={(val) => setRotate(val[0])}>
                  <Slider.Track className="bg-gray-700 relative grow rounded-full h-1">
                    <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                  </Slider.Track>
                  <Slider.Thumb className="block w-4 h-4 bg-blue-500 rounded-full shadow-md cursor-pointer" />
                </Slider.Root>
                <p className="mt-2 text-sm text-gray-300">{rotate}°</p>
              </div>
            </div>

            <div className="mt-6 flex gap-4 justify-center">
              <button type="button" onClick={finishCrop} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
                <Check /> Valider
              </button>
              <button type="button" onClick={() => setCurrentIndex(null)} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition">
                <X /> Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}