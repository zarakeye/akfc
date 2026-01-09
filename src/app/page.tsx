'use client';
// import Image from "next/image";
import UpdateUserForm from "@/app/forms/UpdateUser.form";
import { useSessionStore } from "@/lib/stores/useSessionStore";
import { useEffect } from "react";

export default function Home() {
  const user = useSessionStore((state) => state.session?.user);
  const justLoggedIn = useSessionStore((state) => state.justLoggedIn);
  const justLoggedOut = useSessionStore((state) => state.justLoggedOut);
  const setJustLoggedIn = useSessionStore((state) => state.setJustLoggedIn);
  const setJustLoggedOut = useSessionStore((state) => state.setJustLoggedOut);

  // reset flags **après rendu**
  useEffect(() => {
    if (justLoggedIn) setJustLoggedIn(false);
    // if (justLoggedOut) setJustLoggedOut(false);
  }, [justLoggedIn, justLoggedOut, setJustLoggedIn, setJustLoggedOut]);

  useEffect(() => {
    if (!justLoggedOut) return;

    const timer = setTimeout(() => {
      setJustLoggedOut(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [justLoggedOut, setJustLoggedOut]);


  let message = "Bienvenue invité !"; // par défaut
  if (justLoggedOut) {
    message = "Vous êtes déconnecté";
  }
  else if (user && !justLoggedIn && !justLoggedOut) message = `Bienvenue ${user.firstName || user.email}`;

  if (user?.isFirstLogin) {
    return <UpdateUserForm user={user} setFirstLogin={() => {/* ... */}} />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="max-w-3xl p-16 bg-white dark:bg-black">
        <h1 className="text-3xl font-semibold">{message}</h1>
      </main>
    </div>
  );
}
