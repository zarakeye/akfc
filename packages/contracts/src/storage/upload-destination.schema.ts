import { z } from "zod";

/**
 * upload-destination.schema.ts
 *
 * Destination d'un envoi — partagée backend/frontend.
 *
 * `Destination` est un discriminated union qui encode l'intention métier :
 *   - `existing-discipline` : pointer vers une Discipline déjà inscrite en DB
 *   - `new-discipline`      : proposer un nom de Discipline qu'un admin
 *                             devra valider après coup (pattern de commit
 *                             différé — côté DB, `MediaAsset.disciplineId`
 *                             reste null et `MediaAsset.proposedDisciplineName`
 *                             porte le nom proposé jusqu'à validation).
 */

export const uploadDestinationSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("existing-discipline"),
    categoryId: z.number().int().positive(),
    disciplineId: z.number().int().positive(),
  }),
  z.object({
    kind: z.literal("new-discipline"),
    categoryId: z.number().int().positive(),
    proposedDisciplineName: z.string().trim().min(1).max(120),
  }),
  // ── Destinations découplées de la discipline (fondation) ──
  // `general` : contenus du club sans discipline ni catégorie. Fait office
  //             d'espace partagé de fait entre admins (pas de permissions :
  //             club petit, confiance).
  z.object({
    kind: z.literal("common_repository"),
    // Sous-dossier OPTIONNEL sous `general/` (existant ou créé à la volée).
    // Absent → dépôt à la racine de `general/`.
    containerName: z.string().trim().min(1).max(120).optional(),
  }),
  // `perso`   : espace personnel de l'admin. Aucune identité transportée ici —
  //             le dossier cible est dérivé côté serveur de `ctx.user.id`, si
  //             bien qu'un admin ne peut uploader QUE dans son propre dossier.
  z.object({
    kind: z.literal("perso"),
  }),
  // `event` : contenus d'un événement (forum des associations, démonstration).
  // L'événement est créé par les admins ; le membre le choisit ici. Les
  // `disciplineIds` ENRICHISSENT les disciplines de l'événement (elles
  // décrivent l'ÉVÉNEMENT, pas chaque photo).
  z.object({
    kind: z.literal("event"),
    eventId: z.number().int().positive(),
    disciplineIds: z.array(z.number().int().positive()).default([]),
  }),
  // `stage` : contenus d'un stage existant (interne ou externe au club).
  // Le stage est créé par les admins ; on en choisit un ici. Rattachement
  // par le chemin `seminars/…` (MediaAsset n'a pas de seminarId).
  z.object({
    kind: z.literal("seminar"),
    seminarId: z.number().int().positive(),
  }),
  // Espace d'un groupe collaboratif : dépôt réservé aux éditeurs/admins
  // (garde côté router). Rattachement par le chemin `groups/…`.
  z.object({
    kind: z.literal("group"),
    groupId: z.string(),
  }),
]);

/** Destination d'un envoi (bibliothèque, espace commun, perso, événement, stage, groupe). */
export type UploadDestination = z.infer<typeof uploadDestinationSchema>;
