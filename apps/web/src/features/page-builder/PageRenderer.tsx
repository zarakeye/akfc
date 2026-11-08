// Composant SERVEUR (base, médias) : `server-only` fait échouer le build si un composant client
// l'importe, au lieu d'envoyer le backend au navigateur.
import "server-only";
import type { ComponentType } from "react";

import { prisma } from "@backend/prisma";
import { resolveMediaByIds } from "@backend/modules/media/services/resolveMediaByIds.service";
import { resolveAvatarsByUserIds } from "@backend/modules/media/services/resolveAvatarsByUserIds.service";
import { refusedMediaIds } from "@backend/modules/mediaPeople/mediaPeople.service";

import {
  extractMediaIdsFromContent,
  type PageBlockV1,
  type PageContentV1,
  type ResolvedMedia,
} from "@contracts/page";

import { getBlockDefinition } from "./blockRegistry";
import type { BlockViewProps } from "./BlockDefinition.types";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Props                                                                  */
/* ─────────────────────────────────────────────────────────────────────── */

export interface PageRendererProps {
  /**
   * Contenu validé de la page. L'hôte le lit avec `parsePageContentV1`, qui
   * remplace un contenu absent ou illisible par une page vide : ici, le
   * composite est supposé sain.
   */
  content: PageContentV1;
  /**
   * Pour qui les URLs des fichiers sont construites. `public` (défaut) : la route publique, qui ne
   * sert que les fichiers d'un contenu PUBLIÉ. `admin` : la route privée, pour l'aperçu d'un
   * brouillon par un administrateur (draftAccess).
   */
  audience?: "public" | "admin";
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Composant                                                              */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Renderer public du composite de page. **Server Component asynchrone.**
 *
 * ─── Orchestration en deux temps ───────────────────────────────────────
 *
 *   1. **Extraction** : `extractMediaIdsFromContent(content)` rassemble
 *      tous les mediaIds référencés dans toute la page — y compris les
 *      `library-image` inlines dans les blocs tiptap (walker
 *      ProseMirror). Dédupliqué.
 *
 *   2. **Résolution batch** : `resolveMediaByIds(prisma, ids)` fait UNE
 *      requête SQL qui ramène toutes les métadonnées en filtrant
 *      `status === 'published'`. Le résultat est un Record indexé par
 *      mediaId, avec `null` pour les ids absents ou non-published.
 *
 * Ensuite, on construit une fonction de lookup synchrone `resolveMedia`
 * qui ferme sur ce Record, et on rend chaque bloc via son `View` en lui
 * passant le bloc + cette fonction. Chaque View peut ainsi lookuper ses
 * propres mediaIds sans aucun appel async — elle reste un composant
 * synchrone classique.
 *
 * ─── Le cast de variance (mêmes raisons qu'en édition) ─────────────────
 *
 * `getBlockDefinition(block.type).View` est, à travers l'itération sur
 * `PageBlockV1`, une union de `ComponentType<BlockViewProps<variante>>`.
 * On la cast en `ComponentType<BlockViewProps<PageBlockV1>>` — sûr par
 * construction (le discriminant garantit la correspondance), localisé
 * et documenté, comme côté `BlockShell` pour l'édition.
 */
export async function PageRenderer({ content, audience = "public" }: PageRendererProps) {
  // Page vide : rien à résoudre, aucune requête.
  if (content.blocks.length === 0) {
    return null;
  }

  // 1. Extraction de tous les mediaIds référencés sur la page.
  const mediaIds = extractMediaIdsFromContent(content);

  // 2. Résolution batch (1 requête SQL, filtre `published`).
  //    Audience `public` : les URLs R2 pointent vers la route publique
  //    `/api/media/public/r2/...` qui valide qu'un PageMediaReference
  //    existe avant de signer (cf. sous-chantier 6c).
  const resolvedMap = await resolveMediaByIds(prisma, mediaIds, audience);
  // Droit à l'image : tout contenu du constructeur est sur le site public. Un média dont une personne
  // taguée a refusé le site public est sauté, comme un média introuvable ; le contenu n'est pas
  // modifié, et le média revient avec l'accord. L'aperçu d'un administrateur le montre encore.
  const hidden =
    audience === "public" ? await refusedMediaIds(prisma, mediaIds, "PUBLIC_SITE") : new Set<string>();

  // Lookup synchrone fermé sur la map — passé à chaque View.
  const resolveMedia = (mediaId: string): ResolvedMedia | null =>
    hidden.has(mediaId) ? null : (resolvedMap[mediaId] ?? null);

  // Résolution des avatars référencés par les blocs media-text ET float-text
  // (référence logique { kind: "avatar", userId } → avatar courant du user).
  //
  // Oublier le float ici ne casserait RIEN à la compilation : le bloc aurait
  // simplement reçu un resolveAvatar rendant null, donc une image absente,
  // sans erreur. Le cas d'usage visé étant le portrait d'instructeur en
  // float, le défaut serait apparu au pire endroit.
  const avatarUserIds = content.blocks.flatMap((b) =>
    (b.type === "media-text" || b.type === "float-text") &&
    b.media?.kind === "avatar"
      ? [b.media.userId]
      : [],
  );
  const avatarMap = await resolveAvatarsByUserIds(prisma, avatarUserIds);
  const resolveAvatar = (userId: string): ResolvedMedia | null =>
    avatarMap[userId] ?? null;

  // Logo du site (unique, hors finder) : résolu une fois, repli embarqué.
  const siteSettingsRow = await prisma.siteSettings.findUnique({
    where: { id: "site" },
    select: { logoKey: true, updatedAt: true },
  });
  const siteLogo: ResolvedMedia | null = {
    url: siteSettingsRow?.logoKey
      ? `/api/media/site-logo?v=${siteSettingsRow.updatedAt.getTime()}`
      : "/AKFC_logo.svg",
    kind: "image",
    posterUrl: null,
    mimeType: "image/svg+xml",
    fileName: "logo.svg",
    width: null,
    height: null,
    duration: null,
  };

  // Alternance media-text SANS mutation pendant le rendu (React Compiler) :
  // le côté dérive du rang du bloc dans la liste des seuls blocs media-text.
  const mediaTextIds = content.blocks
    .filter((b) => b.type === "media-text")
    .map((b) => b.id);
  const sideFor = (blockId: string): "left" | "right" | undefined => {
    const rank = mediaTextIds.indexOf(blockId);
    if (rank === -1) return undefined;
    return rank % 2 === 0 ? "left" : "right";
  };

  return (
    // `akfc-page` plafonne et centre. Sans lui, sur un écran de 1920px la
    // colonne de texte atteignait 800px, soit près de 100 caractères par
    // ligne — hors de la plage lisible, et qu'aucun ratio ne corrigeait.
    // L'écart entre blocs suit la même règle fluide que les gouttières.
    <div
      className="page-renderer akfc-page flex flex-col"
      // L'écart entre blocs était écrit en dur ici, donc invisible au
      // laboratoire. En variable, il devient réglable — et reste fluide.
      style={{ gap: "var(--akfc-block-gap)" }}
    >
      {content.blocks.map((block) => {
        const def = getBlockDefinition(block.type);
        const View = def.View as unknown as ComponentType<
          BlockViewProps<PageBlockV1>
        >;
        return (
          <View
            key={block.id}
            block={block}
            resolveMedia={resolveMedia}
            resolveAvatar={resolveAvatar}
            siteLogo={siteLogo}
            mediaSide={sideFor(block.id)}
          />
        );
      })}
    </div>
  );
}
