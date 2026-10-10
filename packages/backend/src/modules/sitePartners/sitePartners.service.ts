import type { PrismaClient, SitePartnerRole } from "@prisma/client";
import { TRPCError } from "@trpc/server";

/*
 * Partenaires du club (MJC, fédération…). Logos stockés en base (quelques fichiers légers),
 * servis par /api/site-partners/{id}/logo.
 */

export const LOGO_MAX_BYTES = 512 * 1024;
export const LOGO_MIME_TYPES = ["image/svg+xml", "image/png", "image/webp", "image/jpeg"] as const;
export type LogoMime = (typeof LOGO_MIME_TYPES)[number];

export type PartnerLink = { label: string; url: string };

/** Lien http(s) uniquement (pas de javascript:, data:…). */
export function isSafeHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

/** Liens stockés (JSON) → liste propre ; ignore toute entrée mal formée. */
export function parseLinks(value: unknown): PartnerLink[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((l) =>
    l && typeof l === "object" && typeof (l as PartnerLink).label === "string" && typeof (l as PartnerLink).url === "string" && isSafeHttpUrl((l as PartnerLink).url)
      ? [{ label: (l as PartnerLink).label, url: (l as PartnerLink).url }]
      : [],
  );
}

/**
 * Contrôle d'un logo envoyé : type, taille, signature du fichier, et pour un SVG l'absence de
 * script ou de contenu actif (servi par notre origine, il ne doit rien pouvoir exécuter).
 */
export function validateLogo(buf: Buffer, mime: LogoMime): void {
  const bad = (message: string): never => {
    throw new TRPCError({ code: "BAD_REQUEST", message });
  };
  if (buf.length === 0) bad("Fichier vide.");
  if (buf.length > LOGO_MAX_BYTES) bad("Logo trop volumineux (512 Ko au plus).");
  const head = buf.subarray(0, 16);
  if (mime === "image/png" && !head.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) bad("Ce fichier n'est pas un PNG.");
  if (mime === "image/jpeg" && !(head[0] === 0xff && head[1] === 0xd8)) bad("Ce fichier n'est pas un JPEG.");
  if (mime === "image/webp" && !(head.subarray(0, 4).toString("latin1") === "RIFF" && head.subarray(8, 12).toString("latin1") === "WEBP")) bad("Ce fichier n'est pas un WebP.");
  if (mime === "image/svg+xml") {
    const text = buf.toString("utf8");
    if (!/<svg[\s>]/i.test(text)) bad("Ce fichier n'est pas un SVG.");
    if (/<script|<foreignObject|\son[a-z]+\s*=|javascript:|<iframe|<embed|<object/i.test(text)) {
      bad("Ce SVG contient du contenu actif (script, événement, lien javascript) : refusé.");
    }
    if (/(?:xlink:)?href\s*=\s*["']\s*(?:https?:)?\/\//i.test(text)) bad("Ce SVG charge une ressource externe : refusé.");
  }
}

export function logoUrlOf(p: { id: string; logoUpdatedAt: Date | null; logoMime: string | null }): string | null {
  return p.logoMime && p.logoUpdatedAt ? `/api/site-partners/${p.id}/logo?v=${p.logoUpdatedAt.getTime()}` : null;
}

const MJC_NAME = "MJC de Chambéry";
const MJC_OLD_DESCRIPTION = "Nos cours et stages ont lieu à la MJC ; inscriptions et paiements se font à son accueil.";
const MJC_DESCRIPTION = "Nos cours et stages ont lieu à la MJC ; on s'y inscrit en ligne (plateforme d'inscription de la MJC) ou à son accueil.";
const MJC_WEBSITE = "https://www.mjc-chambery.com";
const MJC_LINKS: PartnerLink[] = [
  { label: "S'inscrire en ligne : activités de la MJC", url: "https://mjc-chambery.goasso.org/activites" },
  { label: "Inscriptions et adhésion : tarifs et calendrier", url: "https://mjc-chambery.goasso.org/actualites/inscriptions-et-adhesion" },
  { label: "Tutoriel d'inscription en ligne", url: "https://mjc-chambery.goasso.org/pages/tutoriel-d-inscription" },
];

const DEFAULTS: Array<{ name: string; role: SitePartnerRole; description: string; websiteUrl: string | null; links: PartnerLink[] }> = [
  {
    name: MJC_NAME,
    role: "HOST",
    description: MJC_DESCRIPTION,
    websiteUrl: MJC_WEBSITE,
    links: MJC_LINKS,
  },
  {
    name: "Fédération Française de Karaté et Disciplines Associées",
    role: "FEDERATION",
    description: "Le club est affilié à la FFK ; les sifus proposent la licence en début de saison.",
    websiteUrl: "https://www.ffkarate.fr/",
    links: [],
  },
];

/**
 * Crée les deux partenaires du club s'il n'en existe AUCUN (premier démarrage). Ne touche jamais
 * à des partenaires existants. Les logos s'ajoutent ensuite dans Réglages du site.
 */
export async function ensureDefaultPartners(db: PrismaClient): Promise<number> {
  if ((await db.sitePartner.count()) > 0) return completeMjcPartner(db);
  await db.sitePartner.createMany({ data: DEFAULTS.map((d, position) => ({ ...d, position })) });
  return DEFAULTS.length;
}

/**
 * Partenaire MJC créé par une version précédente (sans site ni liens) : complète UNIQUEMENT les
 * champs restés vides ou d'origine — rien de ce qu'un administrateur a saisi n'est remplacé.
 * Renvoie 1 si la fiche a été complétée, 0 sinon.
 */
async function completeMjcPartner(db: PrismaClient): Promise<number> {
  const mjc = await db.sitePartner.findFirst({
    where: { name: MJC_NAME, role: "HOST" },
    select: { id: true, websiteUrl: true, links: true, description: true },
  });
  if (!mjc) return 0;
  const data: { websiteUrl?: string; links?: PartnerLink[]; description?: string } = {};
  if (!mjc.websiteUrl) data.websiteUrl = MJC_WEBSITE;
  if (parseLinks(mjc.links).length === 0) data.links = MJC_LINKS;
  if (mjc.description === MJC_OLD_DESCRIPTION) data.description = MJC_DESCRIPTION;
  if (Object.keys(data).length === 0) return 0;
  await db.sitePartner.update({ where: { id: mjc.id }, data });
  return 1;
}
