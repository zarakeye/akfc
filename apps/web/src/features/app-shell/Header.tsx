'use client';

import Link from "next/link";
import LoginForm from "@features/auth/components/LoginForm";
import UserMenu from "@features/app-shell/UserMenu";
import { NotificationBell } from "@features/app-shell/NotificationBell";
import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSessionStore } from "@lib/stores/useSessionStore";
import OurActivitiesMenu from "@features/app-shell/OurActivitiesMenu";
import {
  NAV_ACTIVE,
  NAV_ENTRIES,
  NAV_GLOW,
  type NavEntry,
} from "@features/app-shell/navEntries";

/**
 * En-tête de l'application, en deux rendus alimentés par la MÊME source
 * (`NAV_ENTRIES`) :
 *
 *   - à partir de `lg`, la barre horizontale habituelle ;
 *   - en dessous, un bouton burger ouvrant un panneau plein écran.
 *
 * Le burger ne règle pas qu'un problème de place. Les menus déroulants de la
 * barre s'ouvrent au SURVOL, geste qui n'existe pas sur un écran tactile :
 * « Nos activités », « Qui sommes-nous ? » et « Documentation » y étaient
 * inaccessibles. Le panneau les ouvre à l'APPUI.
 *
 * Logo à gauche, burger à droite : c'est la convention, le logo garde sa
 * place du desktop, et le pouce couvre mieux la moitié droite de l'écran.
 */
export default function Header() {
  const user = useSessionStore(state => state.session?.user);
  const pathname = usePathname();

  // Menu déroulant ouvert dans la BARRE (survol) et dans le PANNEAU (appui).
  // Deux états distincts : les deux rendus coexistent dans l'arbre, et un
  // état commun ferait s'ouvrir l'un en manipulant l'autre.
  const [barMenu, setBarMenu] = useState<string | null>(null);
  const [panelMenu, setPanelMenu] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Fermeture au changement de page : sans cela, le panneau resterait ouvert
  // par-dessus la page qu'on vient de demander.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Échap ferme, et le défilement de la page est bloqué tant que le panneau
  // est ouvert — sinon le fond glisse sous les doigts pendant qu'on parcourt
  // le menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const visible = NAV_ENTRIES.filter(
    (entry) => entry.kind !== "link" || !entry.requiresUser || Boolean(user),
  );

  const isActive = (entry: NavEntry): boolean => {
    if (entry.kind === "link") return pathname === entry.href;
    if (entry.kind === "menu") return pathname.startsWith(entry.activePrefix);
    return false;
  };

  return (
    <header className="flex items-center justify-between bg-black shadow-md">
      {/* Logo — rembourrage et taille réduits sous `lg`, où l'ancien
          `px-20 py-10` mangeait presque toute la largeur d'un téléphone. */}
      <Link href="/">
        <div className="flex items-center px-4 py-4 lg:px-20 lg:py-10">
          <Image
            src="/AKFC_logo.svg"
            alt="AKFC logo"
            width={100}
            height={100}
            priority
            className="h-12 w-auto lg:h-25"
          />
        </div>
      </Link>

      {/* ── Barre horizontale (≥ lg) ──────────────────────────────────── */}
      <nav className="hidden w-[60%] items-center justify-center gap-4 lg:flex">
        {visible.map((entry) => {
          if (entry.kind === "activities") {
            return <OurActivitiesMenu key="activities" />;
          }

          if (entry.kind === "link") {
            return (
              <Link
                key={entry.href}
                href={entry.href}
                className={`${NAV_GLOW} text-[20px] ${isActive(entry) ? NAV_ACTIVE : ""}`}
              >
                {entry.label}
              </Link>
            );
          }

          return (
            <div
              key={entry.label}
              onMouseEnter={() => setBarMenu(entry.label)}
              onMouseLeave={() => setBarMenu(null)}
              className={`relative flex items-center text-[20px] ${NAV_GLOW} ${isActive(entry) ? NAV_ACTIVE : ""}`}
            >
              <span className="whitespace-nowrap">{entry.label}</span>
              <Image
                src="/chevron-white.svg"
                alt=""
                aria-hidden="true"
                width={30}
                height={30}
                className={`transition-transform duration-300 ${barMenu === entry.label ? "rotate-180" : ""}`}
              />
              <div
                className={`${barMenu === entry.label ? "block" : "hidden"} absolute left-1/2 top-full z-20 w-44 -translate-x-1/2 transform rounded border-4 bg-gray-300 opacity-90 shadow-md transition-opacity duration-300 hover:opacity-100`}
              >
                {entry.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* ── Authentification (≥ lg) ───────────────────────────────────── */}
      <div className="hidden lg:block">
        <Suspense fallback={<div>Chargement...</div>}>
          {user
            ? (
              <div className="flex items-center gap-3">
                <NotificationBell />
                <UserMenu />
              </div>
            )
            : <LoginForm />
          }
        </Suspense>
      </div>

      {/* ── Cloche + burger (< lg) ────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 lg:hidden">
        {/* La cloche RESTE visible : son intérêt est d'être vue sans qu'on la
            cherche. L'enfermer dans le panneau la viderait de son sens. */}
        {user && (
          <Suspense fallback={null}>
            <NotificationBell />
          </Suspense>
        )}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          aria-expanded={open}
          className="p-2 text-white"
        >
          <Menu className="h-7 w-7" />
        </button>
      </div>

      {/* ── Panneau (< lg) ────────────────────────────────────────────── */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Fond : ferme à l'appui, et masque la page pour que l'œil ne
              cherche pas à lire au travers. */}
          <div
            className="absolute inset-0 bg-black/80"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <div className="relative flex h-full flex-col overflow-y-auto bg-black px-6 pb-10">
            <div className="flex items-center justify-between py-4">
              <span className="text-lg font-semibold text-white">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer le menu"
                className="p-2 text-white"
              >
                <X className="h-7 w-7" />
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {visible.map((entry) => {
                if (entry.kind === "activities") {
                  return <OurActivitiesMenu key="activities" variant="panel" />;
                }

                if (entry.kind === "link") {
                  return (
                    <Link
                      key={entry.href}
                      href={entry.href}
                      className={`block py-3 text-lg text-white ${isActive(entry) ? NAV_ACTIVE : ""}`}
                    >
                      {entry.label}
                    </Link>
                  );
                }

                const expanded = panelMenu === entry.label;
                return (
                  <div key={entry.label} className="flex flex-col">
                    {/* Déroulé à l'APPUI et non au survol : c'est tout
                        l'objet du panneau. */}
                    <button
                      type="button"
                      onClick={() => setPanelMenu(expanded ? null : entry.label)}
                      aria-expanded={expanded}
                      className={`flex items-center justify-between py-3 text-left text-lg text-white ${isActive(entry) ? NAV_ACTIVE : ""}`}
                    >
                      <span>{entry.label}</span>
                      <Image
                        src="/chevron-white.svg"
                        alt=""
                        aria-hidden="true"
                        width={26}
                        height={26}
                        className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
                      />
                    </button>
                    {expanded && (
                      <div className="flex flex-col border-l border-gray-700 pl-4">
                        {entry.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block py-2 text-white/80"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Authentification en pied de panneau : le formulaire de
                connexion ne tient pas dans une barre de téléphone. */}
            <div className="mt-6 border-t border-gray-700 pt-6">
              <Suspense fallback={<div className="text-white">Chargement...</div>}>
                {user ? <UserMenu /> : <LoginForm />}
              </Suspense>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
