// src/types/picture.ts
export type PictureItem = {
  id: string;
  file: File; // version actuelle pour submit
  originalFile: File; // version originale pour reset
  previewUrl: string; // URL.createObjectURL(file) pour la preview
};
