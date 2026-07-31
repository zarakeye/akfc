'use client';

import Link from "next/link";
import LoginForm from "@features/auth/components/LoginForm";
import UserMenu from "@features/app-shell/UserMenu";
import { NotificationBell } from "@features/app-shell/NotificationBell";
import { Suspense, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSessionStore } from "@lib/stores/useSessionStore";
import OurActivitiesMenu from "@features/app-shell/OurActivitiesMenu";

/**
 * Header component of the application.
 * It displays the logo, navbar, user menu and login form.
 * The navbar is only visible when the user is connected.
 * The user menu is only visible when the user is connected.
 * The login form is only visible when the user is not connected.
 */
export default function Header() {
  const user = useSessionStore(state => state.session?.user);
  const pathname = usePathname();
  const [activitiesHover, setActivitiesHover] = useState<boolean>(false);
  const [kunfuHover, setKungFuHover] = useState<boolean>(false);
  const [documentationHover, setDocumentationHover] = useState<boolean>(false);
  const [aboutHover, setAboutHover] = useState<boolean>(false);

  return (
    <header className="flex justify-between items-center bg-black shadow-md">
      {/* Logo */}
      <Link href="/">
        <div className="flex items-center px-20 py-10">
            <Image
              src="/AKFC_logo.svg"
              alt="AKFC logo"
              // className="dark:invert"
              width={100}
              height={100}
              priority
            />
          </div>
      </Link>

      {/* Navbar */}
      <nav className="flex gap-4 w-[60%] justify-center items-center">
        <Link
          href="/"
          className={`text-white transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669] ${pathname === "/" ? "text-[40px] text-bold" : "text-[20px]"}`}
        >
          Accueil
        </Link>

        {user &&
          <Link
            href="/dashboard"
            className={`text-white transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669] ${pathname === "/dashboard" ? "text-[40px]" : "text-[20px]"}`}
          >
            Dashboard
          </Link>
        }

        <OurActivitiesMenu />

        <Link
          href="/gallery"
          className={`text-white transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669] ${pathname === "/gallery" ? "text-[20px]" : ""}`}
        >
          Galeries
        </Link>

        <Link
          href="/agenda"
          className={`text-white transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669] ${pathname === "/agenda" ? "text-[20px]" : ""}`}
        >
          Agenda
        </Link>
        <div
          onMouseEnter={() => setAboutHover(true)}
          onMouseLeave={() => setAboutHover(false)}
          className={`relative flex text-white items-center transition duration-700 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669] ${pathname.startsWith("/about") ? "text-[20px]" : ""}`}
        >
          <span>Qui sommes-nous&nbsp;?</span>
          <Image
            src="/chevron-white.svg"
            alt=""
            aria-hidden="true"
            width={30}
            height={30}
            className={`transition-transform duration-300 ${aboutHover ? 'rotate-180' : ''}`}
          />
          <div className={`${aboutHover ? 'block' : 'hidden'} absolute z-20 top-full left-1/2 transform -translate-x-1/2 w-44 bg-gray-300 border-4 rounded shadow-md opacity-90 hover:opacity-100 transition-opacity duration-300`}>
            <Link
              href="/about"
              className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
            >
              L&apos;association
            </Link>
            <Link
              href="/about/instructeurs"
              className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
            >
              Nos instructeurs
            </Link>
          </div>
        </div>
        <Link
          href="/contacts"
          className={`text-white transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669] ${pathname === "/contacts" ? "active" : ""}`}
        >
          Contacts
        </Link>

        <div
          onMouseEnter={() => setDocumentationHover(true)}
          onMouseLeave={() => setDocumentationHover(false)}
          className={`relative flex text-white items-center transition duration-700 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669] ${pathname === "/activities" ? "active" : ""}`}
        >
          <span>Documentation</span>
          <Image
            src="/chevron-white.svg"
            alt=""
            aria-hidden="true"
            width={30}
            height={30}
            className={`transition-transform duration-300 ${documentationHover ? 'rotate-180' : ''}`}
          />
          <div className={`${documentationHover ? 'block' : 'hidden'} absolute z-20 top-full left-1/2 transform -translate-x-1/2 w-40 bg-gray-300 border-4 rounded shadow-md opacity-90 hover:opacity-100 transition-opacity duration-300`}>
            {/* <div
              onMouseEnter={() => setDocumentationHover(true)}
              onMouseLeave={() => setDocumentationHover(false)}
              className="relative block px-4 py-2 text-gray-800 hover:bg-gray-100"
            > */}
            <Link
              href="/docs"
              className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
            >
              Doc utilisateur
            </Link>
            <Link
              href="/docs/admin"
              className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
            >
              Doc admin
            </Link>
            <Link
              href="/docs/dev"
              className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
            >
              Dev doc
            </Link>
            {/* </div> */}
          </div>
        </div>
      </nav>

      <Suspense fallback={<div>Chargement...</div>}>
        {user
          ? (
            <div className="flex items-center gap-3">
              <NotificationBell />
              <UserMenu />
            </div>
          )
          : <LoginForm />
        }
      </Suspense>
    </header>
  );
}
