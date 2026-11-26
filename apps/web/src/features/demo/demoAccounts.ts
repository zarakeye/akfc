/**
 * Les comptes de la démo (seed de la sandbox, prisma/seed.sandbox.mjs) : un seul mot de passe,
 * affiché à tous. Rien de secret : ces comptes n'existent que dans une sandbox jetable.
 * Le panneau de la démo les propose sous « Me connecter en tant que… ».
 */
export const DEMO_PASSWORD = "sandbox-demo";

export const DEMO_ACCOUNTS = [
  { key: "admin", email: "admin@sandbox.local", label: "Administrateur", hint: "médiathèque, droits à l'image, pages, demandes" },
  { key: "membre", email: "membre@sandbox.local", label: "Membre majeur", hint: "son espace, son droit à l'image" },
  { key: "mineur", email: "mineur@sandbox.local", label: "Membre mineur", hint: "son parent valide par e-mail" },
  { key: "support", email: "support.sam@sandbox.local", label: "Sam, bénévole du support", hint: "les demandes de son groupe, sans être administrateur" },
] as const;

export type DemoAccountKey = (typeof DEMO_ACCOUNTS)[number]["key"];
