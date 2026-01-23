'use client';

import { JSX } from 'react';
import { trpc } from '@lib/trpcClient';
import { Table, type Column } from 'react-ts-tab-lib';
import type { Role } from '@prisma/client';

// interface RolesListProps {
//   setCreating: (creating: 'USER' | 'PERMISSION' | 'ROLE' | 'COURSE' | 'EVENT' | 'STAGE' | 'POST' | 'ACTIVITY_TYPE' | null) => void
//   setOpenList: (open: 'USERS' | 'PERMISSIONS' | 'ROLES' | 'COURSES' | 'EVENTS' | 'STAGES' | 'POSTS' | 'ACTIVITY_TYPES' | null) => void
//   setDisplayingMyInfo: (display: boolean) => void
//   setDisplayRoleCard: (role: Role | null) => void
// }

export default function RolesList(/*{ setCreating, setOpenList, setDisplayingMyInfo, setDisplayRoleCard }: RolesListProps*/): JSX.Element {
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