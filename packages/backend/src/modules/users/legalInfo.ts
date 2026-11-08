import { z } from "zod";
import { TRPCError } from "@trpc/server";

/**
 * Majorité d'un membre et, pour un mineur, date de naissance et parent référent. Saisis par un
 * administrateur (instructeur), jamais par le membre : un mineur ne doit pas pouvoir se déclarer
 * majeur, ni indiquer une adresse à lui comme celle de son parent.
 */
export const legalInfoInput = z.object({
  legalAge: z.enum(["UNKNOWN", "ADULT", "MINOR"]),
  /** AAAA-MM-JJ ; null : non renseignée. */
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide.").nullable(),
  guardianName: z.string().trim().max(120).nullable(),
  guardianEmail: z.string().trim().toLowerCase().email("Adresse e-mail du parent invalide.").max(254).nullable(),
  /** Qualité du parent (« mère »…). Absente (ancien formulaire) : la valeur enregistrée est gardée. */
  guardianRelation: z.string().trim().max(60).nullable().optional(),
});
export type LegalInfoInput = z.infer<typeof legalInfoInput>;

function bad(message: string): never {
  throw new TRPCError({ code: "BAD_REQUEST", message });
}

/**
 * Données Prisma à écrire. `requireComplete` (création d'un compte) : un mineur exige date de
 * naissance, nom et adresse du parent. La date saisie ici est « vérifiée » : le membre ne peut plus
 * la modifier dans son profil.
 */
export function legalInfoData(input: LegalInfoInput, memberEmail: string, opts: { requireComplete: boolean }) {
  const birthDate = input.birthDate ? new Date(`${input.birthDate}T00:00:00Z`) : null;
  if (birthDate && (Number.isNaN(birthDate.getTime()) || birthDate > new Date())) bad("Date de naissance invalide.");
  if (input.legalAge !== "MINOR") {
    // Majeur ou non renseigné : aucune coordonnée de parent n'est gardée.
    return {
      legalAge: input.legalAge,
      ...(birthDate ? { birthDate, birthDateVerified: true } : {}),
      guardianName: null,
      guardianEmail: null,
      guardianRelation: null,
    };
  }
  const guardianName = input.guardianName || null;
  const guardianEmail = input.guardianEmail || null;
  const guardianRelation = input.guardianRelation === undefined ? undefined : input.guardianRelation || null;
  if (opts.requireComplete) {
    if (!birthDate) bad("Pour un mineur, la date de naissance est obligatoire.");
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
  };
}
