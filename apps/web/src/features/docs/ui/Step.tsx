import type { ReactNode } from "react"

interface StepProps {
  children: ReactNode
}

/**
 * Step component
 * Used to highlight key ideas in tutorials without numbering sections.
 */
export function Step({ children }: StepProps) {
  return (
    <div className="my-6 rounded-xl border-l-4 border-primary bg-muted/30 p-4">
      <p className="text-sm font-medium leading-6">
        {children}
      </p>
    </div>
  )
}
