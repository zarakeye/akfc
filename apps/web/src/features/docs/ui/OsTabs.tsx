"use client"

import {
  Children,
  isValidElement,
  useSyncExternalStore,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react"

/*
 * Commandes qui diffèrent selon le système : un onglet par système, et le choix du lecteur vaut
 * pour TOUTE la documentation (il est gardé dans son navigateur). Au premier passage, le système
 * est deviné depuis le navigateur.
 *
 *   <OsTabs>
 *     <Os name="mac">```bash … ```</Os>
 *     <Os name="linux">```bash … ```</Os>
 *     <Os name="windows">Sous Windows, …</Os>
 *   </OsTabs>
 *
 * Sous Windows, le projet se développe dans WSL 2 (un vrai Linux) : l'onglet Windows ne décrit que
 * ce qui diffère de Linux, le reste se lit dans l'onglet Linux.
 */

export type OsName = "mac" | "linux" | "windows"

export const OS_LABEL: Record<OsName, string> = {
  mac: "macOS",
  linux: "Linux",
  windows: "Windows (WSL 2)",
}

const STORAGE_KEY = "akfc-docs-os"

/*
 * Le système choisi, vu comme une source extérieure (localStorage) : tous les onglets de la page
 * s'y abonnent et changent ensemble. Côté serveur et pendant l'hydratation : null (aucun onglet
 * choisi, le premier présent s'affiche), sans écart entre le HTML du serveur et le navigateur.
 */
const listeners = new Set<() => void>()

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange)
  window.addEventListener("storage", onChange)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener("storage", onChange)
  }
}

function guessOs(): OsName {
  const ua = navigator.userAgent
  if (/Windows/i.test(ua)) return "windows"
  if (/Macintosh|Mac OS X/i.test(ua)) return "mac"
  return "linux"
}

function readOs(): OsName {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved === "mac" || saved === "linux" || saved === "windows") return saved
  } catch {
    // Stockage indisponible (navigation privée stricte) : on devine.
  }
  return guessOs()
}

export function chooseOs(os: OsName): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, os)
  } catch {
    // Le choix ne sera pas retenu, mais l'onglet change quand même pour cette page.
  }
  listeners.forEach((listener) => listener())
}

/**
 * Le système choisi par le lecteur (null côté serveur et pendant l'hydratation). Partagé par les
 * onglets des pages et par le sélecteur de la barre latérale (OsSelect).
 */
export function useChosenOs(): OsName | null {
  return useSyncExternalStore(subscribe, readOs, () => null)
}

/** Le contenu d'un système (marqueur lu par OsTabs). */
export function Os({ children }: { name: OsName; children?: ReactNode }) {
  return <>{children}</>
}

export function OsTabs({ children }: { children?: ReactNode }) {
  const panes = Children.toArray(children).filter(
    (child): child is ReactElement<{ name: OsName; children?: ReactNode }> =>
      isValidElement(child) && typeof (child.props as { name?: unknown }).name === "string",
  )
  const chosen = useChosenOs()
  const available = panes.map((p) => p.props.name)
  // Le système choisi, s'il a un onglet ici ; sinon Linux (Windows passe par WSL), sinon le premier.
  const active =
    chosen && available.includes(chosen)
      ? chosen
      : chosen === "windows" && available.includes("linux")
        ? "linux"
        : available[0]

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return
    const next = (index + (e.key === "ArrowRight" ? 1 : available.length - 1)) % available.length
    chooseOs(available[next])
  }

  return (
    <div className="my-6 rounded-xl border bg-card text-left">
      <div role="tablist" aria-label="Système d'exploitation" className="flex flex-wrap gap-1 border-b p-2">
        {available.map((os, i) => (
          <button
            key={os}
            type="button"
            role="tab"
            aria-selected={os === active}
            tabIndex={os === active ? 0 : -1}
            onClick={() => chooseOs(os)}
            onKeyDown={(e) => onKey(e, i)}
            className={`rounded-md px-3 py-1 text-sm transition-colors ${
              os === active
                ? "bg-emerald-600 font-medium text-white"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {OS_LABEL[os]}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="px-4 pb-1 pt-3 [&>div:first-child]:mt-0 [&>p:last-child]:mb-3">
        {panes.find((p) => p.props.name === active)?.props.children}
      </div>
      <p className="border-t px-4 py-1.5 text-xs text-muted-foreground">
        Choix retenu pour toute la documentation ; il se change aussi dans la barre latérale.
      </p>
    </div>
  )
}

export default OsTabs
