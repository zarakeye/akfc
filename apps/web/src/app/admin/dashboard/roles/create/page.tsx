'use client';

import { JSX } from 'react';
import { CreateRoleForm } from "@features/admin/roles/forms/CreateRoleForm";

/**
 * Page for creating a new role.
 *
 * Displays a form for creating a new role, with fields for name, description, and permissions.
 */
export default function CreateRolePage(): JSX.Element {
  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Créer un rôle</h2>
      <CreateRoleForm />
    </>
  );
}