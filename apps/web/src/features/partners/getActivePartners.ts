import { prisma } from "@backend/prisma";
import { logoUrlOf, parseLinks, type PartnerLink } from "@backend/modules/sitePartners/sitePartners.service";
import type { PartnerRoleValue } from "./partnerUi";

export type PublicPartner = {
  id: string;
  name: string;
  role: PartnerRoleValue;
  description: string | null;
  websiteUrl: string | null;
  links: PartnerLink[];
  logoUrl: string | null;
};

/** Partenaires affichés (composants serveur : pied de page, accueil, page d'inscription). Jamais d'erreur. */
export async function getActivePartners(): Promise<PublicPartner[]> {
  const rows = await prisma.sitePartner
    .findMany({
      where: { isActive: true },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      select: { id: true, name: true, role: true, description: true, websiteUrl: true, links: true, logoMime: true, logoUpdatedAt: true },
    })
    .catch(() => []);
  return rows.map(({ logoMime, logoUpdatedAt, links, ...p }) => ({
    ...p,
    links: parseLinks(links),
    logoUrl: logoUrlOf({ id: p.id, logoMime, logoUpdatedAt }),
  }));
}
