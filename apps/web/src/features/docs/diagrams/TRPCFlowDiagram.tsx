import { ArchitectureDiagram } from "#features/docs/ui/ArchitectureDiagram.tsx"

export function TRPCFlowDiagram() {
  return (
    <ArchitectureDiagram
      // title="tRPC request flow"
      steps={[
        "Client (Web / React Native)",
        "tRPC Router",
        "Procedure",
        "Service layer",
        "Prisma",
        "Database",
      ]}
    />
  )
}
