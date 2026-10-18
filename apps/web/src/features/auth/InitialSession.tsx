"use client";

import { createContext, JSX, ReactNode, useContext } from "react";

import type { SessionClient } from "@contracts/auth/session.types";
import { useSessionStore } from "@lib/stores/useSessionStore";

/**
 * Session lue CÔTÉ SERVEUR par le layout racine, transmise aux composants client.
 *
 * Le store de session (Zustand) est un module partagé : sur le serveur, il est commun à
 * toutes les requêtes, on ne peut donc pas y ranger la session d'un visiteur. Il reste
 * vide pendant le rendu serveur et au premier rendu client (statut « idle »). Sans valeur
 * initiale, le header s'affichait donc « non connecté » jusqu'à ce que la session arrive.
 * Ce contexte, lui, est propre à chaque requête : il porte la bonne réponse dès le HTML.
 */
const InitialSessionContext = createContext<SessionClient | null>(null);

export function InitialSessionProvider({
  session,
  children,
}: {
  session: SessionClient | null;
  children: ReactNode;
}): JSX.Element {
  return <InitialSessionContext.Provider value={session}>{children}</InitialSessionContext.Provider>;
}

/**
 * Utilisateur courant, sans clignement : la valeur du serveur tant que le store n'est pas
 * initialisé, puis celle du store (qui suit connexions et déconnexions).
 */
export function useCurrentUser(): NonNullable<SessionClient["user"]> | null {
  const initial = useContext(InitialSessionContext);
  const status = useSessionStore((s) => s.status);
  const user = useSessionStore((s) => s.session?.user ?? null);
  return status === "idle" ? (initial?.user ?? null) : user;
}
