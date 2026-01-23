'use client';

import PermissionsList from '@/app/admin/dashboard/permissions/PermissionsList';

export default function Permissions() {
  return (
    <div className='m-10 p-10 border rounded-lg shadow-lg'>
      <h2 className='text-2xl font-bold mb-4'>Liste des permissions</h2>
      <PermissionsList />
    </div>
  );
}