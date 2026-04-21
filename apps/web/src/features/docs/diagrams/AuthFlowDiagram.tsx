// FlowAuthDiagram.tsx

import { ArchitectureDiagram } from "@/features/docs/ui/ArchitectureDiagram"

export function AuthFlowDiagram() {
  return (
    <ArchitectureDiagram
      steps={[
        "Client",
        "Validation Zod",
        "Router tRPC",
        "Service",
        "Database",
      ]}
    />
  )
}