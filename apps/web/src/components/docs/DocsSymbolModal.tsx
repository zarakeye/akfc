"use client"

import { createContext, useContext, useState } from "react"
import { docsSymbolRegistry } from "@/lib/docs/symbolRegistry"
import CodeExample from "./CodeExample"

const DocsSymbolModalContext = createContext<any>(null)

export function DocsSymbolModalProvider({ children }: any) {
  const [symbol, setSymbol] = useState<string | null>(null)

  function open(name: string) {
    setSymbol(name)
  }

  function close() {
    setSymbol(null)
  }

  const entry = symbol ? docsSymbolRegistry[symbol] : null

  return (
    <DocsSymbolModalContext.Provider value={{ open }}>
      {children}

      {entry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-[900px] max-w-[95vw] rounded-xl bg-background shadow-xl">
            <div className="flex justify-between p-4 border-b">
              <div className="font-medium">{symbol}</div>
              <button onClick={close}>✕</button>
            </div>

            <div className="p-6">
              <CodeExample
                filepath={entry.filepath}
                snippetRange={entry.snippetRange}
              />
            </div>
          </div>
        </div>
      )}
    </DocsSymbolModalContext.Provider>
  )
}

export function useDocsSymbolModal() {
  return useContext(DocsSymbolModalContext)
}