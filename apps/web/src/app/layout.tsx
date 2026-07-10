import { JSX } from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css";
import { AppProviders } from "@app/providers"
import { SessionLoader } from "@features/auth/SessionLoader"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "AKFC",
  description: "Association de Kung Fu de Chambéry",
}

interface RootLayoutProps {
  children: React.ReactNode
}

/**
 * Layout racine — minimal et NEUTRE en matière de hauteur/scroll.
 *
 * Il ne contraint PAS la hauteur du document : c'est à chaque famille de
 * routes (admin shell vs site public) de décider de son comportement de
 * scroll, via son propre layout. Mettre `overflow-hidden` / `h-dvh` ici
 * piégeait la home publique (page longue) dans la hauteur de l'écran et
 * masquait tout ce qui dépassait.
 */
export default function RootLayout({
  children,
}: RootLayoutProps): JSX.Element {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppProviders>
          <SessionLoader>{children}</SessionLoader>
        </AppProviders>
      </body>
    </html>
  )
}
