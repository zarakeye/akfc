"use client";

import { useEffect, useState, type JSX } from "react";

/** Fond de l'aperçu : sombre pour un logo clair, clair pour un logo sombre. */
export type LogoBackdrop = "dark" | "light";

/**
 * URL lisible par un canvas (même origine). Le logo R2 est servi par une redirection vers R2,
 * une autre origine : un canvas qui le dessinerait deviendrait illisible (« tainted »).
 * `?raw=1` demande à la route de renvoyer le SVG lui-même.
 */
export function sameOriginLogoUrl(src: string): string {
  if (!src.startsWith("/api/media/site-logo")) return src;
  return `${src}${src.includes("?") ? "&" : "?"}raw=1`;
}

/** Luminance ≥ 0,5 : logo clair, donc fond sombre. Mesure impossible : fond sombre (celui de l'en-tête). */
export function backdropFor(luminance: number | null): LogoBackdrop {
  return luminance === null || luminance >= 0.5 ? "dark" : "light";
}

/**
 * Luminance moyenne (0 = noir, 1 = blanc) des pixels visibles du logo, pondérée par leur opacité.
 * null si l'image est illisible ou entièrement transparente.
 */
export async function measureLogoLuminance(url: string): Promise<number | null> {
  let objectUrl: string | null = null;
  try {
    const res = await fetch(url, { credentials: "same-origin" });
    if (!res.ok) return null;
    objectUrl = URL.createObjectURL(await res.blob());
    const img = new Image();
    img.src = objectUrl;
    await img.decode();

    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, size, size);
    const { data } = ctx.getImageData(0, 0, size, size);

    let weight = 0;
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3] / 255;
      if (alpha < 0.1) continue;
      const lum = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
      sum += lum * alpha;
      weight += alpha;
    }
    return weight > 0 ? sum / weight : null;
  } catch {
    return null;
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}

/** Aperçu du logo des réglages, sur un fond choisi d'après la couleur du logo. */
export function LogoPreview({ src, alt = "Logo du site" }: { src: string; alt?: string }): JSX.Element {
  const [backdrop, setBackdrop] = useState<LogoBackdrop>("dark");

  useEffect(() => {
    let cancelled = false;
    void measureLogoLuminance(sameOriginLogoUrl(src)).then((lum) => {
      if (!cancelled) setBackdrop(backdropFor(lum));
    });
    return () => {
      cancelled = true;
    };
  }, [src]);

  return (
    <div
      className={`flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border p-2 ${
        backdrop === "dark" ? "border-gray-700 bg-neutral-900" : "border-gray-300 bg-white"
      }`}
      title={backdrop === "dark" ? "Logo clair : aperçu sur fond sombre" : "Logo sombre : aperçu sur fond clair"}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="h-full w-full object-contain" />
    </div>
  );
}
