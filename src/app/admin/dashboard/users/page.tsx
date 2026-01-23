'use client';

import UsersList from "./UsersList";

/**
 * Page displaying the list of users.
 *
 * This page displays a list of all users created in the application.
 * Each user is displayed as a card with its name, email, phone number, and role.
 */
export default function UsersPage() {
  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Liste des utilisateurs</h2>
      <UsersList />
    </>
  );
}