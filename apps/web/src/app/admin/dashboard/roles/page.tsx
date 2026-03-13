'use client';

import { JSX } from 'react';
import RolesList from "./RolesList";

/**
 * Page displaying the list of roles.
 *
 * This page displays a list of all roles created in the application.
 * Each role is displayed as a card with its name, description, and permissions.
 */
export default function RolesPage(): JSX.Element {
  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Liste des rôles</h2>
      <RolesList />
    </>
  );
}