'use client';

import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Check, X } from 'lucide-react';
import { Rnd } from 'react-rnd';
import * as Slider from '@radix-ui/react-slider';

/* -------------------------------- TYPES -------------------------------- */

export interface CroppedImage {
  name: string;
  base64: string;
}

export interface CropperImage {
  id: string;
  name: string;
  base64: string;
}

interface CropperProps {
  image: CropperImage | null;

  onAddImages: (images: { name: string; preview: string }[]) => void;
  onCrop: (id: string, cropped: CroppedImage) => void;
  onClose: () => void;
}

/* -------------------------------- COMPONENT -------------------------------- */

export default function Cropper({
  image,
  onAddImages,
  onCrop,
  onClose,
}: CropperProps) {
  /* ---------------- DROPZONE ---------------- */

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    multiple: true,
    onDrop: async (files) => {
      const images = await Promise.all(
        files.map(
          (file) =>
            new Promise<{ name: string; preview: string }>((res) => {
              const reader = new FileReader();
              reader.onload = () =>
                res({
                  name: file.name,
                  preview: reader.result as string,
                });
              reader.readAsDataURL(file);
            })
        )
      );

      onAddImages(images);
    },
  });

  /* ---------------- CROP STATE ---------------- */

  const [zoom, setZoom] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [cropBox, setCropBox] = useState({
    x: 100,
    y: 80,
    width: 300,
    height: 220,
  });

  useEffect(() => {
    if (!image) return;

    setZoom(1);
    setRotate(0);
    setCropBox({ x: 100, y: 80, width: 300, height: 220 });
  }, [image]);

  /* ---------------- NO ACTIVE IMAGE → DROPZONE ---------------- */

  if (!image) {
    return (
      <div
        {...getRootProps()}
        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50"
      >
        <input {...getInputProps()} />
        <p className="text-gray-600">
          Glissez vos images ici ou cliquez pour sélectionner
        </p>
      </div>
    );
  }

  /* ---------------- CONFIRM CROP ---------------- */

  const confirmCrop = () => {
    onCrop(image.id, {
      name: image.name,
      base64: image.base64,
    });
    onClose();
  };

  /* ---------------- RENDER MODAL ---------------- */

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className="bg-gray-900 p-6 rounded-lg text-white w-[720px]">
        <div className="relative w-[600px] h-[450px] mx-auto overflow-hidden">
          <Image
            src={image.base64}
            alt={image.name}
            fill
            className="object-contain"
            style={{ transform: `scale(${zoom}) rotate(${rotate}deg)` }}
          />

          <Rnd
            bounds="parent"
            size={cropBox}
            position={cropBox}
            onDragStop={(_, d) =>
              setCropBox({ ...cropBox, x: d.x, y: d.y })
            }
            onResizeStop={(_, __, ref, ___, pos) =>
              setCropBox({
                width: ref.offsetWidth,
                height: ref.offsetHeight,
                x: pos.x,
                y: pos.y,
              })
            }
            className="border-2 border-white"
          >
            <div className="w-full h-full grid grid-cols-3 grid-rows-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border border-white/30" />
              ))}
            </div>
          </Rnd>
        </div>

        <div className="flex gap-6 mt-6">
          <div className="flex-1">
            <label>Zoom</label>
            <Slider.Root
              value={[zoom]}
              min={0.5}
              max={4}
              step={0.01}
              onValueChange={(v) => setZoom(v[0])}
            >
              <Slider.Track className="h-1 bg-gray-700">
                <Slider.Range className="bg-green-500 h-full" />
              </Slider.Track>
            </Slider.Root>
          </div>

          <div className="flex-1">
            <label>Rotation</label>
            <Slider.Root
              value={[rotate]}
              min={-180}
              max={180}
              step={1}
              onValueChange={(v) => setRotate(v[0])}
            >
              <Slider.Track className="h-1 bg-gray-700">
                <Slider.Range className="bg-blue-500 h-full" />
              </Slider.Track>
            </Slider.Root>
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <button
            type="button"
            onClick={confirmCrop}
            className="bg-green-600 px-4 py-2 rounded flex items-center gap-2"
          >
            <Check /> Valider
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-red-600 px-4 py-2 rounded flex items-center gap-2"
          >
            <X /> Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
