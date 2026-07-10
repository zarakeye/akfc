#!/bin/bash
# Fix : le bloc media-text etait enregistre dans BLOCK_REGISTRY mais PAS dans
# ALL_BLOCK_DEFINITIONS (liste figee, distincte, que le menu « + » du builder
# itere) — d ou son absence du menu. Ajout de mediaTextDefinition a la liste.
# À lancer depuis la RACINE du monorepo : bash fix_media_text_menu.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : racine du monorepo requise." >&2; exit 1; }
echo "-> apps/web/src/features/page-builder/blockRegistry.ts"
cat > 'apps/web/src/features/page-builder/blockRegistry.ts' << 'FILE_EOF'
import type { PageBlockKindV1, PageBlockV1 } from "@contracts/page";
import type { BlockDefinition } from "./BlockDefinition.types";

import { tiptapDefinition } from "./blocks/tiptap";
import { imageGalleryDefinition } from "./blocks/image-gallery";
import { audioCollectionDefinition } from "./blocks/audio-collection";
import { documentListDefinition } from "./blocks/document-list";
import { mediaTextDefinition } from "./blocks/media-text";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Type du registry                                                       */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Mapped type qui préserve le typage discriminé pour chaque clé.
 *
 * `BlockRegistry['image-gallery']` rend précisément
 * `BlockDefinition<ImageGalleryBlockV1>`, pas l'union dégénérée. C'est
 * cette préservation qui permet à `Editor` et `View` d'accepter des
 * props typées correctement pour leur variante.
 *
 * Contrairement au `providerRegistry` du backend qui avait DÛ utiliser
 * un switch pour préserver le typage (parce que les factories y
 * retournaient des génériques structurellement divergents), ici une
 * mapped type sur un type discriminé suffit — tous les `BlockDefinition`
 * partagent la même forme paramétrée.
 */
type BlockRegistry = {
  [K in PageBlockKindV1]: BlockDefinition<Extract<PageBlockV1, { type: K }>>;
};

/* ─────────────────────────────────────────────────────────────────────── */
/*  Assemblage                                                             */
/* ─────────────────────────────────────────────────────────────────────── */

const BLOCK_REGISTRY: BlockRegistry = {
  "image-gallery": imageGalleryDefinition,
  "audio-collection": audioCollectionDefinition,
  "document-list": documentListDefinition,
  tiptap: tiptapDefinition,
  "media-text": mediaTextDefinition,
};

/* ─────────────────────────────────────────────────────────────────────── */
/*  API publique                                                           */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Récupère la définition complète d'un bloc par sa `kind`.
 *
 * À privilégier sur un accès direct `BLOCK_REGISTRY[kind]` parce que
 * le typage du retour est préservé : `getBlockDefinition('tiptap')`
 * rend `BlockDefinition<TipTapBlockV1>`, donc les props passées à
 * `.Editor` et `.View` sont strictement vérifiées par le compilateur.
 */
export function getBlockDefinition<K extends PageBlockKindV1>(
  kind: K,
): BlockRegistry[K] {
  return BLOCK_REGISTRY[kind];
}

/**
 * Type d'une définition prise au hasard dans le registry — union des
 * quatre variantes typées.
 *
 * **Pourquoi pas `BlockDefinition<PageBlockV1>` ?** Parce que `TBlock`
 * apparaît en position contravariante dans `onChange: (next: TBlock) => void` —
 * un `(tiptapBlock) => void` n'est pas assignable à un `(anyBlock) => void`,
 * la spécialisation est plus stricte. Forcer cette assignabilité demanderait
 * de relâcher le typage de `onChange`, ce qu'on ne veut pas.
 *
 * En revanche, une union des variantes typées (`BlockRegistry[PageBlockKindV1]`)
 * exprime exactement ce qu'on veut : « une définition parmi celles connues »,
 * sans tordre la variance. Les consommateurs qui ont besoin d'un narrowing
 * passent par `getBlockDefinition(kind)`.
 */
export type AnyBlockDefinition = BlockRegistry[PageBlockKindV1];

/**
 * Liste exhaustive des définitions, dans l'ordre d'affichage du menu "+".
 *
 * L'ordre ici détermine l'ordre dans le menu — choisi par fréquence
 * d'usage anticipée plutôt que par ordre alphabétique : tiptap en
 * premier parce que c'est le bloc le plus courant, document-list en
 * dernier parce que c'est le plus rare.
 *
 * Typé sur l'union des variantes (`AnyBlockDefinition`) parce que les
 * consommateurs de cette liste (typiquement le menu "+") n'ont pas
 * besoin de typage par variante — ils itèrent et lisent `kind`, `label`,
 * `icon`. Pour accéder à `Editor` / `View` avec leur typage précis,
 * passer par `getBlockDefinition(kind)`.
 */
export const ALL_BLOCK_DEFINITIONS: ReadonlyArray<AnyBlockDefinition> = [
  tiptapDefinition,
  imageGalleryDefinition,
  audioCollectionDefinition,
  documentListDefinition,
  mediaTextDefinition,
];
FILE_EOF

echo
echo "Typecheck web..."
pnpm --filter web typecheck

echo
echo "Typecheck OK -> commit."
git add -A
git commit -m "fix(page-builder): media-text manquait dans ALL_BLOCK_DEFINITIONS (menu +)"
echo "Commit effectue."