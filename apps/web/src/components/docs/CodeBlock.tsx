"use client"

import { useState } from "react"

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
}

export function CodeBlock({
  code,
  language = "text",
  filename,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)

    window.setTimeout(() => {
      setCopied(false)
    }, 1200)
  }

  return (
    <div className="my-6 overflow-hidden rounded-xl border bg-muted/20">
      <div className="flex items-center justify-between border-b px-4 py-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          {filename ? (
            <span className="font-medium text-foreground">{filename}</span>
          ) : null}

          <span className="rounded bg-muted px-2 py-0.5 uppercase tracking-wide">
            {language}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="rounded px-2 py-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <pre className="overflow-x-auto p-4 text-sm leading-6">
        <code>{code}</code>
      </pre>
    </div>
  )
}