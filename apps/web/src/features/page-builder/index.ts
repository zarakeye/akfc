// Entrée des composants du constructeur, importée par les formulaires CLIENT de l'administration.
// PageRenderer n'y est PAS : composant serveur qui lit la base (Prisma) et les médias, il
// s'importe par son chemin (`@features/page-builder/PageRenderer`). Exporté ici, il entraînait le
// backend dans le code envoyé au navigateur de chaque formulaire qui utilise le constructeur.
export { PageBuilder, type PageBuilderProps } from "./PageBuilder";
export {
  PageBuilderProvider,
  usePageBuilderContext,
  type PageBuilderContextValue,
} from "./PageBuilderContext";
export {
  getBlockDefinition,
  ALL_BLOCK_DEFINITIONS,
  type AnyBlockDefinition,
} from "./blockRegistry";
export type {
  BlockDefinition,
  BlockEditorProps,
  BlockViewProps,
} from "./BlockDefinition.types";
