import type { ReactNode } from "react"

interface ArchitectureDiagramProps {
  steps?: string[]
}

export function ArchitectureDiagram({ steps = [] }: ArchitectureDiagramProps) {
  if (!steps.length) return null

  return (
    <div className="my-8 overflow-x-auto">
      <div className="flex items-center gap-3">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center gap-3">
            <div className="rounded-lg border bg-muted/30 px-4 py-2 text-sm font-medium whitespace-nowrap">
              {step}
            </div>

            {index < steps.length - 1 && (
              <span className="text-muted-foreground">→</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}