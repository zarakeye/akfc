#!/usr/bin/env bash
# AKFC — PasswordField partagé (toggle œil) + ChangePasswordForm l'utilise.
# PasswordField (forwardRef) accepte RHF (register) ET contrôlé (value/onChange).
# ⚠️ Remplace apply-change-password-eye-toggle.sh (ne pas lancer ce dernier).
# Usage : bash apply-password-field-shared.sh
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
DIR="apps/web/src/features/auth"
PF="$DIR/PasswordField.tsx"
CPF="$DIR/ChangePasswordForm.tsx"
[ -f "$CPF" ] || { echo "ERREUR: $CPF introuvable (applique d'abord l'incrément 2)." >&2; exit 1; }

cat > "$PF" <<'TSX'
"use client";

import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
} from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

/**
 * Champ mot de passe masqué (type password) avec toggle œil (afficher/masquer).
 * Flexible : accepte react-hook-form (spread de register, ref forwardé) OU un
 * usage contrôlé (value/onChange). Style aligné sur les formulaires du site.
 */
export const PasswordField = forwardRef<HTMLInputElement, Props>(
  function PasswordField({ label, error, className, ...inputProps }, ref) {
    const [show, setShow] = useState(false);
    return (
      <label className="grid gap-1">
        <span className="text-sm">{label}</span>
        <div className="relative">
          <input
            ref={ref}
            type={show ? "text" : "password"}
            className={`w-full rounded border px-3 py-2 pr-10 ${className ?? ""}`}
            {...inputProps}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            aria-pressed={show}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 transition-colors hover:text-gray-700"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </label>
    );
  },
);
TSX
echo "  ok  $PF"

cat > "$CPF" <<'TSX'
"use client";

import { useState, type JSX } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { trpc } from "@trpc/trpcClient";
import { changePasswordSchema } from "@contracts/auth/auth.schema";
import { PasswordField } from "@features/auth/PasswordField";

/**
 * ChangePasswordForm — changement de mot de passe (utilisateur connecté).
 * Confirmation vérifiée côté client (refine) ; mot de passe ACTUEL vérifié côté
 * serveur. Succès → le serveur a déconnecté les autres appareils ; session
 * courante conservée. Champs masqués + toggle œil (PasswordField partagé).
 */
const formSchema = changePasswordSchema
  .extend({ confirmPassword: z.string().min(1, "Confirmation requise") })
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
      setOkMsg("Mot de passe modifié. Les autres appareils ont été déconnectés.");
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
        <PasswordField
          label="Mot de passe actuel"
          autoComplete="current-password"
          error={errors.currentPassword?.message}
          {...register("currentPassword")}
        />
        <PasswordField
          label="Nouveau mot de passe"
          autoComplete="new-password"
          error={errors.newPassword?.message}
          {...register("newPassword")}
        />
        <PasswordField
          label="Confirmer le nouveau mot de passe"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
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
echo "  ok  $CPF (utilise PasswordField)"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY"; exit 0; fi
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
TC=$(node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null && echo check || echo typecheck)
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head -15; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"; git add -A
git commit -m "feat(auth): PasswordField partagé (toggle œil) + ChangePasswordForm" >/tmp/c.log 2>&1 && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }