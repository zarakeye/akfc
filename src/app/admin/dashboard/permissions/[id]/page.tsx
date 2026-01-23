'use client';

import { trpc } from "@/lib/trpcClient";

interface PermissionPageProps {
  params: {
    id: number;
  };
}

/**
 * Page pour afficher une permission.
 * @param {PermissionPageProps} params - Les paramètres de la page, incluant l'ID de la permission.
 * @returns {JSX.Element} La page affichant la permission.
 */
export default function PermissionPage({params}: PermissionPageProps) {
  const { data: permission, isLoading } = trpc.permission.getById.useQuery({ id: params.id });

  if (isLoading) return <div>Chargement de la permission...</div>;

  if (!permission) return <div>Permission introuvable</div>;

  return (
    <div className="flex flex-col card w-96 bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Permission : {permission.name}</h2>
        <p className="text-gray-500">Description:</p>
        <p>{permission.description ?? "Aucune description disponible"}</p>
      </div>

      <div className="flex justify-end gap-2">
        <button
          className="btn btn-primary bg-gray-600 text-white rounded px-2"
          // onClick={() => {
          //   setUpdateRole(role);
          //   setDisplayRoleCard(null)
          // }}
        >
          Modifier
        </button>
        <button className="btn btn-primary bg-gray-600 text-white rounded px-2">Supprimer</button>
        <button className="btn btn-primary bg-gray-600 text-white rounded px-2">Liste des permissons</button>
      </div>
    </div>
  );
}