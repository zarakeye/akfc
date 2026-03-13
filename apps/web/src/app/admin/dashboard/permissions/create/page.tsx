"use client";

import { JSX } from 'react';
import { CreatePermissionForm } from "@/features/admin-forms/components/CreatePermission.form";

/**
 * Page to create a new permission.
 *
 * Displays a form to create a new permission.
 * Submits the form data to the server action and handles the response.
 * If the response is successful, shows a success toast and resets the form.
 */
export default function CreatePermissionPage(): JSX.Element {
  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Créer une permission</h2>
      <CreatePermissionForm />
    </>
  );
}