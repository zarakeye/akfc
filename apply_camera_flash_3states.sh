#!/bin/bash
# Camera : flash a 3 etats (cycle off -> capture -> on -> off).
#  - off     : aucun flash.
#  - capture : l ecran s illumine uniquement AU MOMENT de la capture.
#  - on      : l ecran s illumine DIRECTEMENT et PERSISTE (voile blanc
#              translucide) pour apprecier l eclairage avant de declencher.
# Torch materiel utilise en mode "on" si dispo, sinon flash-ecran logiciel.
# Bouton tri-etat (ZapOff / Zap fond blanc / Zap fond ambre).
# À lancer depuis la RACINE du monorepo : bash apply_camera_flash_3states.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : racine du monorepo requise." >&2; exit 1; }
echo "-> apps/web/src/features/avatar/CameraCapture.tsx"
cat > 'apps/web/src/features/avatar/CameraCapture.tsx' << 'FILE_EOF'
"use client";

import { useEffect, useRef, useState, type JSX } from "react";
import { Camera, Grid3x3, X, Zap, ZapOff } from "lucide-react";

/**
 * Capture d'une photo via la caméra FRONTALE. `getUserMedia({ facingMode:
 * "user" })`, preview, capture → File PNG via onCapture. Stream toujours
 * coupé au démontage et à la capture.
 *
 * Deux aides au cadrage, activables par bouton :
 *  - GRILLE (règle des tiers) : overlay de lignes pour centrer le sujet.
 *  - FLASH : le vrai flash matériel (`torch`) n'existe quasiment que sur la
 *    caméra ARRIÈRE des mobiles — jamais en frontale/desktop. On tente donc
 *    `torch` si la capability existe, sinon on bascule sur un FLASH LOGICIEL
 *    (l'écran s'illumine en blanc le temps de la capture pour éclairer le
 *    visage). Le bouton s'adapte au matériel de façon transparente.
 */

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
}

// Le type `torch` n'est pas dans les lib.dom par défaut → on l'élargit.
type TorchCapabilities = MediaTrackCapabilities & { torch?: boolean };
type TorchConstraint = MediaTrackConstraintSet & { torch?: boolean };

