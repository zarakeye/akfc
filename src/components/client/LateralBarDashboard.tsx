'use client';

import { JSX } from "react";
import { useSessionStore } from "@/lib/stores/useSessionStore";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LateralBarDashboard(): JSX.Element {
  const router = useRouter();
  const role = useSessionStore(state => state.session?.user?.role);

  return (
    role && role.name === 'ADMIN'
    ? (
      <aside className='w-60 bg-gray-800 text-white p-5'>
        <h2 className="font-bold text-lg mb-4">Centre de contrôle</h2>

        <ul className="space-y-2">

        {['ADMIN', 'COACH'].includes(role.name) && (
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
                    router.push('/admin/dashboard/users');
                  }}
                >
                  Utilisateurs
                </button>
                <button
                  className="w-full text-left cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push('/admin/dashboard/users/create');
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
                    router.push('/admin/dashboard/roles');
                  }}
                >
                  Rôles
                </button>
              
                <button
                  className="w-full text-left cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push('/admin/dashboard/roles/create');
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
                  onClick={() => router.push('admin/dashboard/permissions')}
                >
                  Permissions
                </button>
                <button
                  className="w-full text-left cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push('/admin/dashboard/permissions/create');
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

            {/* Activity categories */}
            <li>
              <div className="flex">
                <button
                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push('/admin/dashboard/categories');
                  }}
                >
                  <span>Catégories d&apos;activités</span>
                </button>
                <button
                  className="w-full text-left cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push('/admin/dashboard/categories/create');
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
                  router.push('/admin/dashboard/courses');
                  }}
                >
                  Cours
                </button>
                <button
                  className="w-full text-left cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push('/admin/dashboard/courses/create');
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
                    router.push('/admin/dashboard/events');
                  }}
                >
                  Évènements
                </button>
                <button
                  className="w-full text-left cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push('/admin/dashboard/events/create');
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
                    router.push('/admin/dashboard/stages');
                  }}
                >
                  Stages
                </button>
                <button
                  className="w-full text-left cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push('/admin/dashboard/stages/create');
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
                    router.push('/admin/dashboard/posts');
                  }}
                >
                  Posts
                </button>
                <button
                  className="w-full cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push('/admin/dashboard/posts/create');
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

            <li>
              <div className="flex">
                <button
                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push('/admin/dashboard/gallery');
                  }}
                >
                  Gallerie
                </button>
                {/* <button
                  className="w-full cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push('/admin/dashboard/posts/create');
                  }}
                >
                  <Image
                    src="/add_circle.svg"
                    alt="Créer un post"
                    width={16}
                    height={16}
                  />
                </button> */}
              </div>
            </li>
          </>
        )}

          <li>
            <button
              className="w-full text-center mt-5"
              onClick={() => {
                router.push('/admin/dashboard');
              }}
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