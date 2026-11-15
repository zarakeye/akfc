/**
 * Inscription d'un membre à un créneau : ce que le front et le backend partagent.
 *
 * Un créneau pour enfants ou adolescents est un INDICE de minorité : à la création d'un compte,
 * il pré-coche « Mineur » (l'administrateur garde le dernier mot).
 */
export const MINOR_AUDIENCES = ["KIDS", "TEENAGERS"] as const;

export function isMinorAudience(audience: string): boolean {
  return (MINOR_AUDIENCES as readonly string[]).includes(audience);
}

/** Un créneau tel que le propose la liste d'inscription. */
export interface EnrollableCourse {
  id: number;
  disciplineName: string;
  day: string;
  beginTime: number;
  endTime: number;
  audience: string;
  /** Instructeur effectif : celui du créneau, sinon celui de la discipline. */
  instructorId: string | null;
  instructorName: string | null;
  /** L'instructeur vient de la discipline (le créneau n'en a pas d'attitré). */
  instructorFromDiscipline: boolean;
}
