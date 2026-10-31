// @ts-check
/**
 * Les données de test, connues d'avance : `prepare.mjs` les écrit dans la base, les tests les
 * lisent ici. Un identifiant ou un titre ne s'écrit qu'une fois.
 */

/** Mot de passe de tous les comptes de test (au moins 12 caractères, comme l'exige le site). */
export const PASSWORD = "e2e-mot-de-passe";

export const USERS = {
  admin: { id: "e2e-admin", email: "admin@e2e.test", firstName: "Adèle" },
  membreA: { id: "e2e-membre-a", email: "membre-a@e2e.test", firstName: "Bruno" },
  membreB: { id: "e2e-membre-b", email: "membre-b@e2e.test", firstName: "Chloé" },
  limite: { id: "e2e-limite", email: "limite@e2e.test", firstName: "Damien" },
  oubli: { id: "e2e-oubli", email: "oubli@e2e.test", firstName: "Emma" },
  droitImage: { id: "e2e-droit-image", email: "droit-image@e2e.test", firstName: "Fanny" },
};

export const DISCIPLINES = {
  publiee: { name: "Discipline publiée (e2e)", slug: "e2e-publiee" },
  brouillon: { name: "Discipline en brouillon (e2e)", slug: "e2e-brouillon" },
};

/** Un document adressé au seul membre A. */
export const DOCUMENT_A = {
  id: "e2e-doc-a",
  title: "Convocation e2e du membre A",
  key: "AKFC/e2e/convocation-membre-a.pdf",
};

/** Droits à l'image du membre « droitImage » au départ : accordés depuis le 1er septembre 2026. */
export const CONSENT_SINCE = "2026-09-01T12:00:00.000Z";

/** Le plus petit PDF qu'un navigateur accepte d'afficher. */
export const TINY_PDF = "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[]/Count 0>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n";
