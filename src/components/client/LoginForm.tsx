'use client';

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, JSX, useState } from "react";
import { AuthAction } from "@server/actions/auth.action";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form";
import { Input } from "@components/ui/Input";
import { Button } from "@components/ui/Button";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { authSchema } from "@server/validation/auth.schema";
import { trpc } from "@lib/trpcClient";
import { AuthState } from "@server/actions/actionState.interfaces";
import { getClientSession } from "@lib/session/session.client";
import { useUserStore } from "@lib/stores/useUserStore";

interface FormValues { email: string; password: string }

/**
 * LoginForm is a form to login to the application.
 * It uses the useForm hook to validate the form data and the useActionState hook to handle the server action.
 * When the form is submitted, it calls the formAction function which handles the server action and updates the state.
 * If the state is successful, it shows a success toast and invalidates the current user query to refetch user data.
 * If the state is an error, it shows an error toast.
 * @returns {JSX.Element} A form with email and password fields and a submit button.
 */
export function LoginForm(): JSX.Element {
  // 2️⃣ State côté serveur (Server Action)
  const [state, formAction] = useActionState(AuthAction, { success: false, error: undefined } as AuthState);
  const router = useRouter();
  const [loginSuccess, setLoginSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 1️⃣ Validation client instantanée
  const form = useForm<FormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: ''
    },
    mode: "onBlur"
  });

  const utils = trpc.useUtils(); // To immediately update the client cache after login

  useEffect(() => {
    const checkSession = async () => { 
      if (state.success) {
        // ⚡ On va chercher l'utilisateur via le store
        const loggedIn = await useUserStore.getState().fetchUser();

        if (loggedIn) {
          toast.success("Connexion réussie !");
          router.push("/admin/dashboard");
          router.refresh();
        } else if (state.error) {
          toast.error("Impossible de récupérer la session");
        }
      } 
    };

    void checkSession();
  }, [state, utils, form, router]);

  // useEffect(() => {
  //   const performLoginSuccessCheck = async () => {
  //     setError(null);
  //     const loginResult = await useUserStore.getState().fetchUser();
  //     if (loginResult) {
  //       setLoginSuccess(true);
  //       setError(null);
  //     }
  //     else {
  //       setLoginSuccess(false);
  //       setError('Email ou mot de passe incorrect');
  //     }
  //   }
  //   void performLoginSuccessCheck();
  // }, [state.success]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     if (loginSuccess) {
  //       router.push('/admin/dashboard');
  //       router.refresh();
  //     } else {
  //       router.push('/');
  //       router.refresh();
  //     }
  //   };
  //   void fetchData();
  // }, [router, loginSuccess]);

  return (
    <Form {...form}>
      <form
        action={formAction}
        onSubmit={async (e) => {
          const valid = await form.trigger();
          if (!valid) e.preventDefault();
        }}
        className="space-y-4"
      >
        <div className="flex flex-col">
          <div className="flex gap-2.5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Email</FormLabel>
                  <FormControl>
                    <Input {...field} id="email" type="email" className="w-[200px] h-[42px] bg-white" />
                  </FormControl>
                  <div className="h-10">
                    <FormMessage/>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Mot de passe</FormLabel>
                  <FormControl>
                    <Input {...field} id="password" type="password" autoComplete="off" className="w-[200px] h-[42px] bg-white" />
                  </FormControl>
                  <div className="w-[200px] h-10">
                    <FormMessage/>
                  </div>
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="">Connexion</Button>
        </div>
        {state.success && toast.success("Connexion réussie !")}
        {state.error && toast.error(state.error)}
      </form>
    </Form>
  );
}
