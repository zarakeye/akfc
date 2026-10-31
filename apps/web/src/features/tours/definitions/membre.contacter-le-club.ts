import type { Tour } from "../tour.types";

/**
 * Contacter le club (membre) — remplir le formulaire de demande, sans l'envoyer.
 * Fiche de doc associée : même identifiant, « membre.contacter-le-club ».
 * Le choix du destinataire n'existe que s'il y en a plusieurs : étape facultative.
 */
export const membreContacterLeClub: Tour = {
  id: "membre.contacter-le-club",
  title: "Contacter le club",
  description: "Écrire au bureau ou au support du site depuis le formulaire des membres.",
  audience: "member",
  routes: ["/contacts"],
  startRoute: "/contacts",
  steps: [
    {
      target: "contact.form.category",
      title: "À qui écrivez-vous ?",
      body: "Choisissez le destinataire, par exemple « Gestion du club » pour la vie du club, « Support du site » pour un problème sur le site.",
      advance: { kind: "next" },
      optional: true,
    },
    {
      target: "contact.form.subject",
      title: "Le sujet",
      body: "Quelques mots qui résument la demande.",
      advance: { kind: "input", validate: (v) => v.trim().length > 0 },
    },
    {
      target: "contact.form.body",
      title: "Votre message",
      body: "Expliquez votre demande. Après l'envoi, le site affiche une référence et la date de réponse au plus tard, et un accusé de réception part par e-mail.",
      advance: { kind: "input", validate: (v) => v.trim().length > 0 },
    },
    {
      target: "contact.form.submit",
      title: "Envoyer",
      body: "Ce bouton transmet la demande au club. Ce tuto ne l'envoie pas : cliquez vous-même si votre message est réel, sinon quittez avec Échap.",
      advance: { kind: "next" },
    },
  ],
};
