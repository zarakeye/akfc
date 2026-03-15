"use client"

import { useDocsSymbolModal } from "@/components/docs/DocsSymbolModal"

interface Props {
  symbol: string
  children: React.ReactNode
}

export function CodeSymbolLink({ symbol, children }: Props) {
  const { open } = useDocsSymbolModal()

  return (
    <button
      onClick={() => open(symbol)}
      className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
    >
      {children}
    </button>
  )
}