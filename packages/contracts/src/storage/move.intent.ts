import { z } from 'zod';

/**
 * Intention de déplacement, niveau utilisateur — couche 3 du pipeline de move.
 *
 * ─── Le pipeline en trois couches ──────────────────────────────────────────
 *
 *   Couche 3 — INTENTION (ce fichier)
 *     « déplace cette sélection dans le dossier `AKFC/courses/kali` »
 *     Concepts riches : un fichier, un dossier, ou une sélection (racines + exclusions).
 *
 *   Couche 2 — RÉSOLUTION (service `planMoveOperations`, côté backend)
 *     Développe la sélection en N éléments concrets et calcule la cible de chacun :
 *     `<dossier cible>/<dernier segment de la source>`.
 *
 *   Couche 1 — OPÉRATION (`StorageMoveOperation`, cf. storage.types.ts)
 *     « renomme `AKFC/events/forum/affiche.png` en `AKFC/courses/kali/affiche.png` »
 *     Exécutée par l'adapter de stockage (R2 aujourd'hui).
 *
 * ─── Ce que l'intention ne porte plus ─────────────────────────────────────
 *
 * Au temps de Cloudinary, le statut d'un fichier était un segment de son chemin
 * (`AKFC/pending/…`, `AKFC/published/…`) et publier était un DÉPLACEMENT : une cible
 * `status-folder` existait pour cela. Le statut vit désormais dans `MediaAsset.status`
 * (`media.setStatus`), et la corbeille a son propre circuit (`trash.trashToBin`) : un
 * déplacement ne vise plus qu'un dossier.
 */

/* -------------------------------------------------------------------------- */
/*  Sources possibles d'un move                                               */
/* -------------------------------------------------------------------------- */

const fileSourceSchema = z.object({
  type: z.literal('file'),
  path: z.string().min(1),
});

const folderSourceSchema = z.object({
  type: z.literal('folder'),
  path: z.string().min(1),
});

/**
 * Sélection multi-items.
 *
 * `roots` désigne les paths inclus dans la sélection (au moins un).
 * `excluded` permet d'exclure des sous-paths d'une racine englobante — par exemple
 * « tout sous `courses/kali/` sauf `courses/kali/brouillons/` ».
 *
 * La résolution (couche 2) développe cette sélection en N opérations atomiques en
 * s'appuyant sur l'adapter pour lister les enfants des racines et filtrer les exclus.
 */
const selectionSourceSchema = z.object({
  type: z.literal('selection'),
  roots: z.array(z.string().min(1)).min(1),
  excluded: z.array(z.string().min(1)).optional(),
});

const moveSourceSchema = z.discriminatedUnion('type', [
  fileSourceSchema,
  folderSourceSchema,
  selectionSourceSchema,
]);

export type StorageMoveSource = z.infer<typeof moveSourceSchema>;

/* -------------------------------------------------------------------------- */
/*  Cible d'un move                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Cible exprimée par un dossier concret.
 * Exemple : `target: { type: 'folder', path: 'AKFC/courses/kali' }`.
 *
 * Le discriminant `type` est conservé : il garde le contrat extensible sans changer la
 * forme envoyée par le front.
 */
const moveTargetSchema = z.object({
  type: z.literal('folder'),
  path: z.string().min(1),
});

export type StorageMoveTarget = z.infer<typeof moveTargetSchema>;

/* -------------------------------------------------------------------------- */
/*  L'intention complète                                                      */
/* -------------------------------------------------------------------------- */

export const storageMoveIntentSchema = z.object({
  source: moveSourceSchema,
  target: moveTargetSchema,
});

export type StorageMoveIntent = z.infer<typeof storageMoveIntentSchema>;
