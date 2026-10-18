"use client";

import { JSX, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

import { applyTheme, readTheme, subscribeTheme, type Theme } from "./theme";

/**
 * Interrupteur clair / sombre. Il lit l'état directement sur <html> (store externe) : le
 * serveur ne connaît pas le choix du visiteur et rend « clair », le navigateur corrige
 * aussitôt, sans écart d'hydratation ni effet qui recopierait l'état.
 *
 * `tone` : « onDark » pour un fond toujours noir (header), « auto » ailleurs.
 */
export function ThemeToggle({ tone = "auto" }: { tone?: "onDark" | "auto" }): JSX.Element {
  const theme = useSyncExternalStore<Theme>(subscribeTheme, readTheme, () => "light");
  const next: Theme = theme === "dark" ? "light" : "dark";
  const label = next === "dark" ? "Passer en mode sombre" : "Passer en mode clair";

  return (
    <button
      type="button"
      onClick={() => applyTheme(next)}
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
        tone === "onDark"
          ? "text-white hover:bg-white/15"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
