import { z } from 'zod';

export const folderKindSchema = z.enum(['pending', 'published', 'bin']);

/* ---------- SOURCE ---------- */

const fileSourceSchema = z.object({
  type: z.literal('file'),
  fullPath: z.string().min(1),
});

const folderSourceSchema = z.object({
  type: z.literal('folder'),
  fullPath: z.string().min(1),
});

/**
 * ✅ Multi-selection support
 */
const selectionSourceSchema = z.object({
  type: z.literal('selection'),
  roots: z.array(z.string().min(1)).min(1),
  excluded: z.array(z.string().min(1)).optional(),
});

const sourceSchema = z.discriminatedUnion('type', [
  fileSourceSchema,
  folderSourceSchema,
  selectionSourceSchema,
]);

/* ---------- TARGET ---------- */

const virtualTargetSchema = z.object({
  type: z.literal('virtual-folder'),
  status: folderKindSchema,
});

const folderTargetSchema = z.object({
  type: z.literal('folder'),
  fullPath: z.string().min(1),
});

const targetSchema = z.discriminatedUnion('type', [
  virtualTargetSchema,
  folderTargetSchema,
]);

/* ---------- MOVE INTENT ---------- */

export const moveSchema = z.object({
  source: sourceSchema,
  target: targetSchema,
});

export type MoveIntent = z.infer<typeof moveSchema>;
