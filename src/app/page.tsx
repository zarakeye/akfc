'use client';
import { useSessionStore } from "@/lib/stores/useSessionStore";
import { useEffect, useState } from "react";
import UpdateUserForm from "./forms/UpdateMe.form";

export default function Home() {
  const session = useSessionStore(state => state.session);
  const status = useSessionStore(state => state.status);
  const resetStatus = useSessionStore(state => state.resetStatus);

  let message: string;

  if (status === "justLoggedOut") {
    message = "Vous êtes déconnecté";
  } else if (session?.user) {
    message = `Bienvenue ${session.user.firstName ?? session.user.email}`;
  } else {
    message = "Bienvenue invité !";
  }

  // Si c'est le premier login, afficher le formulaire
  if (session?.user?.isFirstLogin) {
    return <UpdateUserForm />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="max-w-3xl p-16 bg-white dark:bg-black">
        <h1 className="text-3xl font-semibold">{message}</h1>
      </main>
    </div>
  );
}
