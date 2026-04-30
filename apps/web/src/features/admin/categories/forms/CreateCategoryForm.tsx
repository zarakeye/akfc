import { useForm } from "react-hook-form";
import { JSX, useActionState } from 'react';
import { createCategoryAction } from '@features/admin/categories/actions/createCategory.actions';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCategoryFormSchema } from "@contracts/forms/createCategoryForm.schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form";
import { CreateCategoryState } from "@features/admin/categories/types/createCategoryState.types";


interface FormValues {
  name: string;
}

interface CreateCategoryFormProps {
  setCreating?: (creating: 'USER' | 'PERMISSION' | 'ROLE' | 'COURSE' | 'EVENT' | 'STAGE' | 'POST' | 'ACTIVITY_TYPE' | null) => void;
  setOpenList?: (open: 'USERS' | 'PERMISSIONS' | 'ROLES' | 'COURSES' | 'EVENTS' | 'STAGES' | 'POSTS' | 'ACTIVITY_TYPES' | null) => void;
  setDisplayingMyInfo?: (display: boolean) => void;
}

/**
 * Form to create a new category type.
 *
 * Submits the form data to the server action and handles the response.
 * If the response is successful, shows a success toast and resets the form.
 * If the response is not successful, shows an error message.
 * @param {CreateCategoryFormProps} props - The props of the form.
 * @returns {JSX.Element} A form with a text field and a submit button.
 */
export function CreateCategoryForm( { setCreating, setOpenList, setDisplayingMyInfo }: CreateCategoryFormProps): JSX.Element {
  //  1️⃣ Validation client instantanée
  const form = useForm<FormValues>({
    resolver: zodResolver(createCategoryFormSchema),
    defaultValues: {
      name: '',
    },
    mode: 'onBlur',
  });

  // 2️⃣ State côté serveur (Server Action)
  const [state, formAction, isPending] = useActionState<CreateCategoryState, FormData>(createCategoryAction, {success: false } as CreateCategoryState);

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
                <FormLabel>Nom de la catégorie</FormLabel>
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
