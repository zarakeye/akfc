'use client';

import { JSX } from 'react';
import UsersList from "@/features/admin/users/components/UsersList";

/**
 * Page displaying the list of users.
 *
 * This page displays a list of all users created in the application.
 * Each user is displayed as a card with its name, email, phone number, and role.
 */
export default function UsersPage(): JSX.Element {
  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Liste des utilisateurs</h2>
      <UsersList />
    </>
  );
}