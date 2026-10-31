import type { PrismaClient } from "@prisma/client";
import type { ImageUsageValue } from "@contracts/legal/imageConsent";

/**
 * Ordre des formulaires de droit à l'image : par la date des DROITS, pas par la date de dépôt.
 *
 * Un formulaire papier signé en mars et déposé en octobre donne des droits de mars. Les droits d'un
 * membre ne changent que si des droits plus récents sont enregistrés (décision du club) : déposer
 * un ancien formulaire l'archive comme preuve, sans toucher au statut ; en supprimer un ne change
 * rien non plus.
 */
type Dated = { signedAt: Date | null; createdAt: Date };

/** Date à laquelle un formulaire a donné ses droits : sa signature, à défaut son dépôt. */
export function formEffectiveAt(f: Dated): Date {
  return f.signedAt ?? f.createdAt;
}

/** Du plus récent au plus ancien par date des droits ; à date égale, le dernier déposé d'abord. */
export function byEffectiveDesc(a: Dated, b: Dated): number {
  return formEffectiveAt(b).getTime() - formEffectiveAt(a).getTime() || b.createdAt.getTime() - a.createdAt.getTime();
}

/** Usages du formulaire le plus récent par date des droits (null : aucun formulaire). */
export async function latestFormUsages(prisma: PrismaClient, userId: string): Promise<ImageUsageValue[] | null> {
  const forms = await prisma.imageConsentForm.findMany({
    where: { userId },
    select: { usages: true, signedAt: true, createdAt: true },
  });
  return forms.sort(byEffectiveDesc)[0]?.usages ?? null;
}
