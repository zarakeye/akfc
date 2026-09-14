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
