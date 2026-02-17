/**
 * move.types.ts
 *
 * Action effectuée :
 * - Correction de ServerMoveSource pour éviter le type [][].
 * - ServerMoveSource représente maintenant UN élément unitaire,
 *   pas le tableau complet.
 * - Alignement total avec le nouveau move.schema basé sur Zod.
 */

import type { MoveIntent } from '@/server/cloudinary/schemas/move.schema';

/**
 * ✅ Payload transporté par le Drag & Drop (UI)
 * Toujours un tableau explicite d'éléments unitaires
 */
export type DragSource = MoveIntent['source'];

/**
 * ✅ Cible serveur
 */
export type MoveTarget = MoveIntent['target'];

/**
 * Source minimale côté serveur (file ou folder uniquement)
 */
export type ServerMoveSource =
  | { type: 'file'; fullPath: string }
  | { type: 'folder'; fullPath: string };

