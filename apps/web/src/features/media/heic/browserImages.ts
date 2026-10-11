/**
 * Photos HEIC / HEIF (iPhone, Mac) → JPEG, dans le navigateur, avant l'envoi.
 *
 * Seul Safari sait afficher le HEIC : envoyé tel quel, il serait illisible pour
 * les autres visiteurs. La conversion se fait sur l'appareil (la photo ne
 * transite pas par un service tiers) grâce à libheif compilé en WebAssembly
 * (paquet `heic-to`, LGPL-3.0, chargé à la demande : ~3 Mo, seulement quand
 * une photo HEIC est choisie).
 */
import type { Accept } from "react-dropzone";

/** Types à ajouter au `accept` des zones de dépôt pour autoriser les HEIC. */
export const HEIC_ACCEPT: Accept = {
  "image/heic": [".heic"],
  "image/heif": [".heif"],
};

const HEIC_MIME = /^image\/(heic|heif)(-sequence)?$/i;
const HEIC_EXT = /\.(heic|heif)$/i;

/** Le fichier est-il une photo HEIC / HEIF (par type, ou par extension si le navigateur n'en donne pas) ? */
export function isHeicFile(file: File): boolean {
  return HEIC_MIME.test(file.type) || HEIC_EXT.test(file.name);
}

/** Nombre de photos HEIC dans une sélection. */
export function countHeic(files: File[]): number {
  return files.filter(isHeicFile).length;
}

const JPEG_QUALITY = 0.9;

async function heicToJpegFile(file: File): Promise<File> {
  const { heicTo } = await import("heic-to");
  const blob = await heicTo({ blob: file, type: "image/jpeg", quality: JPEG_QUALITY });
  const name = HEIC_EXT.test(file.name) ? file.name.replace(HEIC_EXT, ".jpg") : `${file.name}.jpg`;
  return new File([blob], name, { type: "image/jpeg", lastModified: file.lastModified });
}

export type BrowserImagesResult = {
  /** Fichiers prêts à l'envoi, dans l'ordre d'origine (HEIC remplacés par leur JPEG). */
  files: File[];
  /** Noms des photos HEIC qui n'ont pas pu être converties (écartées de `files`). */
  failed: string[];
};

/** Remplace chaque HEIC par un JPEG ; les autres fichiers passent tels quels. Une photo à la fois (mémoire des téléphones). */
export async function toBrowserImages(files: File[]): Promise<BrowserImagesResult> {
  const out: File[] = [];
  const failed: string[] = [];
  for (const file of files) {
    if (!isHeicFile(file)) {
      out.push(file);
      continue;
    }
    try {
      out.push(await heicToJpegFile(file));
    } catch (err) {
      console.error("[heic] conversion impossible :", file.name, err);
      failed.push(file.name);
    }
  }
  return { files: out, failed };
}

/** Message à afficher pour des conversions échouées. */
export function heicFailureMessage(failed: string[]): string {
  return failed.length === 1
    ? `La photo « ${failed[0]} » (format iPhone HEIC) n'a pas pu être convertie. Exporte-la en JPEG puis réessaie.`
    : `${failed.length} photos au format iPhone HEIC n'ont pas pu être converties (${failed.join(", ")}). Exporte-les en JPEG puis réessaie.`;
}

/** Message affiché pendant la conversion. */
export function heicProgressMessage(count: number): string {
  return count === 1 ? "Conversion de la photo iPhone (HEIC) en JPEG…" : `Conversion de ${count} photos iPhone (HEIC) en JPEG…`;
}
