import { prisma } from "@backend/prisma";
import { parsePageContentV1, type PageContentV1 } from "@contracts/page";
import type { StorageRegion } from "@contracts/legal/legalSettings.schema";
import type { RetentionSettings } from "@contracts/legal/processingRegister";

/**
 * Informations légales lues dans les Réglages du site, prêtes pour les pages « Mentions légales »
 * et « Politique de confidentialité » (et le registre). Un champ non renseigné vaut null : la page
 * l'annonce « en cours de renseignement » au lieu d'inventer une valeur. Siège, téléphone et e-mail
 * viennent des coordonnées LÉGALES, jamais des coordonnées publiques (« Nous contacter »).
 */
export type LegalInfo = RetentionSettings & {
  name: string | null;
  rna: string | null;
  siret: string | null;
  addressLines: string[];
  phone: string | null;
  email: string | null;
  director: string | null;
  directorTitle: string | null;
  host: { name: string | null; address: string | null; phone: string | null; url: string | null };
  credits: string | null;
  updatedAt: Date | null;
};

export async function getLegalInfo(): Promise<LegalInfo> {
  const s = await prisma.siteSettings.findUnique({ where: { id: "site" } });
  const region = s?.storageRegion === "EU" || s?.storageRegion === "GLOBAL" ? s.storageRegion : "";
  return {
    name: s?.legalName ?? null,
    rna: s?.legalRna ?? null,
    siret: s?.legalSiret ?? null,
    addressLines: (s?.legalAddress ?? "").split("\n").map((l) => l.trim()).filter(Boolean),
    phone: s?.legalPhone ?? null,
    email: s?.legalEmail ?? null,
    director: s?.publicationDirector ?? null,
    directorTitle: s?.publicationDirectorTitle ?? null,
    host: { name: s?.hostName ?? null, address: s?.hostAddress ?? null, phone: s?.hostPhone ?? null, url: s?.hostUrl ?? null },
    credits: s?.credits ?? null,
    updatedAt: s?.legalUpdatedAt ?? null,
    accountRetentionMonths: s?.accountRetentionMonths ?? 12,
    ticketRetentionMonths: s?.ticketRetentionMonths ?? 36,
    backupRetentionDays: s?.backupRetentionDays ?? null,
    storageRegion: region as StorageRegion,
  };
}

/** Compléments libres d'une page légale, rédigés dans le constructeur (SitePage du même slug). */
export async function getLegalComplement(slug: string): Promise<PageContentV1> {
  const page = await prisma.sitePage.findUnique({ where: { slug }, select: { content: true } });
  return parsePageContentV1(page?.content);
}
