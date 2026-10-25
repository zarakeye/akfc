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
  // Hauteur de l'écran (`h-dvh`), pas `h-full` : `<html>` et `<body>` n'ont pas de hauteur fixée,
  // un `h-full` laisserait la page grandir avec le contenu. C'est alors la fenêtre qui défilerait,
  // et non la colonne centrale (#docs-content-scroll) que pilotent la table des matières « On this
  // page », la barre de progression et les boutons haut / bas.
  return <div className="h-dvh min-h-0 overflow-hidden">{children}</div>
}