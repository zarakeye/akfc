'use client';

import { JSX } from 'react';
import UserCard from "@features/admin/users/components/UserCard";

/**
 * Page pour afficher une carte utilisateur.
 * @param {Object} params - Les paramètres de la page, incluant l'ID de l'utilisateur.
 * @returns {JSX.Element} La page affichant la carte utilisateur.
 */
export default function UserPage({ params }: { params: { id: string } }): JSX.Element {
  return <UserCard userId={params.id} />;
}