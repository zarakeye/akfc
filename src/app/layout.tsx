import { JSX } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from '@/app/providers';
import { SessionLoader } from "@/features/auth-ui/SessionLoader";
import Header from '@/features/app-shell/Header';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AKFC",
  description: "Association de Kung Fu de Chambéry",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * The root layout component of the application.
 * It wraps the children with the necessary HTML tags and providers.
 * It also sets the font family and layout of the application.
 */
export default function RootLayout({
  children,
}: RootLayoutProps): JSX.Element {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} h-screen flex flex-col antialiased`}
      >
        <AppProviders>
          <SessionLoader >
            <Header />
            <div className='flex-1 overflow-hidden'>
              {children}
            </div>
          </SessionLoader>
        </AppProviders>
      </body>
    </html>
  );
}
