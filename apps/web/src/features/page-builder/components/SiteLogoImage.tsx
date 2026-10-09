"use client";

import { useEffect, useState, type JSX } from "react";

import {
  backdropFor,
  measureLogoLuminance,
  sameOriginLogoUrl,
  type LogoBackdrop,
} from "@features/admin/site-settings/LogoPreview";

/**
 * Logo du site posé dans un bloc (média « logo du site » d'un média-texte ou d'un texte enrobant).
 *
 * Un logo est fait pour un fond donné : posé tel quel sur la page, un logo clair (celui d'AKFC
 * est blanc) disparaît sur fond blanc. On le présente donc sur un fond adapté, comme l'aperçu
 * des Réglages du site : sombre pour un logo clair, clair pour un logo sombre. La luminance est
 * mesurée dans le navigateur ; en attendant (et si la mesure échoue), fond sombre — le cas du
 * logo actuel, donc ni clignotement ni écart entre rendu serveur et client.
 */
export function SiteLogoImage({ src, alt }: { src: string; alt: string }): JSX.Element {
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
      className={`flex items-center justify-center rounded-md p-[10%] ${
        backdrop === "dark" ? "bg-neutral-900" : "bg-white ring-1 ring-border"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" decoding="async" className="block h-auto w-full object-contain" />
    </div>
  );
}
