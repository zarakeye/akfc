import type { ReactNode } from "react"

interface ArchitectureDiagramProps {
  steps?: string[] | string
  stepsJson?: string
  children?: ReactNode
}

function normalizeSteps({
  steps,
  stepsJson,
  children,
}: ArchitectureDiagramProps): string[] {
  if (Array.isArray(steps)) {
    return steps.map((step) => step.trim()).filter(Boolean)
  }

  if (typeof steps === "string" && steps.trim()) {
    return steps
      .split("|")
      .map((step) => step.trim())
      .filter(Boolean)
  }

  if (typeof stepsJson === "string" && stepsJson.trim()) {
    try {
      const parsed = JSON.parse(stepsJson)

      if (Array.isArray(parsed)) {
        return parsed
          .filter((step): step is string => typeof step === "string")
          .map((step) => step.trim())
          .filter(Boolean)
      }
    } catch {
      return []
    }
  }

  if (typeof children === "string" && children.trim()) {
    return children
      .split("|")
      .map((step) => step.trim())
      .filter(Boolean)
  }

  return []
}

export function ArchitectureDiagram(props: ArchitectureDiagramProps) {
  const steps = normalizeSteps(props)

  if (!steps.length) {
    return (
      <div className="my-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
        No diagram steps provided.
      </div>
    )
  }

  return (
    <div className="my-8 rounded-2xl border border-black/10 bg-[#2b2b2b] p-4 shadow-sm">
      <p className="mb-3 text-xs font-medium text-white/80">
        Scroller horizontalement si nécessaire
      </p>

      <div className="overflow-x-auto">
        <div className="flex min-w-max items-center gap-3 pb-1">
          {steps.map((step, index) => (
            <div key={`${step}-${index}`} className="flex items-center gap-3">
              <div className="whitespace-nowrap rounded-xl bg-white px-4 py-2 text-sm font-medium text-black shadow-sm">
                {step}
              </div>

              {index < steps.length - 1 ? (
                <span className="shrink-0 text-white/70">→</span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ArchitectureDiagram