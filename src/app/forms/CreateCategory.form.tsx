import { useForm } from "react-hook-form";
import { JSX, useActionState } from 'react';
import { createActivityTypeAction, type CreateCategoryState } from '@/server/actions/createCategory.actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
// import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCategoryFormSchema, type CreateCategoryFormSchema } from "@/server/schemas/createCategoryForm.schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";


interface FormValues {
  type: string;
}

interface CreateCategoryFormProps {
  setCreating?: (creating: 'USER' | 'PERMISSION' | 'ROLE' | 'COURSE' | 'EVENT' | 'STAGE' | 'POST' | 'ACTIVITY_TYPE' | null) => void;
  setOpenList?: (open: 'USERS' | 'PERMISSIONS' | 'ROLES' | 'COURSES' | 'EVENTS' | 'STAGES' | 'POSTS' | 'ACTIVITY_TYPES' | null) => void;
  setDisplayingMyInfo?: (display: boolean) => void;
}

/**
 * Form to create a new permission.
 *
 * Submits the form data to the server action and handles the response.
 * If the response is successful, shows a success toast and resets the form.
 */
export function CreateActivityTypeForm( { setCreating, setOpenList, setDisplayingMyInfo }: CreateCategoryFormProps): JSX.Element {
  //  1️⃣ Validation client instantanée
  const form = useForm<FormValues>({
    resolver: zodResolver(createCategoryFormSchema),
    defaultValues: {
      type: '',
    },
    mode: 'onBlur',
  });

  // 2️⃣ State côté serveur (Server Action)
  const [state, formAction, isPending] = useActionState<CreateCategoryState, FormData>(createActivityTypeAction, {success: false } as CreateCategoryState);

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
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type d&apos;activité</FormLabel>
                <FormControl>
                  <Input {...field} {...form.register("type")} id="type" type="text"  />
                </FormControl>
                <div className="h-10">
                  <FormMessage/>
                </div>
              </FormItem>
            )}
          />
          {form.formState.errors.type && 
            <p className="text-red-500">{form.formState.errors.type.message}</p>
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
            if (setOpenList) setOpenList('ACTIVITY_TYPES');
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
