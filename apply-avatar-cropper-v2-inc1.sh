#!/usr/bin/env bash
#
# AKFC — Cropper avatar (v2), INCRÉMENT 1 : thème persistant + Cropper opt-in.
#
# - store useCropperTheme (zustand + persist localStorage), défaut sombre,
#   propre au cropper.
# - types : Shape, GridFraction, CropRecipe, CropResult.recipe?, props opt-in.
# - cropMaskOverlay / cropGridOverlay : prop `shape`.
# - Cropper : branche GALERIE (controls horizontal, clair) = code serveur
#   VERBATIM (inchangée) ; branche AVATAR opt-in via props
#   enableTheme (+ toggle lune/soleil lisant le store), controls="responsive"
#   (curseurs verticaux à droite si large, horizontaux dessous sinon, aperçu
#   toujours visible, champ éditable + undo + reset), shape/onShapeChange,
#   initialTransform (seed), recipe renvoyée dans onCrop.
#
# Les 3 consommateurs actuels ne passent aucune nouvelle prop → inchangés.
# Un typecheck.
# Usage : bash apply-avatar-cropper-v2-inc1.sh
#
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
GC="apps/web/src/features/gallery-crop"
ST="apps/web/src/lib/stores"
for f in "$GC/components/Cropper.tsx" "$GC/components/cropMaskOverlay.tsx" \
         "$GC/components/cropGridOverlay.tsx" "$GC/types/cropper.types.ts" \
         "$GC/hooks/useTransformWithUndo.ts"; do
  [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }
done
[ -d "$ST" ] || { echo "ERREUR: $ST introuvable." >&2; exit 1; }
if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BR="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  [ "$BR" = "main" ] || [ "$BR" = "master" ] && { echo "NOTE: branche '$BR'."; sleep 2; } || true
fi

# ---------- store thème ----------
cat > "$ST/useCropperTheme.ts" <<'TSX'
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CropperTheme = "light" | "dark";

interface CropperThemeStore {
  theme: CropperTheme;
  toggle: () => void;
  setTheme: (theme: CropperTheme) => void;
}

/**
 * Thème (clair/sombre) DU CROPPER, persisté (localStorage) et propre au
 * cropper — n'affecte que lui, jamais le reste de l'app. Défaut sombre.
 * Utilisé uniquement quand le Cropper est monté avec `enableTheme`.
 */
export const useCropperTheme = create<CropperThemeStore>()(
  persist(
    (set) => ({
      theme: "dark",
      toggle: () =>
        set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
      setTheme: (theme) => set({ theme }),
    }),
    { name: "akfc-cropper-theme" },
  ),
);
TSX
echo "  ok  useCropperTheme.ts"

# ---------- types ----------
cat > "$GC/types/cropper.types.ts" <<'TSX'
import { PictureItem } from "@/features/gallery-crop/types/picture.types";

export type Shape = "rect" | "circle";

export type CropGrid = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** Grille en FRACTIONS (0–1) du workspace → indépendante de l'écran. */
export type GridFraction = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** La « recette » : de quoi rouvrir le cropper exactement dans le même état. */
export type CropRecipe = {
  zoom: number;
  rotation: number;
  gridFrac: GridFraction;
  shape: Shape;
};

export type CropResult = {
  pictureId: string;
  croppedFile: File;
  /** Présent seulement si le consommateur exploite la recette (avatar). */
  recipe?: CropRecipe;
};

export type CropperProps = {
  picture: PictureItem;
  onCancel: () => void;
  onCrop: (result: CropResult) => void;
  /** Active le thème clair/sombre du cropper (+ toggle lune/soleil). */
  enableTheme?: boolean;
  /** Disposition des curseurs. Défaut "horizontal" (galerie). */
  controls?: "horizontal" | "responsive";
  /** Forme du masque d'affichage. Défaut "rect". */
  shape?: Shape;
  /** Fourni → affiche les boutons cercle/carré. */
  onShapeChange?: (shape: Shape) => void;
  /** Seed initial (rouvrir sur une recette). */
  initialTransform?: {
    zoom: number;
    rotation: number;
    gridFrac: GridFraction;
  };
};

