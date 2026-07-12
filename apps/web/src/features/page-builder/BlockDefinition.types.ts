import type { ComponentType, ReactNode } from "react";
import type { PageBlockV1, ResolvedMedia } from "@contracts/page";

/**
 * Définition complète d'un type de bloc dans le builder de page.
 *
 * Trois rôles cohabitent dans cette interface unique :
 *
 *   1. **Métadonnées d'affichage** — `kind`, `label`, `icon` :
 *      consommés par le menu "+" du PageBuilder pour proposer
 *      l'ajout du bloc.
 *
 *   2. **Fabrique** — `defaultData(id)` : rend un bloc vide prêt à
 *      être ajouté au composite. L'`id` est fourni par le PageBuilder
 *      (cuid) au moment de la création — externalisé pour que le
 *      builder puisse cibler immédiatement le nouveau bloc (focus,
 *      scroll-into-view, drag handle).
 *
 *   3. **Composants** — `Editor` (client) pour l'édition, `View`
 *      (typiquement RSC) pour le rendu en lecture. La chrome
 *      transverse (drag handle, label de type, bouton supprimer)
 *      est dans le PageBuilder, pas dans chaque Editor.
 *
 * Le générique `TBlock` est instancié par chaque entrée du registry
 * pour une variante précise du discriminated union `PageBlockV1` —
 * c'est ce qui garantit le typage strict des props passées à Editor
 * et View, et qui rend `getBlockDefinition('tiptap').Editor` typé
 * pour les TipTapBlockV1 spécifiquement (pas l'union dégénérée).
 */
export interface BlockDefinition<TBlock extends PageBlockV1> {
  /**
   * Discriminant du bloc. Doit matcher exactement `TBlock['type']`,
   * c'est le typage qui force la cohérence.
   */
  kind: TBlock["type"];

  /** Libellé affiché dans le menu "+" du PageBuilder. */
  label: string;

  /**
   * Icône affichée dans le menu "+" et dans la chrome du bloc.
   *
   * `ReactNode` plutôt que `ComponentType` : on attend une instance
   * (`<Icon />`) plutôt qu'une référence (`Icon`), pour permettre des
   * compositions plus fines si besoin (icône avec badge, etc.).
   *
   * Doit être server-safe (pas de hooks) — peut être consommée par
   * le RSC du PageRenderer indirectement via le registry.
   */
  icon: ReactNode;

  /**
   * Fabrique un bloc vide. L'`id` est fourni par le PageBuilder, pas
   * par le bloc lui-même — typiquement `cuid()` côté frontend.
   */
  defaultData: (id: string) => TBlock;

  /**
   * Composant client d'édition. Reçoit le bloc courant et un callback
   * de mise à jour, ne gère QUE le contenu spécifique au bloc.
   *
   * Implémenté progressivement par type de bloc dans les sous-livraisons
   * suivantes du sous-chantier 5.
   */
  Editor: ComponentType<BlockEditorProps<TBlock>>;

  /**
   * Composant de rendu en lecture seule. Typiquement un Server Component
   * (file marqué `view.server.tsx`), qui résout les références médias
   * en URL via la couche storage avant émission HTML.
   *
   * Implémenté au sous-chantier 6 (le renderer public).
   */
  View: ComponentType<BlockViewProps<TBlock>>;
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Props des composants                                                   */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Props du composant `Editor` d'un bloc.
 *
 * Signature volontairement minimale : pas d'`onRemove`, pas d'`onMoveUp` —
 * ce sont des affaires de chrome, gérées par le PageBuilder en wrapper
 * autour de l'Editor. L'Editor ne sait que se rendre et notifier le
 * changement de son propre contenu.
 */
export interface BlockEditorProps<TBlock extends PageBlockV1> {
  block: TBlock;
  onChange: (next: TBlock) => void;
  /**
   * Côté d'affichage des médias dans la preview du builder, calculé par le
   * PageBuilder selon la position du bloc parmi les blocs `media-text`
   * (même alternance que le rendu public). Optionnel — seul le bloc
   * media-text l'exploite pour sa preview.
   */
  mediaSide?: "left" | "right";
}

/**
 * Props du composant `View` d'un bloc.
 *
 * Le bloc lui-même + un **lookup synchrone** des mediaIds vers leurs
 * informations résolues. Le `PageRenderer` (RSC) extrait tous les
 * mediaIds de la page en amont, fait une résolution batch en une
 * requête, et passe `resolveMedia` à chaque View — qui peut alors
 * accéder aux URLs / mimeType / dimensions sans aucun appel asynchrone.
 *
 * `resolveMedia(mediaId)` rend `null` si l'asset n'existe pas ou n'est
 * pas en `published` (cf. la sémantique du service `resolveMediaByIds`).
 * À la View de présenter un placeholder dans ce cas, sans casser.
 */
export interface BlockViewProps<TBlock extends PageBlockV1> {
  block: TBlock;
  resolveMedia: (mediaId: string) => ResolvedMedia | null;
  /**
   * Résout l'avatar COURANT d'un utilisateur (pour les blocs media-text qui
   * référencent « l'avatar de tel user »). Optionnel — seul le bloc
   * media-text l'exploite. `null` si le user n'a pas d'avatar.
   */
  resolveAvatar?: (userId: string) => ResolvedMedia | null;
  /**
   * Côté d'affichage des médias, calculé par le PageRenderer selon la
   * POSITION du bloc parmi les blocs `media-text` (alternance automatique :
   * 1er → "left", 2e → "right", etc.). Optionnel — seul le bloc media-text
   * l'exploite ; les autres blocs l'ignorent. Absent = pas d'alternance
   * pertinente pour ce bloc.
   */
  mediaSide?: "left" | "right";
}
