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
  mineur: { id: "e2e-mineur", email: "mineur@e2e.test", firstName: "Gaspard" },
};

/** Le membre « mineur » : son identité et son parent référent, saisis par le club. */
export const MINOR = {
  lastName: "Martin",
  birthDate: "2012-05-04T00:00:00.000Z",
  guardian: { name: "Hélène Martin", email: "parent-mineur@e2e.test", relation: "mère" },
};

export const DISCIPLINES = {
  publiee: { name: "Discipline publiée (e2e)", slug: "e2e-publiee" },
  brouillon: { name: "Discipline en brouillon (e2e)", slug: "e2e-brouillon" },
  // Avant « Discipline publiée » dans l'alphabet, mais dans une famille de rang 2 : la galerie
  // publique la range après (l'ordre du menu, famille d'abord).
  seconde: { name: "Arnis (e2e)", slug: "e2e-arnis" },
};

/** Deux familles, rangées à l'inverse de l'alphabet de leurs disciplines. */
export const FAMILIES = {
  premiere: { name: "Famille de rang 1 (e2e)", slug: "e2e-famille-1", sortOrder: 1 },
  seconde: { name: "Famille de rang 2 (e2e)", slug: "e2e-famille-2", sortOrder: 2 },
};

/** Un document adressé au seul membre A. */
export const DOCUMENT_A = {
  id: "e2e-doc-a",
  title: "Convocation e2e du membre A",
  key: "AKFC/e2e/convocation-membre-a.pdf",
};

/** Un stage en brouillon, sans séance : ses dates s'ajoutent depuis son édition. */
export const SEMINAR = { label: "Stage e2e", slug: "e2e-stage" };

/** Droits à l'image du membre « droitImage » au départ : accordés depuis le 1er septembre 2026. */
export const CONSENT_SINCE = "2026-09-01T12:00:00.000Z";

/** Le plus petit PDF qu'un navigateur accepte d'afficher. */
export const TINY_PDF = "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[]/Count 0>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n";

/** Une image PNG d'un pixel, pour les galeries de test. */
export const TINY_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
