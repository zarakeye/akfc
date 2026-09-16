'use client';

import { JSX, useMemo, useState, type FormEvent } from "react";
import { trpcClient } from "@trpc/trpcClient";
import { useSessionStore } from "@lib/stores/useSessionStore";
import { useRouter } from "next/navigation";
import { AUTH_ERRORS } from "@features/auth/errors/auth.errors";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginForm(): JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const loginSuccess = useSessionStore((state) => state.loginSuccess);
  const router = useRouter();

  const emailTrimmed = email.trim();

  const validationMessage = useMemo(() => {
    if (!emailTrimmed && !password) {
      return 'Please fill in your email and password.';
    }

    if (!emailTrimmed) {
      return 'Please enter your email address.';
    }

    if (!isValidEmail(emailTrimmed)) {
      return 'Please enter a valid email address.';
    }

    if (!password) {
      return 'Please enter your password.';
    }

    if (password.length < 12) {
      return 'Password must be at least 12 characters long.';
    }

    return null;
  }, [emailTrimmed, password]);

  const isFormValid = validationMessage === null;
  const buttonTitle = loading
    ? 'Logging in...'
    : validationMessage ?? 'Submit login form';

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isFormValid) {
      setError(validationMessage);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await trpcClient.auth.login.mutate({
        email: emailTrimmed,
        password,
      });

      if (!res.success) {
        setError(AUTH_ERRORS[res.error as keyof typeof AUTH_ERRORS] ?? AUTH_ERRORS.DEFAULT);
        return;
      }

      const session = await trpcClient.auth.getSession.query();

      if (!session) {
        setError('Login succeeded, but the session could not be restored.');
        return;
      }

      loginSuccess(session);
      router.push('/');
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex gap-2">
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Email"
          required
          aria-invalid={!!error && (!emailTrimmed || !isValidEmail(emailTrimmed))}
          className="border rounded bg-white px-2 py-1"
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Password"
            required
            aria-invalid={!!error && (!password || password.length < 12)}
            className="border rounded bg-white px-2 py-1 pr-9"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 transition-colors hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !isFormValid}
        title={buttonTitle}
        className={[
          "px-4 py-2 rounded text-white transition-opacity",
          loading || !isFormValid
            ? "bg-blue-500 opacity-60 cursor-not-allowed"
            : "bg-blue-500 hover:opacity-90"
        ].join(' ')}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>

      {error && <p className="text-red-500">{error}</p>}

      <Link
        href="/auth/forgot-password"
        className="text-sm text-blue-600 hover:underline"
      >
        Mot de passe oublié ?
      </Link>
    </form>
  );
}