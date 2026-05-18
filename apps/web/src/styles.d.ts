// Déclarations ambient pour autoriser les side-effect imports de styles
// (`import "fichier.scss"`) sans bindings. TypeScript ne sait pas typer ce
// genre d'import nativement.
//
// On déclare le module comme un module quelconque ; ça suffit à TypeScript
// pour accepter l'import. Le bundler (Next/Turbopack) gère ensuite la
// transformation au moment du build.

declare module "*.scss";
declare module "*.css";
declare module "*.sass";

export {};
