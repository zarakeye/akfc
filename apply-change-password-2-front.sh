#!/usr/bin/env bash
#
# AKFC — Changement de mot de passe, INCRÉMENT 2 : front.
#
# - crée ChangePasswordForm (react-hook-form + zod : changePasswordSchema
#   partagé + refine pour la confirmation), appelle trpc.auth.changePassword,
#   messages clairs (succès + « mot de passe actuel incorrect »). Style aligné
#   sur UpdateMeForm.
# - le monte dans /profil/edit, SOUS UpdateMeForm, dans une section « Sécurité ».
#
# Périmètre : 1 nouveau composant + la page /profil/edit. Un typecheck.
# Usage : bash apply-change-password-2-front.sh
#
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
DIR="apps/web/src/features/auth"
FORM="$DIR/ChangePasswordForm.tsx"
PAGE="apps/web/src/app/(public)/profil/edit/page.tsx"
[ -f "$PAGE" ] || { echo "ERREUR: $PAGE introuvable." >&2; exit 1; }
[ -d "$DIR" ] || mkdir -p "$DIR"
if [ -f "$FORM" ]; then echo "— $FORM existe déjà"; else

cat > "$FORM" <<'TSX'
"use client";

import { useState, type JSX } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { trpc } from "@trpc/trpcClient";
import { changePasswordSchema } from "@contracts/auth/auth.schema";

/**
 * ChangePasswordForm — changement de mot de passe pour l'utilisateur connecté.
 *
 * Autonome (comme AvatarUploader) : ne dépend pas du submit du profil. Vérifie
 * la confirmation côté client (refine), délègue la vérification du mot de passe
 * ACTUEL au serveur (trpc.auth.changePassword). En cas de succès, le serveur a
 * déconnecté les autres appareils ; la session courante reste active.
 */
const formSchema = changePasswordSchema
  .extend({
    confirmPassword: z.string().min(1, "Confirmation requise"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les mots de passe ne correspondent pas",
  });

type FormValues = z.infer<typeof formSchema>;

export default function ChangePasswordForm(): JSX.Element {
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const changePassword = trpc.auth.changePassword.useMutation();

  const onSubmit = handleSubmit(async (values) => {
    setOkMsg(null);
    setErrMsg(null);
    try {
      await changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      reset();
      setOkMsg(
        "Mot de passe modifié. Les autres appareils ont été déconnectés.",
      );
    } catch (e) {
      setErrMsg(
        e instanceof Error ? e.message : "Impossible de changer le mot de passe.",
      );
    }
  });

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4">
      {okMsg && (
        <div className="rounded border border-green-300 bg-green-50 p-3 text-sm text-green-700">
          {okMsg}
        </div>
      )}
      {errMsg && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {errMsg}
        </div>
      )}

      <div className="grid gap-2">
        <label className="grid gap-1">
          <span className="text-sm">Mot de passe actuel</span>
          <input
            type="password"
            autoComplete="current-password"
            className="border rounded px-3 py-2"
            {...register("currentPassword")}
          />
          {errors.currentPassword?.message && (
            <span className="text-xs text-red-600">
              {errors.currentPassword.message}
            </span>
          )}
        </label>

        <label className="grid gap-1">
          <span className="text-sm">Nouveau mot de passe</span>
          <input
            type="password"
            autoComplete="new-password"
            className="border rounded px-3 py-2"
            {...register("newPassword")}
          />
          {errors.newPassword?.message && (
            <span className="text-xs text-red-600">
              {errors.newPassword.message}
            </span>
          )}
        </label>

        <label className="grid gap-1">
          <span className="text-sm">Confirmer le nouveau mot de passe</span>
          <input
            type="password"
            autoComplete="new-password"
            className="border rounded px-3 py-2"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword?.message && (
            <span className="text-xs text-red-600">
              {errors.confirmPassword.message}
            </span>
          )}
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
      >
        {isSubmitting ? "Modification…" : "Changer le mot de passe"}
      </button>
    </form>
  );
}
TSX
echo "  créé  $FORM"
fi

# --- montage dans /profil/edit sous UpdateMeForm ---
python3 - "$PAGE" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "ChangePasswordForm" in s:
    print(f"  — {sys.argv[1]} : déjà monté"); sys.exit(0)

# import
anchor_imp = 'import UpdateMeForm from "@features/admin/users/forms/update-me/UpdateMeForm";'
assert s.count(anchor_imp) == 1, "ancre import UpdateMeForm"
s = s.replace(
    anchor_imp,
    anchor_imp + '\nimport ChangePasswordForm from "@features/auth/ChangePasswordForm";',
)

# section sous UpdateMeForm (dans le Suspense)
anchor_form = "        <UpdateMeForm />"
assert s.count(anchor_form) == 1, "ancre <UpdateMeForm />"
section = anchor_form + '''

        <section className="mt-12 border-t pt-8">
          <h2 className="mb-4 text-lg font-semibold">Sécurité</h2>
          <ChangePasswordForm />
        </section>'''
s = s.replace(anchor_form, section)
p.write_text(s, encoding="utf-8")
print(f"  ok  {sys.argv[1]} (ChangePasswordForm monté)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY — pas de typecheck ni commit"; exit 0; fi
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then TC="check"; else TC="typecheck"; fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -20 || true
  tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"
git add -A
git commit -m "feat(profil): section Sécurité — formulaire de changement de mot de passe" > /tmp/akfc_commit.log 2>&1 \
  && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit: rien ou échec"; tail -3 /tmp/akfc_commit.log; }