'use client';

import { createContext, useContext } from 'react';
import type { TrashEntryDTO } from '@contracts/trash/trash.dto';

/**
 * 🗑️ TrashMapContext
 *
 * Partage entre la TreeView (`FinderTree`) et tous les nodes récursifs
 * (`FinderTreeFolder`) la map `trashId → displayName` qui sert à :
 *
 *   1. Renommer les dossiers nommés par un uuid en `bin/.trash/<uuid>/`
 *      par leur `displayName` plus lisible (ex: "cours1 (supprimé)")
 *   2. Détecter qu'un name est un trashId connu (via `has()`) plutôt que
 *      faire une regex uuid
 *
 * Le providing se fait dans `FinderTree.tsx` qui charge `trash.listBin`.
 *
 * ─── Pourquoi un Context et pas des props ? ───────────────────────────────
 *
 * `FinderTreeFolder` est récursif sur potentiellement N niveaux. Passer le
 * `trashMap` en props à chaque niveau pollue la signature et oblige tous
 * les ancêtres à savoir qu'on travaille avec le trashMap, même quand ils
 * ne sont pas concernés (ex: nodes sous `pending/` qui n'ont rien à voir
 * avec la corbeille).
 *
 * Le Context permet à n'importe quel `FinderTreeFolder` de récupérer la
 * map *si elle est disponible* sans surcharger la propagation.
 *
 * ─── Valeur par défaut ────────────────────────────────────────────────────
 *
 * Map vide (`new Map()`) — sûr pour les cas où le finder ne charge pas la
 * corbeille (ex: rootPath sous `pending/`). Le code `trashMap.has(name)`
 * retourne simplement `false` partout, donc l'affichage est inchangé.
 */

export type TrashMap = Map<string, Pick<TrashEntryDTO, 'displayName' | 'kind'>>;

const TrashMapContext = createContext<TrashMap>(new Map());

export const TrashMapProvider = TrashMapContext.Provider;

/**
 * Hook de consommation. Retourne toujours une Map (jamais `null`/`undefined`)
 * pour simplifier les appelants — pas de garde nullity à faire.
 */
export function useTrashMap(): TrashMap {
  return useContext(TrashMapContext);
}
