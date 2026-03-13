"use client"

import { useState } from "react"

export function CodeBlock({
  code,
  language = "text",
}: {
  code: string
  language?: string
}) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div className="my-6 overflow-hidden rounded-2xl border">
      <div className="flex items-center justify-between border-b px-4 py-2 text-xs text-muted-foreground">
        <span>{language}</span>

        <button
          type="button"
          onClick={handleCopy}
          className="rounded px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <pre className="overflow-x-auto p-4 text-sm">
        <code>{code}</code>
      </pre>
    </div>
  )
}
