// src/cropper-elements.d.ts
//
// Déclaration JSX des custom elements de Cropper.js v2 (web components).
// Typage minimal (attributs HTML standards) : ces éléments ne sont pas
// utilisés en JSX actuellement — la galerie passe par
// gallery-crop/components/Cropper.tsx — donc ce fichier peut être supprimé
// s'il s'avère mort.
import type { DetailedHTMLProps, HTMLAttributes } from "react";

type CropperElementProps = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
>;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "cropper-image": CropperElementProps;
      "cropper-canvas": CropperElementProps;
      "cropper-viewer": CropperElementProps;
    }
  }
}

export {};