"use client";

import type { JSX } from "react";

import { useSessionStore } from "@lib/stores/useSessionStore";
import { ContactForm } from "@features/contact/ContactForm";

/**
 * Partie MEMBRES de « Nous contacter » : le formulaire de demandes (bureau, support du site),
 * réservé aux membres connectés — le serveur le refuse aussi aux visiteurs. Un visiteur ne voit
 * qu'une ligne l'invitant à se connecter s'il est membre.
 */
export function MemberContactSection(): JSX.Element | null {
  const status = useSessionStore((s) => s.status);
  const user = useSessionStore((s) => s.session?.user ?? null);

  if (user) {
    return (
      <section className="mt-10 rounded-lg border border-border p-6" aria-labelledby="member-contact-title">
        <p id="member-contact-title" className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
          Espace membres
        </p>
        <p className="mb-6 mt-1 text-sm text-muted-foreground">
          Choisissez le destinataire : «&nbsp;Gestion du club&nbsp;» pour la vie du club (cours, stages,
          licences…), «&nbsp;Support du site&nbsp;» pour un problème sur le site ou votre compte. Vous recevez
          aussitôt un accusé de réception avec la référence de votre demande.
        </p>
        <ContactForm />
      </section>
    );
  }
  // Session pas encore connue : rien, pour ne pas faire clignoter l'invitation.
  if (status === "idle") return null;
  return (
    <p className="mt-10 text-sm text-muted-foreground">
      Vous êtes membre du club&nbsp;? Connectez-vous (en haut de la page) pour écrire au bureau ou au support
      du site depuis votre espace, et suivre la réponse à votre demande.
    </p>
  );
}
