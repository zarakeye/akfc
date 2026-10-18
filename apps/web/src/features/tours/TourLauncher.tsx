"use client";

import { JSX, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleHelp, X } from "lucide-react";

import { useSessionStore } from "@lib/stores/useSessionStore";
import { tourStore } from "./tour.store";
import { toursFor } from "./tour.registry";

/**
 * Bouton « ? » flottant : liste les tutos de la page courante, filtrés par rôle.
 * Invisible s'il n'y en a aucun.
 */
export function TourLauncher({ pathname }: { pathname: string }): JSX.Element | null {
  const user = useSessionStore((s) => s.session?.user);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const tours = toursFor(pathname, { loggedIn: !!user, isAdmin: !!user?.isAdmin });
  if (tours.length === 0) return null;

  const launch = (id: string, startRoute: string) => {
    setOpen(false);
    tourStore.start(id);
    if (startRoute !== pathname) router.push(startRoute);
  };

  return (
    // En développement, l'indicateur de Next occupe le coin bas gauche : le bouton monte d'un cran.
    <div
      className={`fixed left-4 z-[9000] print:hidden ${process.env.NODE_ENV === "development" ? "bottom-20" : "bottom-4"}`}
    >
      {open && (
        <div className="mb-2 w-80 rounded-xl border border-slate-200 bg-white p-3 text-slate-800 shadow-2xl">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold">Tutoriels de cette page</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="rounded p-1 hover:bg-slate-100">
              <X className="h-4 w-4" />
            </button>
          </div>
          <ul className="flex flex-col gap-1">
            {tours.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => launch(t.id, t.startRoute)}
                  className="w-full rounded-lg px-2 py-2 text-left hover:bg-emerald-50"
                >
                  <span className="block text-sm font-medium">{t.title}</span>
                  <span className="block text-xs text-slate-500">{t.description}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Tutoriels de cette page"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition-colors hover:bg-emerald-700"
      >
        <CircleHelp className="h-6 w-6" />
      </button>
    </div>
  );
}
