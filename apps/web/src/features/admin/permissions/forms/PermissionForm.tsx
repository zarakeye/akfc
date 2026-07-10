"use client";

import { useForm } from "react-hook-form";
import { JSX, useActionState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Permission } from "@prisma/client";

import { savePermissionFormSchema } from "@contracts/forms/savePermissionForm.schema";
import {
  savePermissionFormAction,
  type SavePermissionFormState,
} from "@features/admin/permissions/actions/savePermissionForm.action";
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

/** Form permission — create+edit via `initial?`, pattern hybride. */
export function PermissionForm({ initial }: { initial?: Permission }): JSX.Element {
  const form = useForm<FormValues>({
    resolver: zodResolver(savePermissionFormSchema.pick({ name: true })),
    defaultValues: { name: initial?.name ?? "" },
    mode: "onBlur",
  });

  const utils = trpc.useUtils();
  const [state, formAction, isPending] = useActionState<
    SavePermissionFormState,
    FormData
  >(savePermissionFormAction, {} as SavePermissionFormState);

  useEffect(() => {
    if (state.success) {
      void utils.permission.getAll.invalidate();
      if (initial) void utils.permission.getById.invalidate({ id: initial.id });
    }
  }, [state.success, utils, initial]);

  if (state.success && state.permissionId != null) {
    return (
      <SuccessRedirect
        target={`/dashboard/permissions/${state.permissionId}`}
        message={initial ? "Permission mise à jour." : "Permission créée."}
      />
    );
  }

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

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input {...field} id="name" type="text" placeholder="manage_…" />
              </FormControl>
              <div className="h-6">
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

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