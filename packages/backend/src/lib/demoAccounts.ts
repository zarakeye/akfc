/**
 * Comptes de démonstration et de test : toute adresse du domaine `akfc.demo`.
 * `.demo` n'est pas une extension internet réelle : aucun vrai membre ne peut avoir une telle
 * adresse, et aucun e-mail ne peut y être remis. Ces comptes servent à tester le site (rôles
 * administrateur, membre, bureau…) ; l'interface les masque par défaut et le site ne leur
 * envoie jamais d'e-mail.
 */
export const DEMO_EMAIL_DOMAIN = "akfc.demo";

/** Vrai pour une adresse de compte de démonstration (insensible à la casse). */
export function isDemoEmail(email: string | null | undefined): boolean {
  return (email ?? "").trim().toLowerCase().endsWith(`@${DEMO_EMAIL_DOMAIN}`);
}
