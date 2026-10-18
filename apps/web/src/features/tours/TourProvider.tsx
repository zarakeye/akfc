"use client";

import { JSX, ReactNode, useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

import { tourStore } from "./tour.store";
import { getTour, routeMatches } from "./tour.registry";
import { TourOverlay } from "./TourOverlay";
import { TourLauncher } from "./TourLauncher";

/**
 * Point de montage du moteur de tutos (dans `AppProviders` : toutes les pages).
 *
 * Il lit l'état du tuto en cours (store externe, persistant à l'onglet), fait avancer les
 * étapes de type « route » quand la page change, et rend l'overlay et le lanceur « ? ».
 */
export function TourProvider({ children }: { children: ReactNode }): JSX.Element {
  const state = useSyncExternalStore(
    tourStore.subscribe,
    tourStore.getSnapshot,
    tourStore.getServerSnapshot,
  );
  const pathname = usePathname();

  const tour = state ? getTour(state.tourId) : undefined;
  const step = tour && state ? tour.steps[state.index] : undefined;

  // Tuto inconnu (renommé, retiré) ou terminé au-delà de sa dernière étape : on range.
  const stale = state != null && (!tour || !step);
  useEffect(() => {
    if (stale) tourStore.stop();
  }, [stale]);

  // Étape « route » : passe dès que la page attendue est atteinte.
  const routeMatch = step?.advance.kind === "route" ? step.advance.match : null;
  const index = state?.index ?? -1;
  useEffect(() => {
    if (routeMatch != null && routeMatches(routeMatch, pathname)) tourStore.next(index);
  }, [routeMatch, pathname, index]);

  return (
    <>
      {children}
      {tour && step && state ? (
        <TourOverlay
          key={`${tour.id}:${state.index}`}
          tour={tour}
          step={step}
          index={state.index}
        />
      ) : (
        <TourLauncher pathname={pathname} />
      )}
    </>
  );
}
