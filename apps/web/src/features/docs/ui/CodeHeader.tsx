"use client"

import { Clipboard } from "lucide-react"
import { useState } from "react"

interface CodeHeaderProps {
  filename?: string
  filepath?: string
  language?: string
  code: string
}

export function CodeHeader({
  filename,
  filepath,
  language,
  code,
}: CodeHeaderProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)

    window.setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/10 bg-white/[0.03] px-3 py-2 text-xs">
      <div className="min-w-0">
        {filename ? (
          <div className="truncate font-medium text-white/95">{filename}</div>
        ) : null}

        {filepath ? (
          <div className="truncate text-white/45">{filepath}</div>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {language ? (
          <span className="rounded bg-white/[0.06] px-2 py-0.5 uppercase text-white/55">
            {language}
          </span>
        ) : null}

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-white/55 transition-colors hover:text-white"
          aria-label="Copy code"
        >
          <Clipboard size={14} />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  )
}

export default CodeHeader