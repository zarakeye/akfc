'use client';

import { JSX } from 'react';
import PermissionsList from '@/app/admin/dashboard/permissions/PermissionsList';

/**
 * Component displaying the list of all permissions in the application.
 * This component renders a card with a title and the list of permissions.
 * Each permission is displayed as a row in the list with its name and description.
 */
export default function Permissions(): JSX.Element {
  return (
    <div className='m-10 p-10 border rounded-lg shadow-lg'>
      <h2 className='text-2xl font-bold mb-4'>Liste des permissions</h2>
      <PermissionsList />
    </div>
  );
}