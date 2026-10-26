"use client"

import { Monitor } from "lucide-react"

import { chooseOs, OS_LABEL, useChosenOs, type OsName } from "@features/docs/ui/OsTabs"

/**
 * Le système pour lequel la doc montre ses commandes, dans la barre latérale, à côté du thème.
 * Même réglage que les onglets <OsTabs> des pages : changer l'un change les autres.
 */
export function OsSelect() {
  const chosen = useChosenOs()
  return (
    <label className="flex items-center gap-2 text-xs text-muted-foreground">
      <Monitor className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>Système</span>
      <select
        value={chosen ?? ""}
        onChange={(e) => chooseOs(e.target.value as OsName)}
        className="min-w-0 flex-1 rounded-md border border-input bg-background px-1.5 py-1 text-xs text-foreground"
      >
        {/* Avant l'hydratation, le choix n'est pas encore lu : rien n'est sélectionné. */}
        {chosen === null ? <option value="" disabled hidden /> : null}
        {(Object.keys(OS_LABEL) as OsName[]).map((os) => (
          <option key={os} value={os}>
            {OS_LABEL[os]}
          </option>
        ))}
      </select>
    </label>
  )
}

export default OsSelect
