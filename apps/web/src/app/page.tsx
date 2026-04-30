'use client';

import { JSX } from "react";
import { useSessionStore } from "@lib/stores/useSessionStore";
import UpdateUserForm from "@features/admin/users/forms/update-me/UpdateMeForm";

/**
 * Home component
 *
 * This component is the main page of the app. It displays a welcome message based on the user's session status.
 * If the user is logged in, it displays their first name or email address.
 * If the user just logged out, it displays a message indicating that they are disconnected.
 * If the user is not logged in, it displays a message inviting them to log in.
 *
 * If the user is logging in for the first time, it displays the UpdateUserForm component, which allows them to update their profile information.
 */
export default function Home(): JSX.Element {
  const session = useSessionStore(state => state.session);
  const status = useSessionStore(state => state.status);
  // const resetStatus = useSessionStore(state => state.resetStatus);

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
