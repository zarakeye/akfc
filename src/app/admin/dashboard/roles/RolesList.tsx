'use client';

import { JSX } from 'react';
import { trpc } from '@lib/trpcClient';
import { Table, type Column } from 'react-ts-tab-lib';
import type { Role } from '@prisma/client';

/**
 * RolesList component
 * 
 * This component is responsible for displaying a list of all roles from the database.
 * It uses the trpc.role.getAll hook to fetch the data and the react-ts-tab-lib library to render the table.
 * The component also handles loading and error states for the roles data.
 * 
 * @returns {JSX.Element} A JSX element representing the RolesList component.
 */
export default function RolesList(): JSX.Element {
  const { data: roles, isLoading, isError } = trpc.role.getAll.useQuery();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading roles.</div>;

  const columns: Column<Role>[] = [
    {
      property: 'id',
      displayName: 'ID',
      type: 'number',
    },
    {
      property: 'name',
      displayName: 'Rôle',
      type: 'string',
    },
    {
      property: 'description',
      displayName: 'Description',
      type: 'string',
    },
  ];


  return (
    <>
      <Table
        columns={columns}
        rows={roles || []}
        // onRowClick={(role: Role | null) => {
        //   setCreating(null);
        //   setOpenList(null);
        //   setDisplayingMyInfo(false);
        //   setDisplayRoleCard(role);
        // }}
      />

      
    </>
  );
}