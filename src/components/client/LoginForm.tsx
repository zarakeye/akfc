'use client';

import { useState } from "react";
import { trpcClient } from "@/lib/trpcClient"; // ou fetch vers /api/auth/login
import { useSessionStore } from "@/lib/stores/useSessionStore";
import { useRouter } from "next/navigation";

/**
 * A React component that renders a login form.
 * It handles form submission by calling the login endpoint
 * and redirecting the user to the homepage if the login is successful.
 * The form has two fields: email and password, and a submit button.
 * If the login fails, it displays an error message.
 */
export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { fetchSession } = useSessionStore();
  const router = useRouter();

  /**
   * Handles the form submission by calling the login endpoint
   * and redirecting the user to the homepage if the login is successful
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Ici tu appelles ton endpoint TRPC ou REST
      const res = await trpcClient.auth.login.mutate({ email, password });
      
      if (res.success) {
        // fetch session après login pour mettre à jour le store
        await fetchSession();
        useSessionStore.getState().setJustLoggedIn(true);
        router.push('/'); // ou router.push('/')
      } else {
        setError(res.error || 'Login failed');
      }
    } catch (err) {
      setError((err as Error).message || 'Login failed');
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
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="border rounded bg-white px-2 py-1"
        />
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="border rounded bg-white px-2 py-1"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}
