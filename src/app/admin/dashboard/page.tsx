'use client';

import { useState, useEffect, Suspense, JSX } from 'react';
// import { AdminPage } from '@components/admin/AdminPage';
import { Button } from '@/components/ui/Button';
// import { trpcCaller } from '@server/trpc/trpcCaller';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateRoleForm } from '@/app/entities/Roles/[server]/create/CreateRoleForm';
import { CreateUserForm } from '@/app/entities/users/[server]/create/CreateUser.form';
import { CreatePermissionForm } from '@/app/entities/permissions/[server]/create/CreatePermissionForm';
import { trpc } from '@/lib/trpcClient';
import type { Course, Role, User } from '@prisma/client';
import UpdateUserForm from '@/app/entities/users/[server]/update/UpdateUserForm';
import LateralBarDashboard from '@components/client/LateralBarDashboard';
import RolesList from '@/app/entities/Roles/[clients]/RolesList';
import UserCard from '@/app/entities/users/[client]/UserCard';
import PermissionsList from '@/app/entities/permissions/[client]/Permissions.table';
import UsersList from '@/app/entities/users/[client]/UsersList';
import CreateCourseForm from '@/app/entities/courses/[server]/create/CreateCourse.form';
import { CreateActivityTypeForm } from '@/app/entities/categories/[server]/create/CreateCategory.form';
import ActivityTypesList from '@/app/entities/categories/[client]/categories.table';
// import { UpdateRoleForm } from '@/components/admin/UpdateRoleForm';
import RoleCard, { RoleWithPermissions } from '@/app/entities/Roles/[clients]/RoleCard';
import { UpdateRoleForm } from '@/app/entities/Roles/[server]/update/UpdateRoleForm';
import { useUserStore } from '@/lib/stores/useUserStore';

export default function Dashboard(): JSX.Element {
  const [creating, setCreating] = useState<'USER' | 'PERMISSION' | 'ROLE' | 'COURSE' | 'EVENT' | 'STAGE' | 'POST' | 'ACTIVITY_TYPE' | null>(null);
  const [updateRole, setUpdateRole] = useState<RoleWithPermissions | null>(null);
  const [updatedCourse, setUpdatedCourse] = useState<Course | null>(null);
  const [updatedUser, setUpdatedUser] = useState<User | null>(null);
  const [updatedEvent, setUpdatedEvent] = useState<User | null>(null);
  const [displayRoleCard, setDisplayRoleCard] = useState<Role | null>(null);
  const [displayUserCard, setDisplayUserCard] = useState<User | null>(null);
  const [diplayCourseCard, setDisplayCourseCard] = useState<Course | null>(null);
  const [displayEventCard, setDisplayEventCard] = useState<User | null>(null);
  const [displayStageCard, setDisplayStageCard] = useState<User | null>(null);
  const [openList, setOpenList] = useState<'USERS' | 'PERMISSIONS' | 'ROLES' | 'COURSES' | 'EVENTS' | 'STAGES' | 'POSTS' | 'ACTIVITY_TYPES' | null>(null);
  // const [updateUser, setUpdateUser] = useState<boolean>(false);
  const [displayMyInfo, setDisplayMyInfo] = useState<boolean>(true);
  // const { data: user } = trpc.auth.me.useQuery();
  // const [firstLogin, setFirstLogin] = useState<boole
  const currentUser = useUserStore((state) => state.user);
  const session = useUserStore((state) => state.session);


  console.log('currentUser', currentUser);
  const me = {
    ...currentUser
  };
  delete me?.role;
  console.log('me', me);

  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  return (
    <div className='flex min-h-screen'>
      <LateralBarDashboard
        creating setCreating={setCreating}
        openlist setOpenList={setOpenList}
        displayMyInfo setDisplayMyInfo={setDisplayMyInfo}
        currentUser={currentUser}
        setUpdateRole={setUpdateRole}
      />
      <main className='flex flex-col justify-center items-center w-full'>
        {openList === 'ROLES' && (
          <div className='m-10 p-10 border rounded-lg shadow-lg'>
            <h2 className='text-2xl font-bold mb-4'>Liste des rôles</h2>
            <Suspense fallback={<div>Loading roles...</div>}>
              <RolesList setCreating={setCreating} setOpenList={setOpenList} setDisplayingMyInfo={setDisplayMyInfo} setDisplayRoleCard={setDisplayRoleCard} />
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
        {creating === 'COURSE' && (
          <div className='m-10 p-10 border rounded-lg shadow-lg'>
            <h2 className='text-2xl font-bold mb-4'>Créer un nouveau cours</h2>
            <CreateCourseForm />
            <Button variant="secondary" className='mt-4' onClick={() => setCreating(null)}>Annuler</Button>
          </div>
        )}

        {openList === 'ACTIVITY_TYPES' && (
          <div className='m-10 p-10 border rounded-lg shadow-lg'>
            <h2 className='text-2xl font-bold mb-4'>Liste des types d&apos;activités</h2>
            <Suspense fallback={<div>Loading activity types...</div>}>
              <ActivityTypesList />
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

        {creating === 'ACTIVITY_TYPE' && (
          <div className='m-10 p-10 border rounded-lg shadow-lg'>
            <h2 className='text-2xl font-bold mb-4'>Créer un nouveau type d&apos;activité</h2>
            <CreateActivityTypeForm />
            <Button variant="secondary" className='mt-4' onClick={() => setCreating(null)}>Annuler</Button>
          </div>
        )}
        
        {creating === 'EVENT' && (
          <div className='m-10 p-10 border rounded-lg shadow-lg'>
            <h2 className='text-2xl font-bold mb-4'>Créer un nouvel évènement</h2>
            {/* <CreateEventForm /> */}
            <Button variant="secondary" className='mt-4' onClick={() => setCreating(null)}>Annuler</Button>
          </div>
        )}
        
        {creating === 'STAGE' && (
          <div className='m-10 p-10 border rounded-lg shadow-lg'>
            <h2 className='text-2xl font-bold mb-4'>Créer un nouveau stage</h2>
            {/* <CreateStageForm /> */}
            <Button variant="secondary" className='mt-4' onClick={() => setCreating(null)}>Annuler</Button>
          </div>
        )}
        
        {creating === 'POST' && (
          <div className='m-10 p-10 border rounded-lg shadow-lg'>
            <h2 className='text-2xl font-bold mb-4'>Créer un nouveau post</h2>
            {/* <CreatePostForm /> */}
            <Button variant="secondary" className='mt-4' onClick={() => setCreating(null)}>Annuler</Button>
          </div>
        )}
        
        {displayRoleCard && (
          <RoleCard displayRoleCard={displayRoleCard} setDisplayRoleCard={setDisplayRoleCard} setUpdateRole={setUpdateRole} />
        )}

        {updateRole && <UpdateRoleForm role={updateRole}/>}

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