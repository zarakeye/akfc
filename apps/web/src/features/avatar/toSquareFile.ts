/**
 * Recadre un fichier image en CARRÉ CENTRÉ (le plus grand carré possible,
 * pris au centre). Post-traitement de l'avatar : l'utilisateur croppe
 * librement avec le Cropper habituel, puis on garantit le 1:1 ici — sans
 * toucher au Cropper partagé. Retourne un nouveau File PNG.
 */
export async function toSquareFile(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - side) / 2;
  const sy = (bitmap.height - side) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = side;
  canvas.height = side;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D indisponible.");
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, side, side);

  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob a échoué."))),
      "image/png",
    ),
  );
  return new File([blob], "avatar.png", { type: "image/png" });
}
