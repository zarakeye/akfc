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
 * Undo user-applied transforms (zoom + rotation)
 * on a rect expressed in image pixel space.
 *
 * Order is CRITICAL:
 * 1) reverse rotation
 * 2) reverse scale
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
