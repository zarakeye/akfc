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
