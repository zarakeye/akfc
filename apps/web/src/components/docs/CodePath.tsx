interface CodePathProps {
  filepath: string
}

export function CodePath({ filepath }: CodePathProps) {
  const parts = filepath.split("/").filter(Boolean)

  return (
    <div className="flex min-w-0 items-center gap-1 overflow-hidden text-xs text-white/45">
      {parts.map((part, index) => {
        const isLast = index === parts.length - 1

        return (
          <span key={`${part}-${index}`} className="flex min-w-0 items-center gap-1">
            <span className={isLast ? "truncate text-white/75" : "truncate"}>
              {part}
            </span>

            {!isLast ? <span className="text-white/25">/</span> : null}
          </span>
        )
      })}
    </div>
  )
}

export default CodePath