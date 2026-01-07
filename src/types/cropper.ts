import { PictureItem } from "./picture";

export type CropperProps = {
  picture: PictureItem;
  onCancel: () => void;
  onCrop: (result: CropResult) => void;
};

export type CropResult = {
  pictureId: string;
  croppedFile: File;
};

export type CropGrid = {
  x: number;      // position dans l’établi
  y: number;
  width: number;
  height: number;
};

export type ViewportTransform = {
  zoom: number;
  rotation: number;
  workspaceWidth: number;
  workspaceHeight: number;
  imageWidth: number;   // naturalWidth
  imageHeight: number;  // naturalHeight
};
