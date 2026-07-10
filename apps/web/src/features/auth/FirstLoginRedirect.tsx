"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useSessionStore } from "@lib/stores/useSessionStore";

/**
 * Redirige un utilisateur en PREMIÈRE CONNEXION vers /profil/edit, pour
 * qu'il complète ses informations (toutes nullables, dont l'avatar).
 * `isFirstLogin` passe à false dès que le formulaire est soumis
 * (updateProfile), ce qui lève la redirection.
 *
 * Garde-fous : ne redirige que si connecté ET first-login ET pas déjà sur
 * la page d'édition (évite toute boucle). Rendu invisible (null).
 */
export function FirstLoginRedirect(): null {
  const user = useSessionStore((s) => s.session?.user);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user?.isFirstLogin) return;
    if (pathname === "/profil/edit") return;
    router.replace("/profil/edit");
  }, [user?.isFirstLogin, pathname, router]);

  return null;
}
