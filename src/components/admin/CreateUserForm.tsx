'use client';

import { useForm } from "react-hook-form";
import { JSX, useActionState } from 'react';
import { createUserAction } from '@/server/actions/createUser.actions';
import  type { CreateUserState } from "@/server/actions/actionState.interfaces";
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
// import { Label } from '@/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  // SelectGroup
  // SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpcClient";
import type { Role } from "@prisma/client";
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserSchema } from "@/server/validation/createUser.schema";
// import { SelectGroup } from "@radix-ui/react-select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";

interface FormValues {
  email: string;
  // password: string;
  roleId: number;
}

/**
 * Form to create a user.
 * It uses the createUserAction server action to handle form submission and displays a success toast when the response is successful.
 * If the response is not successful, it displays an error message.
 * @returns {JSX.Element} A form with email and select fields and a submit button.
 */
export function CreateUserForm(): JSX.Element {
  //  1️⃣ Validation client instantanée
  const form = useForm<FormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      // password: '',
      roleId: undefined,
    },
    mode: 'onBlur',
  });

  // 2️⃣ State côté serveur (Server Action)
  const [state, formAction, isPending]  = useActionState<CreateUserState, FormData>(createUserAction, {success: false } as CreateUserState);
  const { data: roles, isLoading, isError} = trpc.role.getAll.useQuery();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;

  // const password = generateStrongPassword();
  // form.setValue('password', password);

  return (
    <Form {...form}>
      <form
        action={formAction}
        onSubmit={async (e) => {
          const valid = await form.trigger();
          if (!valid) e.preventDefault();
        }}
        className="flex flex-col w-80 space-y-4"
      >
        <div className="mb-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} {...form.register("email")} id="email" type="email"  />
                </FormControl>
                <div className="h-10">
                  <FormMessage/>
                </div>
              </FormItem>
            )}
          />
        </div>
        
        <div className="mb-4 ml-4">
          <FormField
            control={form.control}
            name="roleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rôle</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value !== undefined ? String(field.value) : undefined}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sélectionne un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles?.map((role: Role) => (
                        <SelectItem key={role.id} value={`${role.id}`}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <div className="h-10">
                  <FormMessage/>
                </div>
              </FormItem>
            )}
          />
        </div>
        {/* <input  */}
        <input type="hidden" name="roleId" value={form.getValues('roleId')} />

        {/* --- bouton --- */}

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Création en cours...' : 'Créer'}
        </Button>
        {/* --- succès --- */}
        {state.success && <p className="text-green-500">Utilisateur créé avec succès !</p>}
        {/* --- erreur serveur --- */}
        {state.error &&
          <p className="text-red-500">{state.error}</p>
        }
      </form>
    </Form>
  );
}