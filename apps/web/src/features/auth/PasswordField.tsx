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
