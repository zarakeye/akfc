import type { Tour } from "../tour.types";

/**
 * Mot de passe oublié (public) — demander le lien de réinitialisation.
 * Fiche de doc associée : même identifiant, « public.mot-de-passe-oublie ».
 * Le tuto n'envoie rien : la dernière étape montre le bouton sans le cliquer.
 */
export const publicMotDePasseOublie: Tour = {
  id: "public.mot-de-passe-oublie",
  title: "Mot de passe oublié",
  description: "Demander un lien pour choisir un nouveau mot de passe.",
  audience: "public",
  routes: ["/auth/forgot-password"],
  startRoute: "/auth/forgot-password",
  doc: "/docs/guide/mot-de-passe-oublie",
  steps: [
    {
      target: "auth.forgot.email",
      title: "Votre adresse e-mail",
      body: "Tapez l'adresse avec laquelle vous vous connectez au site.",
      advance: { kind: "input", validate: (v) => v.includes("@") },
    },
    {
      target: "auth.forgot.submit",
      title: "Demandez le lien",
      body: "Ce bouton envoie un e-mail avec un lien valable 30 minutes. Pour ne pas révéler qui est inscrit, le message affiché est le même que l'adresse existe ou non : si rien n'arrive, vérifiez l'adresse et vos indésirables.",
      advance: { kind: "next" },
    },
  ],
};
