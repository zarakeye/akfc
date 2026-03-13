"use client"

import { useEffect, useState } from "react"

// --- UI Primitives ---
import { Button } from "@/features/editor-tiptap/ui-primitive/button"

// --- Icons ---
import { MoonStarIcon } from "@/features/editor-tiptap/icons/moon-star-icon"
import { SunIcon } from "@/features/editor-tiptap/icons/sun-icon"

function getInitialDarkMode(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false
  }

  const hasDarkMeta = !!document.querySelector(
    'meta[name="color-scheme"][content="dark"]'
  )

  return (
    hasDarkMeta || window.matchMedia("(prefers-color-scheme: dark)").matches
  )
}

export function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => getInitialDarkMode())

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const handleChange = () => {
      setIsDarkMode(mediaQuery.matches)
    }

    mediaQuery.addEventListener("change", handleChange)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode)
  }, [isDarkMode])

  const toggleDarkMode = () => {
    setIsDarkMode((isDark) => !isDark)
  }

  return (
    <Button
      onClick={toggleDarkMode}
      aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
      data-style="ghost"
    >
      {isDarkMode ? (
        <MoonStarIcon className="tiptap-button-icon" />
      ) : (
        <SunIcon className="tiptap-button-icon" />
      )}
    </Button>
  )
}