export type ViewportTransform = {
  zoom: number;
  rotation: number;
  workspaceWidth: number;
  workspaceHeight: number;
  imageWidth: number;
  imageHeight: number;
};
TSX
echo "  ok  cropper.types.ts"

# ---------- cropMaskOverlay ----------
cat > "$GC/components/cropMaskOverlay.tsx" <<'TSX'
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
TSX
echo "  ok  cropMaskOverlay.tsx"

# ---------- cropGridOverlay ----------
cat > "$GC/components/cropGridOverlay.tsx" <<'TSX'
'use client';

import { useEffect, useRef } from 'react';
import type { CropGrid, Shape } from '@/features/gallery-crop/types/cropper.types';

type Props = {
  grid: CropGrid;
  setGrid: React.Dispatch<React.SetStateAction<CropGrid>>;
  workspaceRef: React.RefObject<HTMLDivElement | null>;
  shape?: Shape;
};

export default function CropGridOverlay({ grid, setGrid, workspaceRef, shape = 'rect' }: Props) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const dragStart = useRef<{ mouseX: number; mouseY: number; gridX: number; gridY: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, gridX: grid.x, gridY: grid.y };
  };

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      const start = dragStart.current;
      const workspace = workspaceRef.current;
      if (!start || !workspace) return;
      const dx = e.clientX - start.mouseX;
      const dy = e.clientY - start.mouseY;
      const rect = workspace.getBoundingClientRect();
      setGrid((prev) => ({
        ...prev,
        x: Math.min(Math.max(start.gridX + dx, 0), rect.width - prev.width),
        y: Math.min(Math.max(start.gridY + dy, 0), rect.height - prev.height),
      }));
    };
    const onPointerUp = () => { dragStart.current = null; };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [setGrid, workspaceRef]);

  return (
    <div
      ref={gridRef}
      onPointerDown={onPointerDown}
      className="absolute border-2 border-white/90 pointer-events-auto cursor-move select-none touch-none overflow-hidden"
      style={{
        left: grid.x,
        top: grid.y,
        width: grid.width,
        height: grid.height,
        borderRadius: shape === 'circle' ? '9999px' : undefined,
      }}
    >
      <div className="w-full h-full grid grid-cols-3 grid-rows-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="border border-gray-300/60" />
        ))}
      </div>
    </div>
  );
}
TSX
echo "  ok  cropGridOverlay.tsx"

# ---------- Cropper ----------
cat > "$GC/components/Cropper.tsx" <<'TSX'
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Circle, Square, Sun, Moon, Undo2, RotateCcw } from "lucide-react";
import type {
  CropperProps,
  CropGrid,
  Shape,
} from "@/features/gallery-crop/types/cropper.types";
import CropGridOverlay from "@/features/gallery-crop/components/cropGridOverlay";
import CropMaskOverlay from "@/features/gallery-crop/components/cropMaskOverlay";
import { useTransformWithUndo } from "@/features/gallery-crop/hooks/useTransformWithUndo";
import { useCropperTheme } from "@/lib/stores/useCropperTheme";

const WORKSPACE = 500;
const WIDE = 620; // px : au-delà → curseurs verticaux à droite
const ZOOM = { min: 0.1, max: 3, step: 0.01 };
const ROT = { min: -180, max: 180, step: 1 };

type Ctrl = ReturnType<typeof useTransformWithUndo<number>>;

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
  const containScale = Math.min(workspaceSize / img.width, workspaceSize / img.height);
  const drawnW = img.width * containScale;
  const drawnH = img.height * containScale;
  const imgLeft = (workspaceSize - drawnW) / 2;
  const imgTop = (workspaceSize - drawnH) / 2;
  const scaleOut = outSize ? outSize / Math.max(grid.width, grid.height) : 1;
  const outW = Math.max(1, Math.round(grid.width * scaleOut));
  const outH = Math.max(1, Math.round(grid.height * scaleOut));
  canvas.width = outW;
  canvas.height = outH;
  ctx.clearRect(0, 0, outW, outH);
  ctx.save();
  ctx.scale(scaleOut, scaleOut);
  ctx.translate(-grid.x, -grid.y);
  const cx = workspaceSize / 2;
  const cy = workspaceSize / 2;
  ctx.translate(cx, cy);
  ctx.scale(zoom, zoom);
  ctx.rotate((rotationDeg * Math.PI) / 180);
  ctx.translate(-cx, -cy);
  ctx.drawImage(img, imgLeft, imgTop, drawnW, drawnH);
  ctx.restore();
}

