import { JSX } from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { AppProviders } from "@/app/providers"
import { SessionLoader } from "@/features/auth/SessionLoader"
import Header from "@/features/app-shell/Header"

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

export default function RootLayout({
  children,
}: RootLayoutProps): JSX.Element {
  return (
    <html lang="fr" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} h-full overflow-hidden antialiased`}
      >
        <AppProviders>
          <SessionLoader>
            <div className="flex h-dvh flex-col overflow-hidden bg-background">
              <div className="sticky top-0 z-50 shrink-0 bg-background">
                <Header />
              </div>

              <main
                id="app-scroll-container"
                className="min-h-0 flex-1 overflow-hidden"
              >
                {children}
              </main>
            </div>
          </SessionLoader>
        </AppProviders>
      </body>
    </html>
  )
}