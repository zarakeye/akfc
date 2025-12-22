'use client';

import { JSX, useActionState, useEffect, useState } from 'react';
import { updateUserAction } from '@/app/entities/users/[server]/update/updateUser.action';
import type { UpdateUserState } from "@/app/entities/users/[server]/update/updateUser.stateType";
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ChevronDownIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { /*Role,*/ User } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateUserSchema, type FormValues } from '@/app/entities/users/[server]/update/updateUser.schema';
import { useUserStore/*, type SessionUser*/ } from '@/lib/stores/useUserStore';
import { CldUploadWidget, CldUploadButton } from 'next-cloudinary';
import Image from 'next/image';
import { set } from 'zod';
// import { trpc } from '@/lib/trpcClient';
// import { z } from 'zod';

// type FormValues = z.infer<typeof updateUserSchema>;

interface UpdateUserFormProps {
  user: User;
  setFirstLogin?: (firstLogin: boolean) => void;
}

export default function UpdateUserForm({ user, setFirstLogin }: UpdateUserFormProps): JSX.Element {
  const { firstName, lastName, email, roleId, phone, birthDate, isFirstLogin } = user;
  const [open, setOpen] = useState<boolean>(false);
  // const [resource, setResource] = useState();

  const form = useForm<FormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      id: String(user.id),
      firstName: firstName as string ?? '',
      lastName: lastName as string || '',
      email: email as string || '',
      password: '',
      roleId: String(roleId || 0),
      phone: phone as string || '',
      birthDate: birthDate ? new Date(birthDate).toISOString().split('T')[0] : '',
      isFirstLogin: String(isFirstLogin || false),
      avatar: user.avatar ?? '',
    },
    mode: 'onBlur',
  });

  const [state, formAction, isPending] = useActionState<UpdateUserState, FormData>(updateUserAction, { success: false } as UpdateUserState);

  // const setUser = useUserStore(s => s.setUser);
  // const currentUser = useUserStore(s => s.user);
  // useEffect(() => {
  //   if (state.success && currentUser?.id === user.id) {
  //     const values = form.getValues();
  //     const roleQuery = trpc.role.getById.useQuery({ id: Number(values.roleId) });

  //     const updatedUser: SessionUser = {
  //       ...user,
  //       firstName: values.firstName,
  //       lastName: values.lastName,
  //       email: values.email,
  //       password: values.password || user.password,
  //       roleId: Number(values.roleId ?? user.roleId),
  //       phone: values.phone as string,
  //       birthDate: values.birthDate ? new Date(values.birthDate) : null,
  //       isFirstLogin: values.isFirstLogin === 'true' ? true : false,
  //       role: roleQuery.data as Role,
  //     };
  //     setUser(updatedUser);
  //   }
  // }, [state.success, form, setUser, user]);

  const fetchUser = useUserStore(s => s.fetchUser);
  const currentUser = useUserStore.getState().user;

  useEffect(() => {
    if (state.success && currentUser?.id === user.id) {
      void fetchUser();
      if (setFirstLogin) setFirstLogin(false);
    }
  }, [state.success, fetchUser, user, currentUser, setFirstLogin]);

  return (
    <Form {...form}>
      <form
        action={formAction}
        onSubmit={async (e) => {
          const valid = await form.trigger();
          if (!valid) e.preventDefault();
        }}  
        className="flex flex-col gap-4"
      >
        <div>
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom</FormLabel>
                <FormControl>
                  <Input {...field} {...form.register("firstName")} id="firstName" type="text"  />
                </FormControl>
                <div className="h-10">
                  <FormMessage/>
                </div>
              </FormItem>
            )}
          />
          {form.formState.errors.firstName && 
            <p className="text-red-500">{form.formState.errors.firstName.message}</p>
          }
        </div>

        <div>
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de famille</FormLabel>
                <FormControl>
                  <Input {...field} {...form.register("lastName")} id="lastName" type="text"  />
                </FormControl>
                <div className="h-10">
                  <FormMessage/>
                </div>
              </FormItem>
            )}
          />
          {form.formState.errors.lastName && 
            <p className="text-red-500">{form.formState.errors.lastName.message}</p>
          }
        </div>

        <div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} {...form.register("email")} id="email" type="text"  />
                </FormControl>
                <div className="h-10">
                  <FormMessage/>
                </div>
              </FormItem>
            )}
          />
          {form.formState.errors.email && 
            <p className="text-red-500">{form.formState.errors.email.message}</p>
          }
        </div>

        <div>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe</FormLabel>
                <FormControl>
                  <Input {...field} {...form.register("password")} id="password" type="text"  />
                </FormControl>
                <div className="h-10">
                  <FormMessage/>
                </div>
              </FormItem>
            )}
          />
          {form.formState.errors.password && 
            <p className="text-red-500">{form.formState.errors.password.message}</p>
          }
        </div>

        <div className="flex flex-col gap-3">
          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de naissance</FormLabel>
                <FormControl>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="birthDate"
                        className="w-48 justify-between font-normal"
                      >
                        {field.value ? new Date(field.value).toLocaleDateString() : "Sélectionnez une date"}
                        <ChevronDownIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        captionLayout="dropdown"
                        onSelect={(selected) => {
                          if (selected) {
                            field.onChange(selected.toISOString().split("T")[0]);
                            setOpen(false);
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <div className="h-10">
                  <FormMessage/>
                </div>
              </FormItem>
            )}
          />
          {form.formState.errors.birthDate && 
            <p className="text-red-500">{form.formState.errors.birthDate.message}</p>
          }
        </div>

        <div>
          <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Téléphone</FormLabel>
              <FormControl>
                <Input {...field} type="phone" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.formState.errors.phone && 
          <p className="text-red-500">{form.formState.errors.phone.message}</p>
        }
        </div>
        <input type="hidden" {...form.register("id")} />
        <input type="hidden" {...form.register("isFirstLogin")} />
        <input type="hidden" {...form.register("roleId")}/>
        <input
          type="hidden"
          {...form.register("birthDate")}
          value={form.getValues("birthDate") || ""}
        />

        <div className="flex flex-col gap-2">
          <FormLabel>Photo de profil</FormLabel>

          {/* Preview si image déjà définie */}
          {form.watch("avatar") && (
            <Image
              src={form.watch("avatar")!}
              alt="preview"
              className="w-24 h-24 rounded-full object-cover"
              width={500}
              height={500}
              sizes="(max-width: 768px) 100px, 200px"
            />
          )}

          <CldUploadWidget
            uploadPreset="akfc_preset"
            onSuccess={(result) => {
              // @ts-expect-error Cloudinary type
              const url = result?.info?.secure_url as string;
              form.setValue("avatar", url, { shouldValidate: true });
            }}
          >
            {({ open }) => (
              <Button type="button" variant="secondary" onClick={() => open()}>
                Upload photo
              </Button>
            )}
          </CldUploadWidget>

          {/* Bouton "supprimer" */}
          {form.watch("avatar") && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                form.setValue("avatar", "", { shouldValidate: true });
              }}
            >
              Supprimer le cliché
            </Button>
          )}

          <input type="hidden" {...form.register("avatar")} />

          {}
        </div>


        {/* --- erreur serveur --- */}
        {state.error && !form.formState.isValid &&
          <p className="text-red-500">{state.error}</p>
        }

        {/* --- bouton --- */}
        <div className="flex gap-3.5 justify-end">
          {/* <Button type="button" onClick={() => setCreatingPermission(false)}>Annuler</Button> */}
          <Button type="submit" disabled={isPending} className="">
            {isPending ? 'enregistrement en cours...' : 'Modifier'}
          </Button>
        </div>
      </form>
    </Form>
  );
}