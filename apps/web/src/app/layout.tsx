import { JSX } from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css";
import { prisma } from "@backend/prisma"
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
/**
 * Sérialise le réglage enregistré en déclaration CSS.
 *
 * Sélecteur `html:root` et non `:root` : il pèse 0,0,2 contre 0,0,1, donc la
 * surcharge l'emporte par SPÉCIFICITÉ et non par ordre d'apparition. Next
 * déplace les feuilles au gré du bundling — se fier à l'ordre serait
 * fragile.
 *
 * Les noms et les valeurs sont déjà validés à l'écriture par
 * `siteStyle.save` (préfixe `--akfc-` imposé, jeu de caractères restreint) :
 * rien d'arbitraire ne peut atteindre cette balise.
 */
function serializeSiteStyle(variables: Record<string, string>): string {
  const body = Object.entries(variables)
    .map(([key, value]) => `${key}:${value};`)
    .join("");
  return `html:root{${body}}`;
}

export default async function RootLayout({
  children,
}: RootLayoutProps): Promise<JSX.Element> {
  // Lecture directe plutôt que par tRPC : on est dans un Server Component,
  // passer par HTTP pour interroger sa propre base n'aurait aucun sens.
  // Une ligne absente est le cas NORMAL tant que rien n'a été réglé — les
  // valeurs de globals.css s'appliquent alors.
  const siteStyle = await prisma.siteStyle
    .findUnique({ where: { id: 1 } })
    .catch(() => null);

  const styleOverride =
    siteStyle && siteStyle.variables
      ? serializeSiteStyle(siteStyle.variables as Record<string, string>)
      : null;

  return (
    <html lang="fr">
      {styleOverride && (
        <style
          id="akfc-site-style"
          dangerouslySetInnerHTML={{ __html: styleOverride }}
        />
      )}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppProviders>
          <SessionLoader>{children}</SessionLoader>
        </AppProviders>
      </body>
    </html>
  )
}