export function CameraCapture({
  onCapture,
  onCancel,
}: CameraCaptureProps): JSX.Element {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const [showGrid, setShowGrid] = useState(false);
  // Flash à 3 états :
  //  - "off"     : aucun flash.
  //  - "capture" : l'écran s'illumine uniquement AU MOMENT de la capture.
  //  - "on"      : l'écran s'illumine DIRECTEMENT et PERSISTE (permet
  //                d'apprécier l'éclairage avant de déclencher).
  const [flashMode, setFlashMode] = useState<"off" | "capture" | "on">("off");
  const [hasTorch, setHasTorch] = useState(false);
  // Flash logiciel : surface blanche affichée brièvement à la capture
  // (mode "capture") — distinct de l'illumination persistante (mode "on").
  const [screenFlash, setScreenFlash] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        // Détecte un éventuel flash matériel (torch).
        const track = stream.getVideoTracks()[0];
        const caps =
          (track?.getCapabilities?.() as TorchCapabilities | undefined) ??
          undefined;
        setHasTorch(Boolean(caps?.torch));

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
        }
      } catch {
        if (!cancelled) {
          setError(
            "Impossible d'accéder à la caméra. Vérifiez les autorisations du navigateur.",
          );
        }
      }
    }
    void start();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  // Cycle du flash : off → capture → on → off.
  const cycleFlash = async () => {
    const next =
      flashMode === "off" ? "capture" : flashMode === "capture" ? "on" : "off";
    setFlashMode(next);

    // Torch matériel : allumé en mode "on" (persistant) OU "capture" si le
    // matériel le gère ; sinon on retombe sur le flash logiciel.
    if (hasTorch) {
      const track = streamRef.current?.getVideoTracks()[0];
      try {
        await track?.applyConstraints({
          advanced: [{ torch: next === "on" } as TorchConstraint],
        });
      } catch {
        setHasTorch(false);
      }
    }
  };

  const doCapture = () => {
    const video = videoRef.current;
    if (!video) return;
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return;

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Miroir horizontal : la preview frontale est en miroir, on capture ce
    // que l'utilisateur voit.
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, w, h);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "camera.png", { type: "image/png" });
      stopStream();
      onCapture(file);
    }, "image/png");
  };

  const handleCapture = () => {
    // Mode "on" : l'écran est DÉJÀ illuminé (voile persistant) → capture
    // directe. Mode "capture" sans torch : on illumine brièvement avant de
    // figer l'image. Sinon : capture directe.
    if (flashMode === "capture" && !hasTorch) {
      setScreenFlash(true);
      window.setTimeout(() => {
        doCapture();
        setScreenFlash(false);
      }, 180);
    } else {
      doCapture();
    }
  };

  const handleCancel = () => {
    stopStream();
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center gap-4 bg-black/80 backdrop-blur-sm p-4">
      {/* Flash logiciel de capture (bref, opaque) */}
      {screenFlash && (
        <div className="pointer-events-none absolute inset-0 z-[80] bg-white" />
      )}
      {/* Flash persistant (mode "on") : voile blanc translucide qui éclaire
          le visage sans masquer la preview. */}
      {flashMode === "on" && !screenFlash && (
        <div className="pointer-events-none absolute inset-0 z-[60] bg-white/60" />
      )}

      {/* Barre d'actions haut : grille, flash, fermer */}
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <button
          type="button"
          aria-label={showGrid ? "Masquer la grille" : "Afficher la grille"}
          aria-pressed={showGrid}
          onClick={() => setShowGrid((v) => !v)}
          className={`rounded-full p-2 transition-colors ${
            showGrid
              ? "bg-white text-gray-900"
              : "bg-white/10 text-white hover:bg-white/25"
          }`}
        >
          <Grid3x3 className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label={
            flashMode === "off"
              ? "Flash désactivé (cliquer pour flash à la capture)"
              : flashMode === "capture"
                ? "Flash à la capture (cliquer pour flash continu)"
                : "Flash continu (cliquer pour désactiver)"
          }
          onClick={cycleFlash}
          title={
            flashMode === "off"
              ? "Flash : off"
              : flashMode === "capture"
                ? "Flash : à la capture"
                : "Flash : continu"
          }
          className={`rounded-full p-2 transition-colors ${
            flashMode === "on"
              ? "bg-amber-400 text-gray-900"
              : flashMode === "capture"
                ? "bg-white text-gray-900"
                : "bg-white/10 text-white hover:bg-white/25"
          }`}
        >
          {flashMode === "off" ? (
            <ZapOff className="h-5 w-5" />
          ) : (
            <Zap className="h-5 w-5" />
          )}
        </button>
        <button
          type="button"
          aria-label="Fermer la caméra"
          onClick={handleCancel}
          className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/25"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {error ? (
        <p className="max-w-sm text-center text-sm text-white">{error}</p>
      ) : (
        <>
          <div className="relative">
            <video
              ref={videoRef}
              playsInline
              muted
              className="max-h-[70dvh] max-w-[90vw] -scale-x-100 rounded-lg"
            />
            {/* Grille règle des tiers */}
            {showGrid && (
              <div className="pointer-events-none absolute inset-0">
                {/* 2 lignes verticales */}
                <div className="absolute inset-y-0 left-1/3 w-px bg-white/40" />
                <div className="absolute inset-y-0 left-2/3 w-px bg-white/40" />
                {/* 2 lignes horizontales */}
                <div className="absolute inset-x-0 top-1/3 h-px bg-white/40" />
                <div className="absolute inset-x-0 top-2/3 h-px bg-white/40" />
                {/* Repère central */}
                <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/50" />
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={!ready}
            onClick={handleCapture}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100 disabled:opacity-50"
          >
            <Camera className="h-5 w-5" />
            Capturer
          </button>
        </>
      )}
    </div>
  );
}
FILE_EOF
pnpm --filter web typecheck