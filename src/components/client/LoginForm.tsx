'use client';

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, JSX, useState } from "react";
import { AuthAction, type AuthState } from "@server/actions/auth.action";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form";
import { Input } from "@components/ui/Input";
import { Button } from "@components/ui/Button";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { authSchema } from "@server/validation/auth.schema";
import { trpc } from "@lib/trpcClient";
import { useUserStore } from "@lib/stores/useUserStore";

interface FormValues {
  email: string;
  password: string
}

const initialState: AuthState = {
  success: false,
}

/**
 * LoginForm is a form to login to the application.
 * It uses the useForm hook to validate the form data and the useActionState hook to handle the server action.
 * When the form is submitted, it calls the formAction function which handles the server action and updates the state.
 * If the state is successful, it shows a success toast and invalidates the current user query to refetch user data.
 * If the state is an error, it shows an error toast.
 * @returns {JSX.Element} A form with email and password fields and a submit button.
 */
export function LoginForm(): JSX.Element {
  const router = useRouter();

  // 🔐 Server Action state
  const [state, formAction] = useActionState(AuthAction, initialState);
  
  // 📋 Client-side validation
  const form = useForm<FormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: ''
    },
    mode: "onBlur"
  });

  // const utils = trpc.useUtils(); // To immediately update the client cache after login

  // 🔄 Post-login effect
  useEffect(() => {
    if (!state.success) return;

    (async () => {
      const { fetchUser } = useUserStore.getState();
      await fetchUser();
      
      toast.success("Connexion réussie");
      router.push('/');
      router.refresh();
    })();
  }, [state.success, router]);

  // ❌ Error toast (once)
  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state.error]);

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
