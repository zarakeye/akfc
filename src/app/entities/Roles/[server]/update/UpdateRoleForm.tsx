import { useForm, Controller } from "react-hook-form";
import { JSX, useActionState } from 'react';
import { updateRoleAction } from '@/app/entities/Roles/[server]/update/updateRole.action';
import type { UpdateRoleState } from "@/app/entities/Roles/[server]/update/updateRole.stateType";
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
import type { Role, Permission } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateRoleSchema } from "@/app/entities/Roles/[server]/update/updateRole.schema";
import { AlertCircleIcon, BadgeCheckIcon, CheckIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge";
import type { RoleWithPermissions } from "@/app/entities/Roles/[clients]/RoleCard";

interface UpdateRoleFormProps {
  role: RoleWithPermissions;
}

interface FormValues {
  id: number;
  name: string;
  description: string;
  permissions: number[];
}

export function UpdateRoleForm({role}: UpdateRoleFormProps ): JSX.Element {
  //  1️⃣ Validation client instantanée
  const form = useForm<FormValues>({
    resolver: zodResolver(updateRoleSchema),
    defaultValues: {
      id: role.id,
      name: role.name,
      permissions: role.permissions.map((rp) => rp.permission.id),
      description: role.description ?? '',
    },
    mode: 'onBlur',
  });

  // 2️⃣ State côté serveur (Server Action)
  const [state, formAction, isPending] = useActionState<UpdateRoleState, FormData>(updateRoleAction, { success: false } as UpdateRoleState);

  const { data: permissions, isLoading, isError} = trpc.permission.getAll.useQuery();

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
        <input type="hidden" name="id" value={role.id} />
        <div>
          {/* <FormField
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
          /> */}
          Nom du rôle: {role.name}
        </div>
        <input type="hidden" name="name" value={role.name} />

        {/* description */}
        <div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description du rôle</FormLabel>
                <FormControl>
                  <Input {...field} {...form.register("description")} id="description" type="text" placeholder="Décrivez ce rôle" />
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

        {/* permissions */}
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
                        console.log(field.value);
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

        <Button type="submit" disabled={isPending || state.success}>
          {state.success ? 'Rôle modifié ✅' : isPending ? 'Modifications en cours...' : 'Soumettre'}
        </Button>
      </form>
    </Form>
  );
}