"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CropperTheme = "light" | "dark";

interface CropperThemeStore {
  theme: CropperTheme;
  toggle: () => void;
  setTheme: (theme: CropperTheme) => void;
}

/**
 * Thème (clair/sombre) DU CROPPER, persisté (localStorage) et propre au
 * cropper — n'affecte que lui, jamais le reste de l'app. Défaut sombre.
 * Utilisé uniquement quand le Cropper est monté avec `enableTheme`.
 */
export const useCropperTheme = create<CropperThemeStore>()(
  persist(
    (set) => ({
      theme: "dark",
      toggle: () =>
        set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
      setTheme: (theme) => set({ theme }),
    }),
    { name: "akfc-cropper-theme" },
  ),
);
