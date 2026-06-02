"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { FileAdapter } from "@contracts/finder";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Forme du contexte                                                      */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Valeurs partagées entre tous les Editor de blocs d'un même
 * PageBuilder.
 *
 * Existe pour éviter de re-passer en prop à chaque Editor l'adapter
 * du finder et l'appRoot — qui sont déterminés par l'host (la page
 * admin qui monte le PageBuilder) et restent constants sur toute la
 * durée d'édition.
 */
export interface PageBuilderContextValue {
  /**
   * Adapter passé au MediaPicker quand un Editor de bloc média demande
   * la sélection. Pour AKFC : l'adapter Cloudinary construit dans la
   * page admin. Permet au picker de naviguer dans l'arborescence des
   * médias.
   */
  adapter: FileAdapter;

  /**
   * Racine de l'arborescence des médias (typiquement la valeur
   * d'`APP_ROOT` côté config). Passée au MediaPicker comme `rootPath`.
   */
  appRoot: string;
}

const PageBuilderContext = createContext<PageBuilderContextValue | null>(null);

/* ─────────────────────────────────────────────────────────────────────── */
/*  Provider                                                               */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Provider à wrapper autour du PageBuilder. La page admin qui monte
 * le builder le configure avec son adapter et son appRoot.
 *
 * Sera consommé par le `PageBuilder` lui-même (futur sous-chantier
 * 5b) qui le posera autour de la liste des blocs.
 */
export function PageBuilderProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: PageBuilderContextValue;
}) {
  return (
    <PageBuilderContext.Provider value={value}>
      {children}
    </PageBuilderContext.Provider>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Hook de consommation                                                   */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Récupère le contexte du PageBuilder ambiant.
 *
 * Throw franchement si appelé hors d'un `<PageBuilderProvider>` —
 * c'est volontaire : un Editor de bloc n'a aucun sens hors d'un
 * PageBuilder, l'erreur doit éclater au moment du dev plutôt que
 * d'être absorbée par une valeur par défaut silencieuse.
 */
export function usePageBuilderContext(): PageBuilderContextValue {
  const ctx = useContext(PageBuilderContext);
  if (!ctx) {
    throw new Error(
      "usePageBuilderContext doit être appelé à l'intérieur d'un <PageBuilderProvider>.",
    );
  }
  return ctx;
}
