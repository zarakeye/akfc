'use client';

import { JSX } from "react";
import { useUserStore } from "@/lib/stores/useSessionStore";
import type { UserEnhanced } from "@/types";
import Image from "next/image";
import { RoleWithPermissions } from "@/app/admin/roles/RoleCard";

interface LateralBarDashboardProps {
  creating: boolean;
  setCreating: (creating: 'USER' | 'PERMISSION' | 'ROLE' | 'COURSE' | 'EVENT' | 'STAGE' | 'POST' | 'ACTIVITY_TYPE' | null) => void;
  openlist: boolean 
  setOpenList: (openList: 'USERS' | 'PERMISSIONS' | 'ROLES' | 'COURSES' | 'EVENTS' | 'STAGES' | 'POSTS' | 'ACTIVITY_TYPES' | null) => void;
  displayMyInfo: boolean;
  setDisplayMyInfo: (updateMe: boolean) => void;

  currentUser: UserEnhanced | null;
  setUpdateRole: (role: RoleWithPermissions | null) => void
}

export default function LateralBarDashboard(
  {
    creating,
    setCreating,
    openlist,
    setOpenList,
    displayMyInfo,
    setDisplayMyInfo,
    currentUser,
    setUpdateRole
  }: LateralBarDashboardProps
): JSX.Element {
  // if (['admin', 'coach'].includes(currentUser.role.name)) {
    
  // }

  // console.log('currentUser.role.name : ', currentUser?.role.name)

  return (
    currentUser?.role && currentUser?.role.name === 'ADMIN'
    ? (
      <aside className='w-60 bg-gray-800 text-white p-5'>
        <h2 className="font-bold text-lg mb-4">Centre de contrôle</h2>

        <ul className="space-y-2">

        {currentUser && ['ADMIN', 'COACH'].includes(currentUser.role.name) && (
          <>
            <li>
              <div className="flex">
                <p className="w-full text-center">Listes</p>
                <p className="w-full text-center">Ajout</p>
              </div>
            </li>

            {/* Utilisateurs */}
            <li>
              <div className="flex">
                <button
                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    setOpenList('USERS');
                    setDisplayMyInfo(false);
                    setCreating(null);
                    setUpdateRole(null);
                  }}
                >
                  Utilisateurs
                </button>
                <button
                  className="w-full text-left cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    setCreating('USER');
                    setDisplayMyInfo(false);
                    setOpenList(null);
                    setUpdateRole(null);
                  }}
                >
                  <Image
                    src="/add_circle.svg"
                    alt="Ajouter un utilisateur"
                    width={16}
                    height={16}
                  />
                </button>
              </div>
            </li>
            
            {/* Rôles */}
            <li>
              <div className="flex">
                <button
                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    setOpenList('ROLES');
                    setDisplayMyInfo(false);
                    setCreating(null);
                    setUpdateRole(null);
                  }}
                >
                  Rôles
                </button>
              
                <button
                  className="w-full text-left cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    setCreating('ROLE');
                    setDisplayMyInfo(false);
                    setOpenList(null);
                    setUpdateRole(null);
                  }}
                >
                  <Image
                    src="/add_circle.svg"
                    alt="Créer un nouveau rôle"
                    width={16}
                    height={16}
                  />
                </button>
              </div>
            </li>
            
            {/* Permissions */}
            <li>
              <div className="flex">
                <button
                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    setOpenList('PERMISSIONS');
                    setDisplayMyInfo(false);
                    setCreating(null);
                    setUpdateRole(null);
                  }}
                >
                  Permissions
                </button>
                <button
                  className="w-full text-left cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    setDisplayMyInfo(false);
                    setOpenList(null);
                    setCreating('PERMISSION');
                    setUpdateRole(null);
                  }}
                >
                  <Image
                    src="/add_circle.svg"
                    alt="Créer une permission"
                    width={16}
                    height={16}
                  />
                </button>
              </div>
            </li>

            {/* Activity types */}
            <li>
              <div className="flex">
                <button
                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    setOpenList('ACTIVITY_TYPES');
                    setDisplayMyInfo(false);
                    setCreating(null);
                    setUpdateRole(null);
                  }}
                >
                  <span>Types d&apos;activités</span>
                </button>
                <button
                  className="w-full text-left cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    setDisplayMyInfo(false);
                    setOpenList(null);
                    setCreating('ACTIVITY_TYPE');
                    setUpdateRole(null);
                  }}
                >
                  <Image
                    src="/add_circle.svg"
                    alt="Créer un type d'activité"
                    width={16}
                    height={16}
                  />
                </button>
              </div>
            </li>
            
            {/* Cours */}
            <li>
              <div className="flex">
                <button
                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    setOpenList('COURSES');
                    setDisplayMyInfo(false);
                    setCreating(null);
                    setUpdateRole(null);
                  }}
                >
                  Cours
                </button>
                <button
                  className="w-full text-left cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    setOpenList(null);
                    setDisplayMyInfo(false);
                    setCreating('COURSE');
                    setUpdateRole(null);
                  }}
                >
                  <Image
                    src="/add_circle.svg"
                    alt="Créer un cours"
                    width={16}
                    height={16}
                  />
                </button>
              </div>
            </li>

            <li>
              <div className="flex">
                <button
                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    setOpenList('EVENTS');
                    setDisplayMyInfo(false);
                    setCreating(null);
                    setUpdateRole(null);
                  }}
                >
                  Évènements
                </button>
                <button
                  className="w-full text-left cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    setOpenList(null);
                    setDisplayMyInfo(false);
                    setCreating('EVENT');
                    setUpdateRole(null);
                  }}
                >
                  <Image
                    src="/add_circle.svg"
                    alt="Créer un nouveau évènement"
                    width={16}
                    height={16}
                  />
                </button>
              </div>
            </li>

            <li>
              <div className="flex">
                <button
                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    setOpenList('STAGES')
                    setDisplayMyInfo(false);
                    setCreating(null);
                    setUpdateRole(null);
                  }}
                >
                  Stages
                </button>
                <button
                  className="w-full text-left cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    setCreating('STAGE')
                    setDisplayMyInfo(false);
                    setOpenList(null);
                    setUpdateRole(null);
                  }}
                >
                  <Image
                    src="/add_circle.svg"
                    alt="Créer un nouveau stage"
                    width={16}
                    height={16}
                  />
                </button>
              </div>
            </li>

            <li>
              <div className="flex">
                <button
                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    setOpenList('POSTS')
                    setDisplayMyInfo(false);
                    setCreating(null);
                    setUpdateRole(null);
                  }}
                >
                  Posts
                </button>
                <button
                  className="w-full cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    setOpenList(null);
                    setDisplayMyInfo(false);
                    setCreating('POST');
                    setUpdateRole(null);
                  }}
                >
                  <Image
                    src="/add_circle.svg"
                    alt="Créer un post"
                    width={16}
                    height={16}
                  />
                </button>
              </div>
            </li>
          </>
        )}

          <li>
            <button
              className="w-full text-center mt-5"
              onClick={() => setDisplayMyInfo(!displayMyInfo)}
            >
              Mon profil
            </button>
          </li>
        </ul>
      </aside>
    )
    : (
      <aside className='w-60 bg-gray-800 text-white p-5'>
      </aside>
    )
  );
}