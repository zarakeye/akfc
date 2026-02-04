import type { MoveIntent } from '@/server/cloudinary/schemas/move.schema';

/**
 * Élément draggable (UI)
 */
export type DragSource = MoveIntent['source'];

/**
 * Cible de drop (UI)
 */
export type MoveTarget = MoveIntent['target'];
