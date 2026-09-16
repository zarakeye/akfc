import { Suspense, type JSX } from "react";

import UpdateMeForm from "@features/admin/users/forms/update-me/UpdateMeForm";
import ChangePasswordForm from "@features/auth/ChangePasswordForm";

/**
 * Édition du profil — même formulaire que la première connexion
 * (UpdateMeForm, scellé sur le user connecté). Accessible à tout membre ;
 * le proxy garde `/profil`. Le Suspense est requis car UpdateMeForm lit
 * `useSearchParams` (?from=) pour son lien de retour et sa redirection.
 */
export default function EditProfilePage(): JSX.Element {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Suspense fallback={<div>Chargement…</div>}>
        <UpdateMeForm />

        <section className="mt-12 border-t pt-8">
          <h2 className="mb-4 text-lg font-semibold">Sécurité</h2>
          <ChangePasswordForm />
        </section>
      </Suspense>
    </div>
  );
}
