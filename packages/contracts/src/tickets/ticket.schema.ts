import { z } from "zod";

/** Bornes partagées par le formulaire et le serveur (mêmes valeurs que tickets.service). */
export const TICKET_SUBJECT_MAX = 200;
export const TICKET_BODY_MAX = 20_000;
export const TICKET_NAME_MAX = 120;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Formulaire de contact → nouvelle demande.
 * Connecté : `email`/`name` sont ignorés, le serveur prend ceux du compte.
 * Visiteur : `email` obligatoire (contrôlé côté serveur), `name` conseillé.
 * `website` : champ piège invisible (anti-robots) — doit rester vide.
 */
export const submitTicketSchema = z.object({
  categoryKey: z.string().min(1, "Choisissez un destinataire"),
  subject: z
    .string()
    .trim()
    .min(1, "L'objet est obligatoire")
    .max(TICKET_SUBJECT_MAX, `L'objet ne doit pas dépasser ${TICKET_SUBJECT_MAX} caractères`),
  body: z
    .string()
    .trim()
    .min(1, "Le message est obligatoire")
    .max(TICKET_BODY_MAX, `Le message ne doit pas dépasser ${TICKET_BODY_MAX} caractères`),
  email: z
    .string()
    .trim()
    .refine((v) => v === "" || EMAIL_RE.test(v), "Adresse e-mail invalide")
    .optional(),
  name: z.string().trim().max(TICKET_NAME_MAX).optional(),
  website: z.string().optional(),
});

export type SubmitTicketInput = z.infer<typeof submitTicketSchema>;

/** Longueur maximale d'une note de transfert (même valeur que tickets.service). */
export const TICKET_NOTE_MAX = 2_000;

/** Réponse du club au demandeur (procédure ticket.reply, server action du formulaire de réponse). */
export const replyTicketSchema = z.object({
  id: z.string().min(1),
  body: z
    .string()
    .trim()
    .min(1, "La réponse est vide.")
    .max(TICKET_BODY_MAX, `La réponse ne doit pas dépasser ${TICKET_BODY_MAX} caractères.`),
});

/** Passage de relais, avec une note (procédure ticket.transfer, server action du transfert). */
export const transferTicketSchema = z.object({
  id: z.string().min(1),
  toUserId: z.string().min(1, "Choisissez une personne."),
  note: z
    .string()
    .trim()
    .min(1, "La note est obligatoire.")
    .max(TICKET_NOTE_MAX, `La note ne doit pas dépasser ${TICKET_NOTE_MAX} caractères.`),
});
