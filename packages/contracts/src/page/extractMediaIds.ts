import type { PageBlockV1, PageContentV1 } from "@contracts/page/blocks.v1";

/**
 * Extraction des références `mediaId` d'un bloc ou d'un contenu de page.
 *
 * Ces fonctions sont pures, indépendantes de toute couche de stockage,
 * et utilisées à deux endroits :
 *
 *   - Backend, au save d'une page (cf. routers course / stage / post) :
 *     calcul du diff entre références anciennes et nouvelles pour
 *     synchroniser la table `PageMediaReference`.
 *
 *   - Frontend, dans le builder : afficher à l'utilisateur quels
 *     mediaIds seront libérés si un bloc est supprimé (affordance UX).
 */

/* -------------------------------------------------------------------------- */
/*  API publique                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Collecte les `mediaId` directement référencés par un bloc.
 *
 * Le `switch` est exhaustif sur `block.type` — ajouter un nouveau type au
 * `pageBlockSchemaV1` produit une erreur de compilation ici tant que le
 * `case` correspondant n'a pas été ajouté. C'est le principal garde-fou
 * contre les références fantômes au moment où le contrat évolue.
 */
export function extractMediaIdsFromBlock(
  block: PageBlockV1,
): readonly string[] {
  switch (block.type) {
    case "image-gallery":
      return block.items.map((item) => item.mediaId);
    case "audio-collection":
      return block.items.map((item) => item.mediaId);
    case "document-list":
      return block.items.map((item) => item.mediaId);
    case "tiptap":
      return walkProseMirrorForMediaIds(block.content);
    case "media-text":
      // mediaIds directs (tableau media) + images éventuelles du ProseMirror.
      return [
        ...block.media.map((item) => item.mediaId),
        ...walkProseMirrorForMediaIds(block.content),
      ];
    default:
      return assertNever(block);
  }
}

/**
 * Collecte tous les `mediaId` référencés par un contenu de page complet.
 *
 * Dédupliqué : un même asset peut apparaître dans plusieurs blocs (par
 * exemple la même photo dans deux galeries différentes), mais la table
 * `PageMediaReference` est uniquée par `(mediaAsset, page)`, donc on
 * dédup avant l'écriture pour éviter des erreurs d'unicité au save.
 */
export function extractMediaIdsFromContent(
  content: PageContentV1,
): readonly string[] {
  const ids = content.blocks.flatMap(extractMediaIdsFromBlock);
  return Array.from(new Set(ids));
}

/* -------------------------------------------------------------------------- */
/*  Walker ProseMirror                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Traverse un arbre ProseMirror à la recherche des nodes `library-image`
 * et collecte leurs `mediaId`.
 *
 * Le node `library-image` est introduit par l'extension TipTap du builder
 * (sous-chantier 3 du plan). On le reconnaît par :
 *
 *   - `node.type === 'library-image'`
 *   - `node.attrs.mediaId` (string non-vide)
 *
 * Cette traversée est volontairement défensive : le contenu ProseMirror
 * est typé `Record<string, unknown>` dans le schema, donc on ne fait
 * aucune hypothèse forte sur la structure. Un payload corrompu ou
 * inattendu rend une liste vide plutôt que de jeter — le save d'une
 * page ne doit pas exploser à cause d'un artefact d'édition.
 */
function walkProseMirrorForMediaIds(content: unknown): readonly string[] {
  const ids: string[] = [];

  function walk(node: unknown): void {
    if (!node || typeof node !== "object") return;

    const candidate = node as {
      type?: unknown;
      attrs?: { mediaId?: unknown };
      content?: unknown;
    };

    if (
      candidate.type === "library-image" &&
      typeof candidate.attrs?.mediaId === "string" &&
      candidate.attrs.mediaId.length > 0
    ) {
      ids.push(candidate.attrs.mediaId);
    }

    if (Array.isArray(candidate.content)) {
      for (const child of candidate.content) walk(child);
    }
  }

  walk(content);
  return ids;
}

/* -------------------------------------------------------------------------- */
/*  Garde d'exhaustivité                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Vérifie à la compilation que tous les cas d'une union discriminée
 * sont couverts. Utilisée comme `default` dans le switch ci-dessus —
 * si une branche manque, TypeScript échoue parce que `value` n'est
 * pas `never`.
 */
function assertNever(value: never): never {
  throw new Error(
    `Cas de bloc non couvert dans extractMediaIdsFromBlock : ${JSON.stringify(value)}`,
  );
}
