const APP_PREFIX = process.env.NEXT_PUBLIC_CLOUDINARY_APP_PREFIX;

/**
 * Returns true if the publicId corresponds to a pending or published image.
 * PublicIds of the form <APP_PREFIX>/pending/<image_id> or <APP_PREFIX>/published/<image_id> are considered pending or published respectively.
 * @param {string} publicId - The publicId to check.
 * @returns {boolean} - True if the publicId corresponds to a pending or published image, false otherwise.
 */
export function isPendingOrPublished(publicId: string): boolean {
  return (
    publicId.startsWith(`${APP_PREFIX}/pending/`) ||
    publicId.startsWith(`${APP_PREFIX}/published/`)
  );
}

/**
 * Returns true if the publicId corresponds to a binary image.
 * PublicIds of the form <APP_PREFIX>/bin/<image_id> are considered binary images.
 * @param {string} publicId - The publicId to check.
 * @returns {boolean} - True if the publicId corresponds to a binary image, false otherwise.
 */
export function isBin(publicId: string): boolean {
  return publicId.startsWith(`${APP_PREFIX}/bin/`);
}

/**
 * Returns the publicId with the first part replaced by "bin".
 * This is used to move an image from pending or published to binary.
 * @example
 * moveToBin("mon_app/pending/category/activity/img") returns "mon_app/bin/category/activity/img"
 * @param {string} publicId - The publicId to move to binary.
 * @returns {string} - The publicId with the first part replaced by "bin".
 */
export function moveToBin(publicId: string): string {
  const parts = publicId.split("/");

  // ex: mon_app / pending / categorie / activité / img
  //
  parts[1] = "bin";

  return parts.join("/");
}

/**
 * Validates that a restored public_id stays inside the app namespace.
 * @param {string} publicId - The publicId to validate.
 * @returns {boolean} - True if the publicId is valid, false otherwise.
 */
export function isInsideApp(publicId: string): boolean {
  return publicId.startsWith(`${APP_PREFIX}`);
}