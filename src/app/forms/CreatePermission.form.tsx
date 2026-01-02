import { useForm } from "react-hook-form";
import { JSX, useActionState } from 'react';
import { createPermissionFormAction, type CreatePermissionFormState } from '@/server/actions/createPermissionForm.action';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
// import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPermissionFormSchema } from "@/server/schemas/createPermissionForm.schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface FormValues {
  name: string;
}

interface CreatePermissionFormProps {
  setCreating?: (creating: 'USER' | 'PERMISSION' | 'ROLE' | 'COURSE' | 'EVENT' | 'STAGE' | 'POST' | null) => void;
  setOpenList?: (open: 'USERS' | 'PERMISSIONS' | 'ROLES' | 'COURSES' | 'EVENTS' | 'STAGES' | 'POSTS' | null) => void;
  setDisplayingMyInfo?: (display: boolean) => void;
}

/**
 * Form to create a new permission.
 *
 * Submits the form data to the server action and handles the response.
 * If the response is successful, shows a success toast and resets the form.
 */
export function CreatePermissionForm( { setCreating, setOpenList, setDisplayingMyInfo }: CreatePermissionFormProps): JSX.Element {
  //  1️⃣ Validation client instantanée
  const form = useForm<FormValues>({
    resolver: zodResolver(createPermissionFormSchema),
    defaultValues: {
      name: '',
    },
    mode: 'onBlur',
  });

  // 2️⃣ State côté serveur (Server Action)
  const [state, formAction, isPending] = useActionState<CreatePermissionFormState, FormData>(createPermissionFormAction, {} as CreatePermissionFormState);

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

  //   setCreatingPermission(false);
  // });

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
                <FormLabel>Label de la permission</FormLabel>
                <FormControl>
                  <Input {...field} {...form.register("name")} id="name" type="text"  />
                </FormControl>
                <div className="h-10">
                  <FormMessage/>
                </div>
              </FormItem>
            )}
          />
          {form.formState.errors.name && 
            <p className="text-red-500">{form.formState.errors.name.message}</p>
          }
        </div>

        {/* --- erreur serveur --- */}
        {state.error && !form.formState.isValid &&
          <p className="text-red-500">{state.error}</p>
        }

        {/* --- bouton --- */}
        <div className="flex gap-3.5 justify-end">
          <Button type="button" onClick={() => {
            if (setCreating) setCreating(null);
            if (setOpenList) setOpenList('PERMISSIONS');
            if (setDisplayingMyInfo) setDisplayingMyInfo(false);
          }}>Annuler</Button>
          <Button type="submit" disabled={isPending} className="">
            {isPending ? 'Création en cours...' : 'Créer'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
