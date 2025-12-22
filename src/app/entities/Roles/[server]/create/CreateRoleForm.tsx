import { useForm, Controller } from "react-hook-form";
import { JSX, useActionState } from 'react';
import { createRoleAction } from '@/app/entities/Roles/[server]/create/createRole.action';
import type { CreateRoleState } from "@/app/entities/Roles/[server]/create/createRole.stateType";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Label } from '@components/ui/Label';
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
// import { toast } from 'sonner';
import { trpc } from "@lib/trpcClient";
import type { Permission } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { createRoleSchema } from "@/app/entities/Roles/[server]/create/createRole.schema";
import { AlertCircleIcon, BadgeCheckIcon, CheckIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge";

interface FormValues {
  name: string;
  permissions: number[];
  description: string;
}

export function CreateRoleForm(): JSX.Element {
  //  1️⃣ Validation client instantanée
  const form = useForm<FormValues>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: '',
      permissions: [],
      description: '',
    },
    mode: 'onBlur',
  });

  // 2️⃣ State côté serveur (Server Action)
  const [state, formAction, isPending] = useActionState<CreateRoleState, FormData>(createRoleAction, { success: false } as CreateRoleState);

  const { data: permissions, isLoading, isError} = trpc.permission.getAll.useQuery();

  // /**
  //  * Submits the form data to the server action and handles the response.
  //  * If the response is successful, shows a success toast and resets the form.
  //  */
  // const handleSubmit = form.handleSubmit((values) => {
  //   const formData = new FormData();
  //   Object.entries(values).forEach(([key, value]) => {
  //     formData.append(key, value);
  //   });

  //   formAction(formData);
  // });

  if (isLoading) return <div>Chargement des permissions...</div>;
  if (isError) return <div className="text-red-700">Erreur lors du chargement des permissions !</div>;

  return (
    <Form {...form}>
      <form
        action={formAction}
        onSubmit={async (e) => {
          const valid = await form.trigger();
          if (!valid) e.preventDefault();
        }}
        className="space-y-4 w-80"
      >
        <div>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom du rôle</FormLabel>
                <FormControl>
                  <Input {...field} {...form.register("name")} id="name" type="text"  />
                </FormControl>
                <div className="h-10">
                  <FormMessage/>
                </div>
              </FormItem>
            )}
          />
        </div>

        <Controller
          control={form.control}
          name="permissions"
          render={({ field }) => (
            <div>
              <input type="hidden" name="permissions" value={JSON.stringify(field.value)} />
              <Label className="block text-sm font-medium">Permissions</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">Choisir des permissions</Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] space-y-2">
                  {permissions?.map((permission: Permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center space-x-2 cursor-pointer"
                      onClick={() => {
                        if (field.value.includes(permission.id)) {
                          field.onChange(field.value.filter((id: number) => id !== permission.id));
                          
                        } else {
                          field.onChange([...field.value, permission.id]);
                        }
                      }}
                    >
                      <Checkbox checked={field.value.includes(permission.id)} />
                      <span>{permission.name}</span>
                    </div>
                  ))}
                </PopoverContent>
              </Popover>
              <div className="flex gap-2 mt-2 flex-wrap">
              {field.value.map(id => {
                const perm = permissions?.find((p: Permission) => p.id === id);
                return <Badge key={id} variant="secondary">{perm?.name ?? id}</Badge>;
              })}
            </div>
            {state.error && !form.formState.isValid &&
              <p className="text-red-500 text-sm">{state.error}</p>
            }
            </div>
          )}
        />
        <div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description du rôle</FormLabel>
                <FormControl>
                  <Input {...field} {...form.register("description")} id="description" type="text"  />
                </FormControl>
                <div className="h-10">
                  <FormMessage/>
                </div>
              </FormItem>
            )}
          />
          {form.formState.errors?.description &&
            <p className="text-red-500">{form.formState.errors.description.message}</p>
          }
        </div>

        <Button type="submit" disabled={isPending || state.success}>
          {state.success ? 'Rôle créé ✅' : isPending ? 'Création en cours...' : 'Créer'}
        </Button>
      </form>
    </Form>
  );
}