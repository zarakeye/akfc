"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  CropperProps,
  CropGrid,
} from "@/features/gallery-crop/types/cropper.types";
import CropGridOverlay from "@/features/gallery-crop/components/cropGridOverlay";
import CropMaskOverlay from "@/features/gallery-crop/components/cropMaskOverlay";
import { useTransformWithUndo } from "@/features/gallery-crop/hooks/useTransformWithUndo";

const WORKSPACE = 500; // px, cf. le carré de l'établi ci-dessous

/**
 * Rendu du crop — UNE SEULE fonction, utilisée à la fois pour l'aperçu et
 * pour l'export. C'est la clé de la fidélité : aperçu == résultat, par
 * construction. On REPRODUIT à l'identique la scène que l'utilisateur voit
 * dans l'établi (image en `object-contain` dans un carré WORKSPACE, puis
 * CSS `scale(zoom) rotate(rotation)` autour du centre du workspace), et on
 * en extrait la zone couverte par la grille.
 *
 * Le canvas de sortie fait la taille de la grille (ou une version réduite à
 * `outSize` pour l'aperçu). Toutes les transformations (translation vers le
 * centre du workspace, rotation, zoom) sont appliquées AU CONTEXTE, comme le
 * ferait le navigateur — jamais recalculées à la main dans l'espace image.
 */
function drawCrop(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  grid: CropGrid,
  zoom: number,
  rotationDeg: number,
  workspaceSize: number,
  outSize?: number,
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 1) Placement `object-contain` de l'image dans le workspace (avant CSS
  //    transform) : l'image est centrée, mise à l'échelle pour tenir dans
  //    WORKSPACE×WORKSPACE en gardant son ratio.
  const containScale = Math.min(
    workspaceSize / img.width,
    workspaceSize / img.height,
  );
  const drawnW = img.width * containScale;
  const drawnH = img.height * containScale;
  const imgLeft = (workspaceSize - drawnW) / 2; // position dans le workspace
  const imgTop = (workspaceSize - drawnH) / 2;

  // 2) Taille de sortie : celle de la grille, éventuellement réduite (aperçu).
  const scaleOut = outSize ? outSize / Math.max(grid.width, grid.height) : 1;
  const outW = Math.max(1, Math.round(grid.width * scaleOut));
  const outH = Math.max(1, Math.round(grid.height * scaleOut));
  canvas.width = outW;
  canvas.height = outH;

  ctx.clearRect(0, 0, outW, outH);
  ctx.save();

  // 3) On travaille dans l'espace du workspace, mais décalé pour que le coin
  //    haut-gauche de la GRILLE devienne l'origine (0,0) du canvas, puis mis
  //    à l'échelle de sortie.
  ctx.scale(scaleOut, scaleOut);
  ctx.translate(-grid.x, -grid.y);

  // 4) Reproduction EXACTE de la transform CSS : `transform-origin` par défaut
  //    d'un élément `w-full h-full` est son centre = centre du workspace.
  //    CSS applique scale() puis rotate() autour de ce centre.
  const cx = workspaceSize / 2;
  const cy = workspaceSize / 2;
  ctx.translate(cx, cy);
  ctx.scale(zoom, zoom);
  ctx.rotate((rotationDeg * Math.PI) / 180);
  ctx.translate(-cx, -cy);

  // 5) Dessin de l'image à sa position `object-contain`.
  ctx.drawImage(img, imgLeft, imgTop, drawnW, drawnH);

  ctx.restore();
}

export default function Cropper({ picture, onCrop, onCancel }: CropperProps) {
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const zoom = useTransformWithUndo(1, { commitDelay: 250 });
  const rotation = useTransformWithUndo(0, { commitDelay: 250 });

  const [grid, setGrid] = useState<CropGrid>({
    x: 150,
    y: 150,
    width: 200,
    height: 200,
  });

  // Charge l'image une fois, la garde en ref pour aperçu + export.
  useEffect(() => {
    const img = new Image();
    img.src = picture.previewUrl;
    img.onload = () => {
      imgRef.current = img;
      renderPreview();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picture.previewUrl]);

  const workspaceSize = useCallback(() => {
    return workspaceRef.current?.getBoundingClientRect().width ?? WORKSPACE;
  }, []);

  const renderPreview = useCallback(() => {
    const canvas = previewCanvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    drawCrop(
      canvas,
      img,
      grid,
      zoom.value,
      rotation.value,
      workspaceSize(),
      120,
    );
  }, [grid, zoom.value, rotation.value, workspaceSize]);

  // Aperçu live à chaque changement.
  useEffect(() => {
    renderPreview();
  }, [renderPreview]);

  const handleCrop = () => {
    const img = imgRef.current;
    if (!img) return;
    const canvas = document.createElement("canvas");
    // Export pleine résolution (pas d'outSize → taille exacte de la grille).
    drawCrop(canvas, img, grid, zoom.value, rotation.value, workspaceSize());
    canvas.toBlob((blob) => {
      if (!blob) return;
      onCrop({
        pictureId: picture.id,
        croppedFile: new File([blob], picture.file.name, {
          type: "image/png",
          lastModified: Date.now(),
        }),
      });
    }, "image/png");
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={picture.previewUrl}
              alt=""
              className="absolute w-full h-full object-contain pointer-events-none"
              style={{
                transform: `scale(${zoom.value}) rotate(${rotation.value}deg)`,
              }}
            />
            <CropMaskOverlay grid={grid} />
            <CropGridOverlay
              grid={grid}
              setGrid={setGrid}
              workspaceRef={workspaceRef}
            />
          </div>

          <canvas
            ref={previewCanvasRef}
            className="border w-32 h-32 object-contain"
          />
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
            <button type="button" onClick={zoom.undo}>
              undo
            </button>
            <button type="button" onClick={zoom.reset}>
              reset
            </button>
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
            <button type="button" onClick={rotation.undo}>
              undo
            </button>
            <button type="button" onClick={rotation.reset}>
              reset
            </button>
          </div>

          <button
            onClick={resetAll}
            className="px-3 py-1 bg-red-500 text-white rounded"
          >
            Reset all
          </button>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={onCancel}>
            Annuler
          </button>
          <button
            type="button"
            onClick={handleCrop}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Cropper
          </button>
        </div>
      </div>
    </div>
  );
}
