'use client';

import { JSX } from 'react';
import type { Role } from '@prisma/client';
import { trpc } from '@/core/trpc/trpcClient';

/**
 * UpdateUserRoleById
 *
 * Composant d'administration: changer le rôle d'un utilisateur.
 *
 * Pourquoi un composant dédié ?
 * - évite de dupliquer la logique dans UsersList et UserCard
 * - centralise les règles et les messages d'erreurs
 *
 * Règle produit:
 * - l'admin assigne uniquement le rôle
 * - l'utilisateur complète son profil via UpdateMe
 */
export default function UpdateUserRoleById(props: {
  userId: string;
  currentRoleId: number | null;
  roles: Role[];
  onChanged?: () => void;
}): JSX.Element {
  const { userId, currentRoleId, roles, onChanged } = props;

  const updateRole = trpc.user.updateUserRoleById.useMutation();
  const disabled = updateRole.isPending || roles.length === 0;

  return (
    <div className="flex items-center gap-2">
      <select
        className="border rounded px-2 py-1 text-sm"
        disabled={disabled}
        value={currentRoleId ?? ''}
        onChange={async (e) => {
          const nextRoleId = Number(e.target.value);
          if (!Number.isFinite(nextRoleId)) return;
          if (currentRoleId === nextRoleId) return;

          await updateRole.mutateAsync({ userId, roleId: nextRoleId });
          onChanged?.();
        }}
        title={
          disabled
            ? 'Chargement...'
            : "Changer le rôle de cet utilisateur (action admin)"
        }
      >
        <option value="" disabled>
          --
        </option>
        {roles.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>

      {updateRole.error && (
        <span className="text-xs text-red-600" title={updateRole.error.message}>
          Erreur
        </span>
      )}
    </div>
  );
}
