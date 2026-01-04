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
