import type { Metadata } from "next"
import type { ReactNode } from "react"

// Métadonnées de /docs (et valeur par défaut des sous-pages). Elles vivent ici, dans un
// Server Component : Next 16.3 compile page.mdx comme module client, qui ne peut pas
// exporter `metadata`.
export const metadata: Metadata = {
  title: "Documentation",
  description: "Documentation technique et pédagogique du projet AKFC.",
}

export default function DocsRootLayout({
  children,
}: {
  children: ReactNode
}) {
  return <div className="h-full min-h-0 overflow-hidden">{children}</div>
}