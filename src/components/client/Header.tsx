'use client';

import Link from "next/link";
import LoginForm from "./LoginForm";
import UserMenu from "@components/client/UserMenu";
import { Suspense, useState } from "react";
// import { trpc } from '@lib/trpcClient';
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSessionStore } from "@/lib/stores/useSessionStore";
import { User } from "@prisma/client";
import { trpcClient } from "@/lib/trpcClient";

export default function Header() {
  const user = useSessionStore(state => state.session?.user);
  // const [isActive, setIsActive] = useState<string>('');
  const pathname = usePathname();
  const [activitiesHover, setActivitiesHover] = useState<boolean>(false);
  const [kunfuHover, setKungFuHover] = useState<boolean>(false);

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
            href="/admin/dashboard"
            className={`text-white transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669] ${pathname === "/admin/dashboard" ? "text-[40px]" : "text-[20px]"}`}
          >
            Dashboard
          </Link>
        }
        <div
          onMouseEnter={() => setActivitiesHover(true)}
          onMouseLeave={() => setActivitiesHover(false)}
          className={`relative flex text-white items-center transition duration-700 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669] ${pathname === "/activities" ? "active" : ""}`}
        >
          <span>Nos activités</span>
          <Image
            src="/chevron-white.svg"
            alt='chevron'
            aria-hidden="true"
            width={30}
            height={30}
            className={`transition-transform duration-300 ${activitiesHover ? 'rotate-180' : ''}`}
          />
          <div className={`${activitiesHover ? 'block' : 'hidden'} absolute z-20 top-full left-1/2 transform -translate-x-1/2 w-40 bg-gray-300 border-4 rounded shadow-md opacity-90 hover:opacity-100 transition-opacity duration-300`}>
            <div
              onMouseEnter={() => setKungFuHover(true)}
              onMouseLeave={() => setKungFuHover(false)}
              className="relative block px-4 py-2 text-gray-800 hover:bg-gray-100"
            >
              <span>Kung Fu</span>
              <Image
                src="/chevron-gray.svg"
                alt='chevron'
                width={30}
                height={30}
                className={`absolute top-1/2 right-4 transform -translate-y-1/2 transition-transform duration-300 ${kunfuHover ? '-rotate-90' : ''}`}
              />
              <div className="absolute z-20 top-0 -right-full mt-2 w-40 bg-gray-300 rounded shadow-md opacity-90 hover:opacity-100 transition-opacity duration-300">
                <Link
                  href="/activities/kung-fu/Taichi"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  Taï-Chi
                </Link>
                <Link
                  href="/activities/kung-fu/Taolu"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  Tao-Lu
                </Link>
                <Link
                  href="/activities/kung-fu/ChoyLeeFut"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  Choy Lee Fut
                </Link>
              </div>
            </div>
            <Link
              href="/activities/kali"
              className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
            >
              Kali
            </Link>
          </div>
        </div>
        <Link
          href="/gallery"
          className={`text-white transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669] ${pathname === "/gallery" ? "text-[20px]" : ""}`}
        >
          Galerie
        </Link>
        <Link 
          href="/about" 
          className={`text-white transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669] ${pathname === "/about" ? "text-[20px]" : ""}`}
        >
          À propos
        </Link>
        <Link
          href="/contacts"
          className={`text-white transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669] ${pathname === "/contacts" ? "active" : ""}`}
        >
          Contacts
        </Link>
      </nav>

      <Suspense fallback={<div>Chargement...</div>}>
        {user
          ? <UserMenu />
          : <LoginForm />
        }
      </Suspense>
    </header>
  );
}