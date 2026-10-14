import { z } from "zod";

/*
 * Informations légales du club (Réglages du site → Informations légales) : identité de l'éditeur et
 * ses coordonnées légales (siège, téléphone, e-mail), directeur de la publication, hébergeur, durées
 * de conservation. Elles alimentent les pages
 * « Mentions légales » et « Politique de confidentialité » et le registre des traitements,
 * générés à partir de ces réglages. Partagé front / back.
 */

const text = (max: number) => z.string().trim().max(max);
const months = z.number().int().min(1, "Au moins 1 mois").max(120, "120 mois au plus");

export const STORAGE_REGIONS = ["", "EU", "GLOBAL"] as const;
export type StorageRegion = (typeof STORAGE_REGIONS)[number];
export const STORAGE_REGION_LABEL: Record<Exclude<StorageRegion, "">, string> = {
  EU: "Union européenne",
  GLOBAL: "Monde (répartition automatique par Cloudflare)",
};

export const saveLegalSettingsSchema = z.object({
  /** Dénomination exacte, telle que dans les statuts. */
  legalName: text(200),
  /** Numéro RNA : W suivi de 9 chiffres. */
  legalRna: text(20).refine((v) => v === "" || /^W\d{9}$/i.test(v.replace(/\s/g, "")), "Numéro RNA attendu : W suivi de 9 chiffres"),
  /** SIRET (14 chiffres), si l'association en a un. */
  legalSiret: text(20).refine((v) => v === "" || /^\d{14}$/.test(v.replace(/\s/g, "")), "SIRET attendu : 14 chiffres"),
  /** Siège social (une ligne par élément) : celui des statuts, pas forcément le lieu des cours. */
  legalAddress: text(300),
  /** Téléphone de l'association, obligatoire dans les mentions légales (LCEN, art. 6). */
  legalPhone: text(40).refine((v) => v === "" || /^\+?[\d\s.()-]{6,}$/.test(v), "Numéro de téléphone invalide"),
  /** E-mail de l'association, cité par les documents légaux (droits RGPD compris). */
  legalEmail: text(200).refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Adresse e-mail invalide"),
  /** Directeur de la publication (en pratique le président ou la présidente). */
  publicationDirector: text(120),
  /** Sa qualité, ex. « présidente de l'association ». */
  publicationDirectorTitle: text(120),
  hostName: text(160),
  hostAddress: text(300),
  hostPhone: text(40),
  hostUrl: text(200).refine((v) => v === "" || /^https?:\/\/\S+$/.test(v), "Adresse web invalide"),
  /** Région du stockage Cloudflare R2 (documents, sauvegardes). */
  storageRegion: z.enum(STORAGE_REGIONS),
  /** Mention « Conception et réalisation » (facultative). */
  credits: text(500),
  /** Compte supprimé au plus tard N mois après la fin de la dernière adhésion. */
  accountRetentionMonths: months,
  /** Demande close supprimée N mois après son dernier échange. */
  ticketRetentionMonths: months,
  /** Durée de conservation des sauvegardes, en jours (vide : non renseignée). */
  backupRetentionDays: z.number().int().min(1).max(3650).nullable(),
});
export type SaveLegalSettingsInput = z.infer<typeof saveLegalSettingsSchema>;

/** Format d'affichage d'un RNA ou d'un SIRET saisi avec ou sans espaces. */
export const compactId = (v: string): string => v.replace(/\s/g, "").toUpperCase();
