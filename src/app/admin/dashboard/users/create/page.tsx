'use client';

import { CreateUserForm } from "@/app/forms/CreateUser.form";

/**
 * Page for creating a new user.
 *
 * Displays a form for creating a new user, with fields for email and role.
 */
export default function CreateUserPage() {
  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Créer un nouvel utilisateur</h2>
      <CreateUserForm />
    </>
  );
}