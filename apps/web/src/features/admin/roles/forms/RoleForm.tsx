"use client";

import { useForm } from "react-hook-form";
import { JSX, useActionState, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Role } from "@prisma/client";

import { saveRoleFormSchema } from "@contracts/forms/saveRoleForm.schema";
import {
  saveRoleFormAction,
  type SaveRoleFormState,
} from "@features/admin/roles/actions/saveRoleForm.action";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/ui/form";
import { Input } from "@components/ui/Input";
import { Button } from "@components/ui/Button";
import { trpc } from "@trpc/trpcClient";
import { SuccessRedirect } from "@features/admin/common/components/SuccessRedirect";

interface FormValues {
  name: string;
}

interface RoleFormProps {
  initial?: Role;
  /** Ids des permissions déjà assignées (édition). */
  initialPermissionIds?: number[];
}

/**
 * Form rôle — create+edit via `initial?`, pattern hybride. Le `name` passe par
 * RHF ; les permissions cochées vivent en état local et partent dans l'input
 * caché `permissionIds` (JSON), que l'action remplace en deleteMany + create.
 */
export function RoleForm({
  initial,
  initialPermissionIds = [],
}: RoleFormProps): JSX.Element {
  const form = useForm<FormValues>({
    resolver: zodResolver(saveRoleFormSchema.pick({ name: true })),
    defaultValues: { name: initial?.name ?? "" },
    mode: "onBlur",
  });

  const [selectedIds, setSelectedIds] =
    useState<number[]>(initialPermissionIds);

  const utils = trpc.useUtils();
  const { data: permissions, isLoading: permsLoading } =
    trpc.permission.getAll.useQuery();
  const [state, formAction, isPending] = useActionState<
    SaveRoleFormState,
    FormData
  >(saveRoleFormAction, {} as SaveRoleFormState);

  useEffect(() => {
    if (state.success) {
      void utils.role.getAll.invalidate();
      if (initial) {
        void utils.role.getById.invalidate({ id: initial.id });
        void utils.role.getByIdWithPermissions.invalidate({ id: initial.id });
      }
    }
  }, [state.success, utils, initial]);

  if (state.success && state.roleId != null) {
    return (
      <SuccessRedirect
        target={`/dashboard/roles/${state.roleId}`}
        message={initial ? "Rôle mis à jour." : "Rôle créé."}
      />
    );
  }

  const togglePermission = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <Form {...form}>
      <form
        action={formAction}
        onSubmit={async (e) => {
          if (!(await form.trigger())) e.preventDefault();
        }}
        className="max-w-md space-y-4"
      >
        {initial && <input type="hidden" name="id" value={initial.id} />}
        <input
          type="hidden"
          name="permissionIds"
          value={JSON.stringify(selectedIds)}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input {...field} id="name" type="text" placeholder="ADMIN, EDITOR…" />
              </FormControl>
              <div className="h-6">
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <div>
          <p className="mb-2 text-sm font-medium">Permissions</p>
          {permsLoading ? (
            <p className="text-sm text-muted-foreground">
              Chargement des permissions…
            </p>
          ) : (
            <ul className="flex max-h-72 flex-col gap-1 overflow-auto rounded border border-border p-3">
              {(permissions ?? []).map((p) => (
                <li key={p.id}>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(p.id)}
                      onChange={() => togglePermission(p.id)}
                    />
                    <span className="font-mono">{p.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        {state.error && <p className="text-red-500">{state.error}</p>}

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Enregistrement…" : initial ? "Mettre à jour" : "Créer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}