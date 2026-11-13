// Configuration ESLint de la RACINE, pour tout ce qui vit hors de apps/web (packages/*, e2e/) :
// celle que lisent `pnpm lint` (seconde passe) et l'éditeur. Ce sont les règles du web — une seule
// liste pour tout le dépôt — moins une règle sans objet ici : `no-html-link-for-pages` cherche un
// dossier pages/ de Next à la racine, et l'annonce absent à chaque fichier.
import web from "./apps/web/eslint.config.mjs";

// React n'est déclaré que par apps/web : la détection de version (« detect ») ne le trouve pas
// depuis la racine. On la donne, la même que celle du web.
export default [
  ...web,
  { rules: { "@next/next/no-html-link-for-pages": "off" }, settings: { react: { version: "19.2" } } },
];
