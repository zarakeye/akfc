"use client";

import { JSX } from "react";
import { useSessionStore } from "@lib/stores/useSessionStore";
import Image from "next/image";
import { useRouter } from "next/navigation";

/**
 * Composant du barre latéral de l'application.
 * Il permet d'accéder à l'ensemble des fonctionnalités de l'application.
 * Il est conditionnellement affiché en fonction du rôle de l'utilisateur.
 */
export default function ControlPanelSidebar(): JSX.Element {
  const router = useRouter();
  const role = useSessionStore((state) => state.session?.user?.role);

  return role && role.name === "ADMIN" ? (
    <aside className="w-60 bg-gray-800 text-white p-5">
      <h2 className="font-bold text-lg mb-4">Centre de contrôle</h2>

      <ul className="space-y-2">
        {["ADMIN", "COACH"].includes(role.name) && (
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
                    router.push("/dashboard/users");
                  }}
                >
                  Utilisateurs
                </button>
                <button
                  className="w-full text-left cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push("/dashboard/users/create");
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
                    router.push("/dashboard/roles");
                  }}
                >
                  Rôles
                </button>

                <button
                  className="w-full text-left cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push("/dashboard/roles/create");
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
                  onClick={() => router.push("/dashboard/permissions")}
                >
                  Permissions
                </button>
                <button
                  className="w-full text-left cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push("/dashboard/permissions/create");
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

            {/* Groupes de membres */}
            <li>
              <div className="flex">
                <button
                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => router.push("/dashboard/groups")}
                >
                  Groupes de membres
                </button>
              </div>
            </li>

            {/* Disciplines */}
            <li>
              <div className="flex">
                <button
                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push("/dashboard/disciplines");
                  }}
                >
                  Disciplines
                </button>
                <button
                  className="w-full text-left cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push("/dashboard/disciplines/create");
                  }}
                >
                  <Image
                    src="/add_circle.svg"
                    alt="Créer une discipline"
                    width={16}
                    height={16}
                  />
                </button>
              </div>
            </li>

            {/* Pages du site */}
            <li>
              <div className="flex">
                <button
                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push("/dashboard/site-pages/association");
                  }}
                >
                  Page « L&apos;association »
                </button>
              </div>
            </li>

            {/* Familles de disciplines */}
            <li>
              <div className="flex">
                <button
                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push("/dashboard/discipline-families");
                  }}
                >
                  Familles
                </button>
                <button
                  className="w-full text-left cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push("/dashboard/discipline-families/create");
                  }}
                >
                  <Image
                    src="/add_circle.svg"
                    alt="Créer une famille de disciplines"
                    width={16}
                    height={16}
                  />
                </button>
              </div>
            </li>

            {/* Catégories d'activités */}
            <li>
              <div className="flex">
                <button
                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push("/dashboard/categories");
                  }}
                >
                  <span>Catégories d&apos;activités</span>
                </button>
                <button
                  className="w-full text-left cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push("/dashboard/categories/create");
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

            {/* Origines culturelles */}
            <li>
              <div className="flex">
                <button
                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push("/dashboard/origins");
                  }}
                >
                  Origines
                </button>
                <button
                  className="w-full text-left cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push("/dashboard/origins/create");
                  }}
                >
                  <Image
                    src="/add_circle.svg"
                    alt="Créer une origine culturelle"
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
                    router.push("/dashboard/courses");
                  }}
                >
                  Cours
                </button>
                <button
                  className="w-full text-left cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push("/dashboard/courses/create");
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

            {/* Évènements */}
            <li>
              <div className="flex">
                <button
                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push("/dashboard/events");
                  }}
                >
                  Évènements
                </button>
                <button
                  className="w-full text-left cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push("/dashboard/events/create");
                  }}
                >
                  <Image
                    src="/add_circle.svg"
                    alt="Créer un nouvel évènement"
                    width={16}
                    height={16}
                  />
                </button>
              </div>
            </li>

            {/* Stages */}
            <li>
              <div className="flex">
                <button
                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push("/dashboard/stages");
                  }}
                >
                  Stages
                </button>
                <button
                  className="w-full text-left cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push("/dashboard/stages/create");
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

            {/* Posts */}
            <li>
              <div className="flex">
                <button
                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push("/dashboard/posts");
                  }}
                >
                  Posts
                </button>
                <button
                  className="w-full cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push("/dashboard/posts/create");
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

            {/* Actualités (BreakingNews) */}
            <li>
              <div className="flex">
                <button
                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push("/dashboard/breaking-news");
                  }}
                >
                  Actualités
                </button>
                <button
                  className="w-full text-left cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push("/dashboard/breaking-news/create");
                  }}
                >
                  <Image
                    src="/add_circle.svg"
                    alt="Créer une actualité"
                    width={16}
                    height={16}
                  />
                </button>
              </div>
            </li>

            {/* Bibliothèque */}
            <li>
              <div className="flex">
                <button
                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push("/dashboard/library");
                  }}
                >
                  Bibliothèque
                </button>
                <button
                  className="w-full cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push("/dashboard/library/add");
                  }}
                >
                  <Image
                    src="/add_circle.svg"
                    alt="Ajouter une image ou une vidéo"
                    width={16}
                    height={16}
                  />
                </button>
              </div>
            </li>

            {/* Galeries */}
            <li>
              <div className="flex">
                <button
                  className="w-full pl-1 text-left cursor-pointer transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push("/dashboard/galleries");
                  }}
                >
                  Galeries
                </button>
                <button
                  className="w-full cursor-pointer flex justify-center items-center transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
                  onClick={() => {
                    router.push("/dashboard/galleries/create");
                  }}
                >
                  <Image
                    src="/add_circle.svg"
                    alt="Créer une galerie"
                    width={16}
                    height={16}
                  />
                </button>
              </div>
            </li>
          </>
        )}

        {role.name === "ADMIN" && (
          <li>
            <button
              className="w-full pl-1 text-left cursor-pointer mt-5 transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
              onClick={() => {
                router.push("/dashboard/design-lab");
              }}
            >
              Laboratoire de rendu
            </button>
          </li>
        )}

        <li>
          <button
            className="w-full text-center mt-5"
            onClick={() => {
              router.push("/profil");
            }}
          >
            Mon profil
          </button>
        </li>
      </ul>
    </aside>
  ) : (
    <aside className="w-60 bg-gray-800 text-white p-5"></aside>
  );
}
