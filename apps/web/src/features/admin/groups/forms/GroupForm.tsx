"use client";

import { JSX, startTransition, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Input } from "#components/ui/Input.tsx";
import { Button } from "#components/ui/Button.tsx";
import { trpc } from "#core/trpc/trpcClient.ts";
import { createGroupSchema } from "@akfc/contracts/groups/createGroup.schema.ts";
import { createGroupFormAction } from "#features/admin/groups/actions/createGroupForm.action.ts";
import {
  initialCreateGroupFormState,
  type CreateGroupFormState,
  type CreateGroupFormValues,
} from "#features/admin/groups/actions/createGroupForm.types.ts";

/**
 * Le schéma partagé donne la règle du nom ; le parent (une liste) et la case à cocher n'ont pas de
 * saisie à vérifier : leurs valeurs, telles que le formulaire les tient, sont décrites ici.
 */
const clientSchema = createGroupSchema
  .pick({ name: true })
  .extend({ parentGroupId: z.string(), isCollaborative: z.boolean() });

/**
 * Création d'un groupe : nom + SELECT du groupe parent + case « collaboratif », sur le modèle
 * hybride (React Hook Form + useActionState + server action createGroupFormAction).
 * Sans parent choisi, le service rattache au groupe « Administrateurs »
 * (Administrateurs = ancêtre de tout groupe). Réussite → retour à la liste des groupes.
 */
export function GroupForm(): JSX.Element {
  // Hors du React Compiler : react-hook-form signale ses changements par un proxy (`formState`)
  // que le compilateur ne voit pas ; mémorisé, le rendu ne suivrait plus les erreurs.
  "use no memo";
  const router = useRouter();
  const utils = trpc.useUtils();
  const groupsQuery = trpc.memberGroup.list.useQuery();
  const groups = groupsQuery.data ?? [];

  const [state, formAction, isPending] = useActionState<CreateGroupFormState, FormData>(
    createGroupFormAction,
    initialCreateGroupFormState,
  );

  const form = useForm<CreateGroupFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: { name: "", parentGroupId: "", isCollaborative: false },
    // Erreurs au premier envoi, puis corrigées à la frappe (voir le chapitre sur React Hook Form).
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const { register, setError, formState } = form;

  useEffect(() => {
    if (state.status === "success") {
      void utils.memberGroup.list.invalidate();
      router.push("/dashboard/groups");
      return;
    }
    // Les erreurs de champ renvoyées par le serveur se rangent sous les champs, comme les locales.
    if (state.status !== "error" || !state.fieldErrors) return;
    for (const [field, message] of Object.entries(state.fieldErrors)) {
      if (message) setError(field as keyof CreateGroupFormValues, { type: "server", message });
    }
  }, [state, utils, router, setError]);

  const errMsg = state.status === "error" && !state.fieldErrors ? state.error : null;

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        // Lu tout de suite, tant que l'évènement est disponible.
        const formData = new FormData(e.currentTarget);
        // handleSubmit arrête l'envoi natif, valide, et ne relance l'action que si tout est valide.
        void form.handleSubmit(() => startTransition(() => formAction(formData)))(e);
      }}
      noValidate
      className="max-w-xl space-y-4"
    >
      <div className="space-y-1" data-tour="groups.form.name">
        <label htmlFor="name" className="text-sm font-medium">
          Nom
        </label>
        <Input id="name" type="text" placeholder="Bureau, Compétition…" {...register("name")} />
        {formState.errors.name && (
          <p className="text-sm text-destructive">{formState.errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1" data-tour="groups.form.parent">
        <label htmlFor="parent" className="text-sm font-medium">
          Groupe parent
        </label>
        <select
          id="parent"
          className="w-full rounded-md border border-border px-3 py-2 text-sm"
          {...register("parentGroupId")}
        >
          <option value="">Administrateurs (par défaut)</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          Sans choix, le groupe est rattaché à « Administrateurs ».
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-muted-foreground" data-tour="groups.form.collaborative">
        <input type="checkbox" {...register("isCollaborative")} />
        Espace collaboratif (dossier dédié + droits éditeur/lecteur)
      </label>

      {errMsg && <p className="text-destructive">{errMsg}</p>}

      <div className="flex justify-end" data-tour="groups.form.submit">
        <Button type="submit" disabled={isPending || state.status === "success"}>
          {isPending ? "Création…" : "Créer"}
        </Button>
      </div>
    </form>
  );
}
