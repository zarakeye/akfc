'use client';

import { useState, useEffect, Suspense } from 'react';
// import { AdminPage } from '@components/admin/AdminPage';
import { Button } from '@/components/ui/Button';
import { trpcCaller } from '@server/trpc/trpcCaller';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateRoleForm } from '@/components/admin/CreateRoleForm';
import { CreateUserForm } from '@/components/admin/CreateUserForm';
import { CreatePermissionForm } from '@/components/admin/CreatePermissionForm';
import { trpc } from '@/lib/trpcClient';
import type { User } from '@prisma/client';
import UpdateUserForm from '@/components/admin/UpdateUserForm';
import { prisma } from '@server/prisma';
import { getClientSession } from '@/lib/session/session.client';
import LateralBarDashboard from '@components/client/LateralBarDashboard';
import type { SessionUser } from '@lib/stores/useUserStore.ts';
import RolesList from '@components/client/RolesList';
import UserCard from '@components/client/UserCard';
import { tr } from 'zod/v4/locales';
import { set } from 'zod';
import PermissionsList from '@/components/client/PermissionsList';
import UsersList from '@/components/client/UsersList';
import CreateCourseForm from '@/components/admin/CreateCourseForm';
// import { Session } from 'inspector/promises';

export default function Dashboard() {
  const [creating, setCreating] = useState<'USER' | 'PERMISSION' | 'ROLE' | 'COURSE' | 'EVENT' | 'STAGE' | 'POST' | null>(null);
  const [openList, setOpenList] = useState<'USERS' | 'PERMISSIONS' | 'ROLES' | 'COURSES' | 'EVENTS' | 'STAGES' | 'POSTS' | null>(null);
  // const [updateUser, setUpdateUser] = useState<boolean>(false);
  const [displayMyInfo, setDisplayMyInfo] = useState<boolean>(true);
  // const { data: user } = trpc.auth.me.useQuery();
  // const [firstLogin, setFirstLogin] = useState<boole
  const currentUser = getClientSession();
  const me = {
    ...currentUser
  };
  delete me?.role;

  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  return (
    <div className='flex min-h-screen'>
      <LateralBarDashboard
        creating setCreating={setCreating}
        openlist setOpenList={setOpenList}
        displayMyInfo setDisplayMyInfo={setDisplayMyInfo}
        currentUser={currentUser}
      />
      <main className='flex flex-col items-center'>
        {openList === 'ROLES' && (
          <div className='m-10 p-10 border rounded-lg shadow-lg'>
            <h2 className='text-2xl font-bold mb-4'>Liste des rôles</h2>
            <Suspense fallback={<div>Loading roles...</div>}>
              <RolesList />
            </Suspense>
            <Button
              variant="secondary"
              className='mt-4'
              onClick={() => {
                setOpenList(null);
                setDisplayMyInfo(true);
                setCreating(null);
              }}
            >
              Fermer
            </Button>
          </div>
        )}
        {creating === 'ROLE' && (
          <div className='m-10 p-10 border rounded-lg shadow-lg'>
            <h2 className='text-2xl font-bold mb-4'>Créer un nouveau rôle</h2>
            <CreateRoleForm />
            <Button
              variant="secondary"
              className='mt-4'
              onClick={() => {
                setCreating(null);
                setOpenList('ROLES');
                setDisplayMyInfo(false);
              }}
              >
                Annuler
              </Button>
          </div>
        )}
        {openList === 'USERS' && (
          <div className='m-10 p-10 border rounded-lg shadow-lg'>
            <h2 className='text-2xl font-bold mb-4'>Liste des utilisateurs</h2>
            <Suspense fallback={<div>Loading users...</div>}>
              <UsersList />
            </Suspense>
            <Button variant="secondary" className='mt-4' onClick={() => {
              setOpenList(null);
              setDisplayMyInfo(true);
              setCreating(null);
              }}>
                Annuler
              </Button>
          </div>
        )}
        {creating === 'USER' && (
          <div className='m-10 p-10 border rounded-lg shadow-lg'>
            <h2 className='text-2xl font-bold mb-4'>Créer un nouvel utilisateur</h2>
            <CreateUserForm />
            <Button variant="secondary" className='mt-4' onClick={() => {
              setCreating(null);
              setOpenList('USERS');
              setDisplayMyInfo(false);
            }}>
              Annuler
            </Button>
          </div>
        )}
        {openList === 'PERMISSIONS' && (
          <div className='m-10 p-10 border rounded-lg shadow-lg'>
            <h2 className='text-2xl font-bold mb-4'>Liste des permissions</h2>
            <Suspense fallback={<div>Loading permissions...</div>}>
              <PermissionsList />
            </Suspense>
            <Button variant="secondary" className='mt-4' onClick={() => {
              setOpenList(null);
              setDisplayMyInfo(true);
              setCreating(null);
              }}>
                Annuler
              </Button>
          </div>
        )}
        {creating === 'PERMISSION' && (
          <div className='m-10 p-10 border rounded-lg shadow-lg'>
            <h2 className='text-2xl font-bold mb-4'>Créer une nouvelle permission</h2>
            <CreatePermissionForm setCreating={setCreating} setOpenList={setOpenList} setDisplayingMyInfo={setDisplayMyInfo} />
            <Button variant="secondary" className='mt-4' onClick={() => setCreating(null)}>Annuler</Button>
          </div>
        )}
        {
          creating === 'COURSE' && (
            <div className='m-10 p-10 border rounded-lg shadow-lg'>
              <h2 className='text-2xl font-bold mb-4'>Créer un nouveau cours</h2>
              <CreateCourseForm />
              <Button variant="secondary" className='mt-4' onClick={() => setCreating(null)}>Annuler</Button>
            </div>
          )
        }
        {
          creating === 'EVENT' && (
            <div className='m-10 p-10 border rounded-lg shadow-lg'>
              <h2 className='text-2xl font-bold mb-4'>Créer un nouvel évènement</h2>
              {/* <CreateEventForm /> */}
              <Button variant="secondary" className='mt-4' onClick={() => setCreating(null)}>Annuler</Button>
            </div>
          )
        }
        {
          creating === 'STAGE' && (
            <div className='m-10 p-10 border rounded-lg shadow-lg'>
              <h2 className='text-2xl font-bold mb-4'>Créer un nouveau stage</h2>
              {/* <CreateStageForm /> */}
              <Button variant="secondary" className='mt-4' onClick={() => setCreating(null)}>Annuler</Button>
            </div>
          )
        }
        {
          creating === 'POST' && (
            <div className='m-10 p-10 border rounded-lg shadow-lg'>
              <h2 className='text-2xl font-bold mb-4'>Créer un nouveau post</h2>
              {/* <CreatePostForm /> */}
              <Button variant="secondary" className='mt-4' onClick={() => setCreating(null)}>Annuler</Button>
            </div>
          )
        }
        {displayMyInfo && (
          <div className='m-10 p-10 border rounded-lg shadow-lg'>
            <h2 className='text-2xl font-bold mb-4'>Mes informations</h2>
            <Suspense fallback={<div>Loading...</div>}>
              <UserCard user={ me as User} />
            </Suspense>
            <Button variant="secondary" className='mt-4' onClick={() => {
              setDisplayMyInfo(false);
              setCreating(null);
              setOpenList(null);
              }}>
                Mettre à jour
              </Button>
          </div>
        )}
      </main>
    </div>
  );
}