/** Curseur + champ éditable + Undo + Reset (avatar). Vertical ou horizontal. */
function SliderField({
  label, ctrl, min, max, step, decimals, unit, vertical, dark,
}: {
  label: string; ctrl: Ctrl; min: number; max: number; step: number;
  decimals: number; unit?: string; vertical: boolean; dark: boolean;
}) {
  const [text, setText] = useState("");
  useEffect(() => {
    setText(decimals ? ctrl.value.toFixed(decimals) : String(Math.round(ctrl.value)));
  }, [ctrl.value, decimals]);
  const commitText = (raw: string) => {
    let n = Number(raw);
    if (Number.isNaN(n)) {
      setText(decimals ? ctrl.value.toFixed(decimals) : String(ctrl.value));
      return;
    }
    ctrl.set(Math.min(max, Math.max(min, n)));
  };
  const lbl = dark ? "text-zinc-400" : "text-gray-500";
  const fld = dark
    ? "border-zinc-700 bg-zinc-800 text-zinc-100 focus:border-emerald-500"
    : "border-gray-300 bg-white text-gray-800 focus:border-emerald-500";
  const btn = dark ? "text-zinc-400 hover:bg-zinc-800" : "text-gray-500 hover:bg-gray-100";
  const range = (
    <input
      type="range" min={min} max={max} step={step} value={ctrl.value}
      onMouseDown={ctrl.startInteraction}
      onMouseUp={ctrl.endInteraction}
      onChange={(e) => ctrl.set(Number(e.target.value))}
      aria-label={label}
      className={vertical ? "h-36" : "w-40"}
      style={vertical
        ? { writingMode: "vertical-lr", direction: "rtl", accentColor: "#059669", cursor: "pointer" }
        : { accentColor: "#059669", cursor: "pointer" }}
    />
  );
  const field = (
    <div className="flex items-center gap-1">
      <input
        type="number" value={text} min={min} max={max} step={step}
        onChange={(e) => setText(e.target.value)}
        onBlur={(e) => commitText(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") commitText((e.target as HTMLInputElement).value); }}
        className={`w-16 rounded-md border px-1.5 py-1 text-center text-xs outline-none ${fld}`}
      />
      {unit && <span className={`text-xs ${dark ? "text-zinc-500" : "text-gray-400"}`}>{unit}</span>}
    </div>
  );
  const actions = (
    <div className="flex gap-1">
      <button type="button" onClick={ctrl.undo} title="Défaire" className={`inline-flex items-center rounded-md px-2 py-1 text-xs transition-colors ${btn}`}><Undo2 className="h-3.5 w-3.5" /></button>
      <button type="button" onClick={ctrl.reset} title="Réinitialiser" className={`inline-flex items-center rounded-md px-2 py-1 text-xs transition-colors ${btn}`}><RotateCcw className="h-3.5 w-3.5" /></button>
    </div>
  );
  if (vertical) {
    return (
      <div className="flex flex-col items-center gap-2">
        <span className={`text-[11px] font-medium uppercase tracking-wide ${lbl}`}>{label}</span>
        {range}{field}{actions}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <span className={`w-16 shrink-0 text-xs font-medium ${lbl}`}>{label}</span>
      {range}{field}{actions}
    </div>
  );
}

export default function Cropper({
  picture,
  onCrop,
  onCancel,
  enableTheme = false,
  controls = "horizontal",
  shape = "rect",
  onShapeChange,
  initialTransform,
}: CropperProps) {
  // Hook toujours appelé (règles des hooks) ; utilisé seulement si enableTheme.
  const storeTheme = useCropperTheme((s) => s.theme);
  const toggleTheme = useCropperTheme((s) => s.toggle);
  const dark = enableTheme && storeTheme === "dark";
  const responsive = controls === "responsive";

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const zoom = useTransformWithUndo(initialTransform?.zoom ?? 1, { commitDelay: 250 });
  const rotation = useTransformWithUndo(initialTransform?.rotation ?? 0, { commitDelay: 250 });

  const [grid, setGrid] = useState<CropGrid>({ x: 150, y: 150, width: 200, height: 200 });
  const [wide, setWide] = useState(true);

  const workspaceSize = useCallback(() => {
    return workspaceRef.current?.getBoundingClientRect().width ?? WORKSPACE;
  }, []);

  // Responsive : largeur dispo du panneau.
  useEffect(() => {
    if (!responsive) return;
    const el = panelRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setWide(entries[0].contentRect.width >= WIDE);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [responsive]);

  // Seed de la grille depuis la recette (fractions → px selon le workspace réel).
  useEffect(() => {
    if (!initialTransform) return;
    const ws = workspaceSize();
    const gf = initialTransform.gridFrac;
    setGrid({ x: gf.x * ws, y: gf.y * ws, width: gf.width * ws, height: gf.height * ws });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = picture.previewUrl;
    img.onload = () => {
      imgRef.current = img;
      renderPreview();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picture.previewUrl]);

  const renderPreview = useCallback(() => {
    const canvas = previewCanvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    drawCrop(canvas, img, grid, zoom.value, rotation.value, workspaceSize(), 120);
  }, [grid, zoom.value, rotation.value, workspaceSize]);

  useEffect(() => { renderPreview(); }, [renderPreview]);

  const handleCrop = () => {
    const img = imgRef.current;
    if (!img) return;
    const ws = workspaceSize();
    const canvas = document.createElement("canvas");
    drawCrop(canvas, img, grid, zoom.value, rotation.value, ws);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const gridFrac = {
        x: grid.x / ws, y: grid.y / ws, width: grid.width / ws, height: grid.height / ws,
      };
      onCrop({
        pictureId: picture.id,
        croppedFile: new File([blob], picture.file.name, {
          type: "image/png",
          lastModified: Date.now(),
        }),
        recipe: { zoom: zoom.value, rotation: rotation.value, gridFrac, shape },
      });
    }, "image/png");
  };

  const resetAll = () => {
    zoom.reset();
    rotation.reset();
  };

  // ---- thème ----
  const overlayCls = dark ? "bg-black/80" : "bg-black/70";
  const panelCls = dark ? "bg-zinc-900 text-zinc-100" : "bg-white";
  const muted = dark ? "text-zinc-500" : "text-gray-500";
  const surface = dark ? "bg-zinc-900" : "bg-white";
  const border = dark ? "border-zinc-700" : "border-gray-300";
  const cancelCls = dark ? "text-zinc-300 hover:bg-zinc-800" : "text-gray-700 hover:bg-gray-100";
  const rounded = shape === "circle" ? "rounded-full" : "";

  const tbBtn = (active: boolean) =>
    `inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
      active
        ? "border-emerald-500 bg-emerald-500/15 text-emerald-500"
        : dark
          ? "border-zinc-700 text-zinc-400 hover:bg-zinc-800"
          : "border-gray-300 text-gray-500 hover:bg-gray-100"
    }`;

  const previewBox = (
    <div className="flex flex-col items-center gap-2">
      {responsive && <span className={`text-[11px] uppercase tracking-wide ${muted}`}>Aperçu</span>}
      <canvas
        ref={previewCanvasRef}
        className={`h-28 w-28 object-contain border ${responsive ? `${border} ${surface} overflow-hidden ${rounded}` : "w-32 h-32"}`}
      />
    </div>
  );

  return (
    <div className={`fixed inset-0 ${overlayCls} flex items-start justify-center z-50 p-4 overflow-auto`}>
      <div ref={panelRef} className={`${panelCls} p-4 rounded shadow gap-4 w-full sm:w-auto max-w-full max-h-[92dvh] overflow-auto`}>
        {/* Barre d'outils avatar : formes + toggle thème (opt-in) */}
        {(onShapeChange || enableTheme) && (
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {onShapeChange && (
                <>
                  <span className={`mr-1 text-[11px] uppercase tracking-wide ${muted}`}>Forme</span>
                  <button type="button" onClick={() => onShapeChange("circle")} className={tbBtn(shape === "circle")} aria-label="Cercle" aria-pressed={shape === "circle"}><Circle className="h-5 w-5" /></button>
                  <button type="button" onClick={() => onShapeChange("rect")} className={tbBtn(shape === "rect")} aria-label="Carré" aria-pressed={shape === "rect"}><Square className="h-5 w-5" /></button>
                </>
              )}
            </div>
            {enableTheme && (
              <button type="button" onClick={toggleTheme} className={tbBtn(false)} title={dark ? "Thème clair" : "Thème sombre"} aria-label="Basculer le thème">
                {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            )}
          </div>
        )}

        {/* Établi + (responsive : curseurs + aperçu) */}
        <div className={`flex gap-4 ${responsive && wide ? "flex-row items-start" : "flex-col items-center sm:items-start"} ${responsive && !wide ? "sm:flex-col" : "sm:flex-row"}`}>
          <div
            ref={workspaceRef}
            className="relative w-full max-w-[500px] aspect-square overflow-hidden bg-checkerboard"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={picture.previewUrl}
              alt=""
              className="absolute w-full h-full object-contain pointer-events-none"
              style={{ transform: `scale(${zoom.value}) rotate(${rotation.value}deg)` }}
            />
            <CropMaskOverlay grid={grid} shape={shape} />
            <CropGridOverlay grid={grid} setGrid={setGrid} workspaceRef={workspaceRef} shape={shape} />
          </div>

          {responsive ? (
            wide ? (
              <div className="flex flex-row items-start gap-5">
                <div className="flex gap-4">
                  <SliderField label="Zoom" ctrl={zoom} min={ZOOM.min} max={ZOOM.max} step={ZOOM.step} decimals={2} vertical dark={dark} />
                  <SliderField label="Rotation" ctrl={rotation} min={ROT.min} max={ROT.max} step={ROT.step} decimals={0} unit="°" vertical dark={dark} />
                </div>
                {previewBox}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                {previewBox}
                <div className="flex flex-col gap-3">
                  <SliderField label="Zoom" ctrl={zoom} min={ZOOM.min} max={ZOOM.max} step={ZOOM.step} decimals={2} vertical={false} dark={dark} />
                  <SliderField label="Rotation" ctrl={rotation} min={ROT.min} max={ROT.max} step={ROT.step} decimals={0} unit="°" vertical={false} dark={dark} />
                </div>
              </div>
            )
          ) : (
            previewBox
          )}
        </div>

        {/* Curseurs GALERIE (horizontal) — code serveur inchangé */}
        {!responsive && (
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2">
              <span className="w-14 shrink-0 text-xs font-medium text-gray-500">Zoom</span>
              <input type="range" min={0.1} max={3} step={0.01} value={zoom.value}
                onMouseDown={zoom.startInteraction} onMouseUp={zoom.endInteraction}
                onChange={(e) => zoom.set(Number(e.target.value))}
                className="h-1.5 w-36 cursor-pointer accent-emerald-600" />
              <button type="button" onClick={zoom.undo} className="rounded-md px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-100">Défaire</button>
              <button type="button" onClick={zoom.reset} className="rounded-md px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-100">Réinit.</button>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-14 shrink-0 text-xs font-medium text-gray-500">Rotation</span>
              <input type="range" min={-180} max={180} step={1} value={rotation.value}
                onMouseDown={rotation.startInteraction} onMouseUp={rotation.endInteraction}
                onChange={(e) => rotation.set(Number(e.target.value))}
                className="h-1.5 w-36 cursor-pointer accent-emerald-600" />
              <button type="button" onClick={rotation.undo} className="rounded-md px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-100">Défaire</button>
              <button type="button" onClick={rotation.reset} className="rounded-md px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-100">Réinit.</button>
            </div>
            <button type="button" onClick={resetAll} className="rounded-full px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50">Tout réinitialiser</button>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={onCancel} className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${cancelCls}`}>Annuler</button>
          <button type="button" onClick={handleCrop} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700">Recadrer</button>
        </div>
      </div>
    </div>
  );
}
TSX
echo "  ok  Cropper.tsx"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY — pas de typecheck ni commit"; exit 0; fi
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then TC="check"; else TC="typecheck"; fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -20 || true
  tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK (galerie/bibliothèque inchangées)"
git add -A
git commit -m "feat(cropper): thème persistant + Cropper opt-in avatar (responsive, formes, recette)" > /tmp/akfc_commit.log 2>&1 \
  && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit: rien ou échec"; tail -3 /tmp/akfc_commit.log; }