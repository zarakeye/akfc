type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Transform = {
  scale: number;
  rotation: number; // en degrés
};

/**
 * Given a crop rect expressed in IMAGE PIXEL SPACE
 * but visually transformed by CSS (zoom + rotation),
 * this function returns the rect in ORIGINAL IMAGE PIXELS.
 *
 * ⚠️ Order is critical:
 * 1) undo rotation
 * 2) undo scale
 *
 * This function does NOT draw anything.
 * It only locates the correct pixels.
 *
 * @param {Object} grid - A crop rect expressed in IMAGE PIXEL SPACE
 * @param {Object} imageSize - The original image size
 * @param {Object} transform - The visual transformation (zoom + rotation)
 * @returns {Object} The rect in ORIGINAL IMAGE PIXELS
 */
export default function untranformImageRect(
  grid: Rect,
  imageSize: { width: number; height: number },
  transform: Transform
): Rect {
  // Image center (pivot of all transforms)
  const cx = imageSize.width / 2;
  const cy = imageSize.height / 2;

  // Grid center in transformed image space
  const gridCenterX = grid.x + grid.width / 2;
  const gridCenterY = grid.y + grid.height / 2;

  // 1️⃣ translate rect center to image-centered coordinates
  const dx = gridCenterX - cx;
  const dy = gridCenterY - cy;

  // 2️⃣ undo user rotation (reverse rotation around image center)
  const angle = (-transform.rotation * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const rx = dx * cos - dy * sin;
  const ry = dx * sin + dy * cos;

  // 3️⃣ reverse scale (zoom)
  const sx = rx / transform.scale;
  const sy = ry / transform.scale;

  // 4️⃣ Back to image coordinates
  const imageCenterX = cx + sx;
  const imageCenterY = cy + sy;

  return {
    x: imageCenterX - grid.width / 2,
    y: imageCenterY - grid.height / 2,
    width: grid.width,
    height: grid.height,
  };
}
