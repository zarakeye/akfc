import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { ageOn } from "@akfc/contracts/legal/imageConsent.ts";

/**
 * Majorité d'un membre et, pour un mineur, date de naissance et parent référent. Saisis par un
 * administrateur (instructeur), jamais par le membre : un mineur ne doit pas pouvoir se déclarer
 * majeur, ni indiquer une adresse à lui comme celle de son parent.
 */
export const legalInfoInput = z.object({
  legalAge: z.enum(["UNKNOWN", "ADULT", "MINOR"]),
  /**
   * AAAA-MM-JJ ; null : non renseignée. Absente (fiche d'un compte) : la date enregistrée est
   * gardée — la fiche ne l'affiche pas, elle ne peut donc pas la renvoyer.
   */
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide.").nullable().optional(),
  guardianName: z.string().trim().max(120).nullable(),
  guardianEmail: z.string().trim().toLowerCase().email("Adresse e-mail du parent invalide.").max(254).nullable(),
  /** Qualité du parent (« mère »…). Absente (ancien formulaire) : la valeur enregistrée est gardée. */
  guardianRelation: z.string().trim().max(60).nullable().optional(),
  /** Téléphone du parent, facultatif. Absent (ancien formulaire) : la valeur enregistrée est gardée. */
  guardianPhone: z.string().trim().max(30).nullable().optional(),
});
export type LegalInfoInput = z.infer<typeof legalInfoInput>;

function bad(message: string): never {
  throw new TRPCError({ code: "BAD_REQUEST", message });
}

/**
 * Données Prisma à écrire. Une date de naissance, quand elle est donnée, DÉCIDE de la majorité :
 * le choix « majeur / mineur » ne sert que sans elle. `requireComplete` (création d'un compte) : un
 * mineur exige le nom et l'adresse du parent ; sa date de naissance reste facultative (le parent
 * pourra la donner). La date saisie ici est « vérifiée » : le membre ne peut plus la modifier.
 */
export function legalInfoData(input: LegalInfoInput, memberEmail: string, opts: { requireComplete: boolean }) {
  const birthDate = input.birthDate ? new Date(`${input.birthDate}T00:00:00Z`) : null;
  if (birthDate && (Number.isNaN(birthDate.getTime()) || birthDate > new Date())) bad("Date de naissance invalide.");
  if (birthDate) input = { ...input, legalAge: ageOn(birthDate, new Date()) >= 18 ? "ADULT" : "MINOR" };
  if (input.legalAge !== "MINOR") {
    // Majeur ou non renseigné : aucune coordonnée de parent n'est gardée.
    return {
      legalAge: input.legalAge,
      ...(birthDate ? { birthDate, birthDateVerified: true } : {}),
      guardianName: null,
      guardianEmail: null,
      guardianRelation: null,
      guardianPhone: null,
    };
  }
  const guardianName = input.guardianName || null;
  const guardianEmail = input.guardianEmail || null;
  const guardianRelation = input.guardianRelation === undefined ? undefined : input.guardianRelation || null;
  const guardianPhone = input.guardianPhone === undefined ? undefined : input.guardianPhone || null;
  if (opts.requireComplete) {
    if (!guardianName) bad("Pour un mineur, le nom du parent référent est obligatoire.");
    if (!guardianEmail) bad("Pour un mineur, l'adresse e-mail du parent référent est obligatoire.");
  }
  if (guardianEmail && guardianEmail === memberEmail.trim().toLowerCase()) {
    bad("L'adresse du parent doit être différente de celle du membre.");
  }
  return {
    legalAge: input.legalAge,
    birthDate,
    birthDateVerified: birthDate !== null,
    guardianName,
    guardianEmail,
    ...(guardianRelation === undefined ? {} : { guardianRelation }),
    ...(guardianPhone === undefined ? {} : { guardianPhone }),
  };
}
