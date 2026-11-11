import type { ReactNode } from "react"

/**
 * Types d'encadrés. `concept` pose une définition ; `insight` tire une leçon générale du cas lu.
 * Un type inconnu s'afficherait sans couleur : `scripts/check-doc-components.mjs` le refuse.
 */
export const CALLOUT_TYPES = ["info", "tip", "warning", "danger", "concept", "insight"] as const
type CalloutType = (typeof CALLOUT_TYPES)[number]

interface CalloutProps {
  type?: CalloutType
  title?: string
  children: ReactNode
}

// Tons pastel. Fonds PLEINS (pas de transparence) : en mode sombre, un fond translucide se fond
// dans la page. Le fond est un ton plus clair que la barre de gauche ; le texte reste foncé.
const styles: Record<CalloutType, string> = {
  info: "border-sky-300 bg-sky-50 dark:border-sky-400 dark:bg-sky-200 dark:text-sky-950",
  tip: "border-emerald-300 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-200 dark:text-emerald-950",
  warning: "border-amber-300 bg-amber-50 dark:border-amber-400 dark:bg-amber-100 dark:text-amber-950",
  danger: "border-rose-300 bg-rose-50 dark:border-rose-400 dark:bg-rose-200 dark:text-rose-950",
  concept: "border-violet-300 bg-violet-50 dark:border-violet-400 dark:bg-violet-200 dark:text-violet-950",
  insight: "border-indigo-300 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-200 dark:text-indigo-950",
}

export function Callout({
  type = "info",
  title,
  children,
}: CalloutProps) {
  return (
    <div
      className={`my-6 rounded-lg border-l-4 p-4 dark:[&_code]:bg-black/10 ${styles[type]}`}
    >
      {title && (
        <p className="mb-2 font-semibold">
          {title}
        </p>
      )}

      <div className="text-sm leading-7">
        {children}
      </div>
    </div>
  )
}