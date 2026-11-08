import { CROP_QUALITY } from "@contracts/media/cropOutput";

/**
 * Encode le canvas dans le premier format demandé que le navigateur sait écrire.
 *
 * Un navigateur qui ne sait pas écrire un format ne refuse pas : `toBlob` rend du PNG. On lit donc
 * le type du résultat, et l'on passe au format suivant tant qu'il ne correspond pas. Le dernier
 * format de la liste est accepté tel que le navigateur le rend.
 */
export async function encodeCanvas(canvas: HTMLCanvasElement, types: readonly string[]): Promise<Blob | null> {
  for (let i = 0; i < types.length; i++) {
    const type = types[i];
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, CROP_QUALITY));
    if (!blob) continue;
    if (blob.type === type || i === types.length - 1) return blob;
  }
  return null;
}
