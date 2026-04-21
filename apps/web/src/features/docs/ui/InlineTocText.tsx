import React from "react"

function renderInlineMarkdown(text: string): React.ReactNode[] {
  const parts = text.split(/(`[^`]+`)/g)

  return parts.map((part, index) => {
    if (/^`[^`]+`$/.test(part)) {
      return (
        // <code
        //   key={index}
        //   className="rounded bg-black/5 px-1.5 py-0.5 font-mono text-[0.85em] text-foreground dark:bg-white/10"
        // >
        <code
          key={index}
          className="rounded bg-blue-500/15 px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
        >
          {part.slice(1, -1)}
        </code>
      )
    }

    return <React.Fragment key={index}>{part}</React.Fragment>
  })
}

export function InlineTocText({ text }: { text: string }) {
  return <>{renderInlineMarkdown(text)}</>
}

export default InlineTocText